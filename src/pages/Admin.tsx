import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminChallenges from '@/components/AdminChallenges';

interface UserRow {
  profile_id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  level: number;
  xp_points: number;
  created_at: string;
}

export default function Admin() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.rpc('get_all_users_admin');
      if (!error && data) setUsers(data as UserRow[]);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const totalXP = users.reduce((sum, u) => sum + u.xp_points, 0);
  const avgLevel = users.length ? (users.reduce((sum, u) => sum + u.level, 0) / users.length).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">Manage and monitor registered users</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-primary/20 p-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-primary/20 p-3">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalXP}</p>
                <p className="text-xs text-muted-foreground">Total XP Earned</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-lg bg-primary/20 p-3">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgLevel}</p>
                <p className="text-xs text-muted-foreground">Avg Level</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading users...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u, i) => (
                    <TableRow key={u.profile_id}>
                      <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{u.display_name || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono">Lv {u.level}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-primary">{u.xp_points}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
