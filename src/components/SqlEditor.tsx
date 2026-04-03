import { useState, useCallback, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import initSqlJs, { Database } from 'sql.js';

interface Props {
  setupSQL: string;
}

export default function SqlEditor({ setupSQL }: Props) {
  const [code, setCode] = useState('/* Start your solution */');
  const [results, setResults] = useState<{ columns: string[]; rows: any[][] } | null>(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const dbRef = useRef<Database | null>(null);

  useEffect(() => {
    return () => {
      dbRef.current?.close();
    };
  }, []);

  const runCode = useCallback(async () => {
    setRunning(true);
    setError('');
    setResults(null);
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
      });
      dbRef.current?.close();
      const db = new SQL.Database();
      dbRef.current = db;
      db.run(setupSQL);
      const res = db.exec(code);
      if (res.length > 0) {
        setResults({ columns: res[0].columns, rows: res[0].values });
      } else {
        setResults({ columns: ['Result'], rows: [['Query executed successfully (no rows returned)']] });
      }
    } catch (e: any) {
      setError(e.message || 'Error executing query');
    }
    setRunning(false);
  }, [code, setupSQL]);

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
      <div className="p-3 border-t border-border flex justify-end">
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
