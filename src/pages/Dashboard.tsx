import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Target, Flame, Database, Code, BarChart3, CheckCircle2, Circle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

const categories = [
  { key: 'SQL', label: 'SQL Questions', icon: Database, description: 'Practice SQL queries, joins, subqueries and more', gradient: 'from-primary/20 to-primary/5', borderColor: 'border-primary/30', iconColor: 'text-primary' },
  { key: 'Python', label: 'Python Questions', icon: Code, description: 'Solve Python coding challenges and algorithms', gradient: 'from-warning/20 to-warning/5', borderColor: 'border-warning/30', iconColor: 'text-warning' },
  { key: 'Pandas', label: 'Pandas Questions', icon: BarChart3, description: 'Data manipulation with Pandas DataFrames', gradient: 'from-success/20 to-success/5', borderColor: 'border-success/30', iconColor: 'text-success' },
];

interface ChallengeInfo {
  id: string;
  category: string;
  difficulty: string;
}

interface SolvedStats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

function computeStats(
  challenges: ChallengeInfo[],
  completedIds: Set<string>,
  categoryFilter: string | null
) {
  const filtered = categoryFilter
    ? challenges.filter((c) => c.category === categoryFilter)
    : challenges;

  const solved: SolvedStats = { total: 0, easy: 0, medium: 0, hard: 0 };
  const totalByDifficulty = { easy: 0, medium: 0, hard: 0, total: filtered.length };

  filtered.forEach((c) => {
    const diff = c.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
    if (diff in totalByDifficulty) totalByDifficulty[diff]++;
    if (completedIds.has(c.id)) {
      solved.total++;
      if (diff in solved) solved[diff]++;
    }
  });

  return { solved, totalByDifficulty };
}

function CircularProgress({ solved, total, size = 120 }: { solved: number; total: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? (solved / total) * 100 : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono">{solved}</span>
        <span className="text-xs text-muted-foreground">/ {total}</span>
      </div>
    </div>
  );
}

function DifficultyBar({ label, solved, total, color }: { label: string; solved: number; total: number; color: string }) {
  const pct = total > 0 ? (solved / total) * 100 : 0;
  const colorMap: Record<string, { bar: string; text: string; dot: string }> = {
    green: { bar: 'bg-green-500', text: 'text-green-500', dot: 'bg-green-500' },
    yellow: { bar: 'bg-yellow-500', text: 'text-yellow-500', dot: 'bg-yellow-500' },
    red: { bar: 'bg-red-500', text: 'text-red-500', dot: 'bg-red-500' },
  };
  const c = colorMap[color] || colorMap.green;

  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${c.dot} shrink-0`} />
      <span className={`text-sm font-medium w-16 ${c.text}`}>{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className={`h-full rounded-full ${c.bar}`}
        />
      </div>
      <span className="text-sm font-mono text-muted-foreground w-12 text-right">
        {solved}/{total}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeInfo[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: challData } = await supabase.from('challenges').select('id, category, difficulty');
      if (challData) setChallenges(challData);

      if (user) {
        const { data: compData } = await supabase
          .from('challenge_completions')
          .select('challenge_id')
          .eq('user_id', user.id);
        if (compData) setCompletedIds(new Set(compData.map((c) => c.challenge_id)));
      }
    };
    fetchData();
  }, [user]);

  const challengeCounts: Record<string, number> = {};
  challenges.forEach((c) => { challengeCounts[c.category] = (challengeCounts[c.category] || 0) + 1; });
  const totalChallenges = challenges.length;

  const { solved, totalByDifficulty } = computeStats(challenges, completedIds, selectedCategory);

  const stats = [
    { icon: Trophy, label: 'XP Points', value: profile?.xp_points ?? 0, color: 'text-primary' },
    { icon: Target, label: 'Challenges', value: totalChallenges, color: 'text-muted-foreground' },
    { icon: Flame, label: 'Level', value: profile?.level ?? 1, color: 'text-warning' },
  ];

  const difficultyRows = [
    { label: 'Easy', solved: solved.easy, total: totalByDifficulty.easy, color: 'green' },
    { label: 'Medium', solved: solved.medium, total: totalByDifficulty.medium, color: 'yellow' },
    { label: 'Hard', solved: solved.hard, total: totalByDifficulty.hard, color: 'red' },
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

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Your Progress
            </h2>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === null
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.key
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <cat.icon className="h-3 w-3" />
                {cat.key}
              </button>
            ))}
          </div>

          {/* Circle + Bars layout */}
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Circular progress */}
            <div className="shrink-0">
              <CircularProgress solved={solved.total} total={totalByDifficulty.total} size={130} />
              <p className="text-center text-xs text-muted-foreground mt-2">Solved</p>
            </div>

            {/* Difficulty bars */}
            <div className="flex-1 w-full space-y-4">
              {difficultyRows.map((d) => (
                <DifficultyBar key={d.label} {...d} />
              ))}
            </div>
          </div>
        </motion.div>

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
