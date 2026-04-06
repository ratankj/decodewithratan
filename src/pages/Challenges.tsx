import { useParams, Link, useNavigate } from 'react-router-dom';
import SqlEditor from '@/components/SqlEditor';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState, useCallback } from 'react';

interface Challenge {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  expected_output: string;
  schema_info: string;
  setup_sql: string;
  solution_sql: string;
  table_preview: { columns: string[]; rows: (string | number | null)[][] };
}

export default function Challenges() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) setChallenges(data as unknown as Challenge[]);
      setLoadingChallenges(false);
    };
    fetch();
  }, []);

  const fetchCompletions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('challenge_completions')
      .select('challenge_id')
      .eq('user_id', user.id);
    if (data) {
      setCompletedIds(new Set(data.map((d: any) => d.challenge_id)));
    }
  }, [user]);

  useEffect(() => {
    fetchCompletions();
  }, [fetchCompletions]);

  const isUnlocked = (index: number) => {
    if (index === 0) return true;
    return completedIds.has(challenges[index - 1].id);
  };

  const selected = id ? challenges.find((c) => c.id === id) : null;
  const selectedIndex = selected ? challenges.findIndex((c) => c.id === selected.id) : -1;

  useEffect(() => {
    if (selected && selectedIndex >= 0 && !isUnlocked(selectedIndex) && challenges.length > 0) {
      navigate('/challenges/' + challenges[0].id, { replace: true });
    }
  }, [selected, selectedIndex, completedIds, challenges]);

  useEffect(() => {
    if (!id && challenges.length > 0) {
      navigate('/challenges/' + challenges[0].id, { replace: true });
    }
  }, [id, challenges]);

  if (loadingChallenges) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-border bg-card/50 p-4 flex-shrink-0 overflow-y-auto">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            SQL Practice Set
          </h3>
          {challenges.map((c, index) => {
            const unlocked = isUnlocked(index);
            const completed = completedIds.has(c.id);

            return unlocked ? (
              <Link
                key={c.id}
                to={`/challenges/${c.id}`}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm mb-1 transition-colors ${
                  selected?.id === c.id
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <span className="truncate flex items-center gap-2">
                  {completed && <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                  {c.title}
                </span>
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
              </Link>
            ) : (
              <div
                key={c.id}
                className="flex items-center justify-between px-3 py-2 rounded-md text-sm mb-1 text-muted-foreground/40 cursor-not-allowed"
              >
                <span className="truncate flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                  {c.title}
                </span>
              </div>
            );
          })}
        </aside>

        {selected && isUnlocked(selectedIndex) ? (
          <div className="flex-1 flex overflow-hidden">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-[420px] flex-shrink-0 border-r border-border overflow-y-auto p-6"
            >
              <span
                className={`rounded px-2 py-0.5 text-xs font-bold ${
                  selected.difficulty === 'EASY'
                    ? 'bg-success/20 text-success'
                    : selected.difficulty === 'MEDIUM'
                    ? 'bg-warning/20 text-warning'
                    : 'bg-destructive/20 text-destructive'
                }`}
              >
                {selected.difficulty}
              </span>
              <h2 className="text-xl font-bold mt-3 mb-2">{selected.title}</h2>
              <p className="text-muted-foreground text-sm mb-4">{selected.description}</p>

              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Expected Output
              </h4>
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-sm text-primary font-medium mb-6">
                {selected.expected_output}
              </div>

              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Schema Info
              </h4>
              <div className="rounded-lg bg-muted p-3 font-mono text-sm mb-6">
                {selected.schema_info}
              </div>

              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Table Preview
              </h4>
              <div className="rounded-lg border border-border overflow-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      {selected.table_preview.columns.map((col) => (
                        <th key={col} className="text-left p-2 text-muted-foreground font-medium text-xs">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.table_preview.rows.map((row, i) => (
                      <tr key={i} className="border-b border-border/50">
                        {row.map((cell, j) => (
                          <td key={j} className="p-2 text-xs">
                            {cell === null ? (
                              <span className="text-warning">NULL</span>
                            ) : (
                              String(cell)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <div className="flex-1 flex flex-col">
              <SqlEditor
                setupSQL={selected.setup_sql}
                solutionSQL={selected.solution_sql}
                challengeId={selected.id}
                onSolved={fetchCompletions}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a challenge to begin
          </div>
        )}
      </div>
    </div>
  );
}
