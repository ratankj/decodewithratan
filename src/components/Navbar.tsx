import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const { pathname } = useLocation();
  const { profile, signOut, isAdmin } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/challenges', label: 'Challenges' },
    { to: '/leaderboard', label: 'Leaderboard' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-mono text-primary-foreground text-sm font-bold">
              S
            </span>
            <span>SQL<span className="text-primary">Arena</span></span>
          </Link>
          <div className="flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname === l.to
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {profile && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{profile.display_name}</span>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-mono text-primary">
                Lv {profile.level}
              </span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
