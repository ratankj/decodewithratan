import { useAuth } from '@/hooks/useAuth';
import { challenges } from '@/lib/challenges';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Target, Flame } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function Dashboard() {
  const { profile } = useAuth();

  const stats = [
    { icon: Trophy, label: 'XP Points', value: profile?.xp_points ?? 0, color: 'text-primary' },
    { icon: Target, label: 'Challenges', value: challenges.length, color: 'text-info' },
    { icon: Flame, label: 'Level', value: profile?.level ?? 1, color: 'text-warning' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">
            Welcome back, <span className="text-primary">{profile?.display_name ?? 'Student'}</span>
          </h1>
          <p className="text-muted-foreground mb-8">Continue your SQL journey</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <span className="text-sm text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-3xl font-bold mt-2 font-mono">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <h2 className="text-lg font-semibold mb-4">Recent Challenges</h2>
        <div className="grid gap-3">
          {challenges.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Link
                to={`/challenges/${c.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold ${
                      c.difficulty === 'EASY'
                        ? 'bg-success/20 text-success'
                        : c.difficulty === 'MEDIUM'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-destructive/20 text-destructive'
                    }`}
                  >
                    {c.difficulty}
                  </span>
                  <span className="font-medium group-hover:text-primary transition-colors">{c.title}</span>
                </div>
                <span className="text-muted-foreground text-sm">→</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
