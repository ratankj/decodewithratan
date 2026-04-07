import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Target, Flame, Database, Code, BarChart3 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

const categories = [
  { key: 'SQL', label: 'SQL Questions', icon: Database, description: 'Practice SQL queries, joins, subqueries and more', gradient: 'from-primary/20 to-primary/5', borderColor: 'border-primary/30', iconColor: 'text-primary' },
  { key: 'Python', label: 'Python Questions', icon: Code, description: 'Solve Python coding challenges and algorithms', gradient: 'from-warning/20 to-warning/5', borderColor: 'border-warning/30', iconColor: 'text-warning' },
  { key: 'Pandas', label: 'Pandas Questions', icon: BarChart3, description: 'Data manipulation with Pandas DataFrames', gradient: 'from-success/20 to-success/5', borderColor: 'border-success/30', iconColor: 'text-success' },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const [challengeCounts, setChallengeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      const { data } = await supabase.from('challenges').select('category');
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((d: any) => { counts[d.category] = (counts[d.category] || 0) + 1; });
        setChallengeCounts(counts);
      }
    };
    fetchCounts();
  }, []);

  const totalChallenges = Object.values(challengeCounts).reduce((a, b) => a + b, 0);

  const stats = [
    { icon: Trophy, label: 'XP Points', value: profile?.xp_points ?? 0, color: 'text-primary' },
    { icon: Target, label: 'Challenges', value: totalChallenges, color: 'text-muted-foreground' },
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
          <p className="text-muted-foreground mb-8">Continue your coding journey</p>
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

        <h2 className="text-lg font-semibold mb-4">Choose a Practice Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Link
                to={`/challenges?category=${cat.key}`}
                className={`block rounded-xl border ${cat.borderColor} bg-gradient-to-br ${cat.gradient} p-6 hover:scale-[1.02] transition-all group`}
              >
                <cat.icon className={`h-8 w-8 ${cat.iconColor} mb-3`} />
                <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{cat.label}</h3>
                <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
                <span className="text-xs font-mono text-muted-foreground">
                  {challengeCounts[cat.key] ?? 0} challenges
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
