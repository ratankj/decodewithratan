import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardEntry {
  display_name: string;
  level: number;
  xp_points: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('display_name, level, xp_points')
      .order('xp_points', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setEntries(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-6 w-6 text-warning" />
          <h1 className="text-2xl font-bold">Leaderboard</h1>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-muted-foreground">No students yet. Be the first!</p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            {entries.map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center justify-between p-4 ${
                  i < entries.length - 1 ? 'border-b border-border' : ''
                } ${i < 3 ? 'bg-card' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 text-center font-mono font-bold text-sm ${
                    i === 0 ? 'text-warning' : i === 1 ? 'text-muted-foreground' : i === 2 ? 'text-warning/60' : 'text-muted-foreground'
                  }`}>
                    {i < 3 ? <Medal className="h-5 w-5 inline" /> : `#${i + 1}`}
                  </span>
                  <span className="font-medium">{e.display_name ?? 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Lv {e.level}</span>
                  <span className="font-mono text-primary font-semibold">{e.xp_points} XP</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
