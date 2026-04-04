import { useState, useCallback, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle2 } from 'lucide-react';
import initSqlJs, { Database } from 'sql.js';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  setupSQL: string;
  solutionSQL: string;
  challengeId: string;
  onSolved?: () => void;
}

export default function SqlEditor({ setupSQL, solutionSQL, challengeId, onSolved }: Props) {
  const { user } = useAuth();
  const [code, setCode] = useState('/* Start your solution */');
  const [results, setResults] = useState<{ columns: string[]; rows: any[][] } | null>(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [solved, setSolved] = useState(false);
  const dbRef = useRef<Database | null>(null);

  useEffect(() => {
    setCode('/* Start your solution */');
    setSolved(false);
    setResults(null);
    setError('');
  }, [challengeId]);

  useEffect(() => {
    return () => {
      dbRef.current?.close();
    };
  }, []);

  const runCode = useCallback(async () => {
    setRunning(true);
    setError('');
    setResults(null);
    setSolved(false);
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`,
      });
      dbRef.current?.close();

      // Run user query
      const userDb = new SQL.Database();
      userDb.run(setupSQL);
      const userRes = userDb.exec(code);

      // Run expected solution
      const solDb = new SQL.Database();
      solDb.run(setupSQL);
      const solRes = solDb.exec(solutionSQL);
      solDb.close();

      if (userRes.length > 0) {
        setResults({ columns: userRes[0].columns, rows: userRes[0].values });

        // Compare results
        if (solRes.length > 0) {
          const userRows = JSON.stringify(userRes[0].values);
          const solRows = JSON.stringify(solRes[0].values);
          if (userRows === solRows) {
            setSolved(true);
            // Save completion to DB
            if (user) {
              await supabase.from('challenge_completions').upsert(
                { user_id: user.id, challenge_id: challengeId },
                { onConflict: 'user_id,challenge_id' }
              );
              onSolved?.();
            }
          }
        }
      } else {
        setResults({ columns: ['Result'], rows: [['Query executed successfully (no rows returned)']] });
      }

      userDb.close();
      dbRef.current = null;
    } catch (e: any) {
      setError(e.message || 'Error executing query');
    }
    setRunning(false);
  }, [code, setupSQL, solutionSQL, challengeId, user, onSolved]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <span className="text-sm font-mono text-muted-foreground">query.sql</span>
        <button onClick={() => setCode('')} className="text-xs text-muted-foreground hover:text-foreground">
          CLEAR ALL
        </button>
      </div>
      <div className="flex-1 min-h-[200px]">
        <CodeMirror
          value={code}
          onChange={setCode}
          extensions={[sql()]}
          theme={oneDark}
          height="100%"
          style={{ height: '100%' }}
          basicSetup={{ lineNumbers: true, foldGutter: false }}
        />
      </div>
      <div className="p-3 border-t border-border flex justify-between items-center">
        {solved && (
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <CheckCircle2 className="h-5 w-5" />
            Correct! Challenge solved.
          </div>
        )}
        {!solved && <div />}
        <Button onClick={runCode} disabled={running} className="gap-2">
          <Play className="h-4 w-4" />
          {running ? 'Running...' : 'Run Code'}
        </Button>
      </div>
      <div className="border-t border-border">
        <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Output Table
        </div>
        <div className="max-h-[250px] overflow-auto px-4 pb-4">
          {error ? (
            <p className="text-sm text-destructive font-mono">{error}</p>
          ) : results ? (
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-border">
                  {results.columns.map((col) => (
                    <th key={col} className="text-left p-2 text-muted-foreground font-medium">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.rows.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {row.map((cell, j) => (
                      <td key={j} className="p-2">
                        {cell === null ? <span className="text-warning">NULL</span> : String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground italic">Waiting for execution...</p>
          )}
        </div>
      </div>
    </div>
  );
}
