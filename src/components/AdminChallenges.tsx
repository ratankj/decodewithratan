import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DbChallenge {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  description: string;
  expected_output: string;
  schema_info: string;
  setup_sql: string;
  solution_sql: string;
  table_preview: any;
  created_at: string;
}

const emptyForm = {
  title: '',
  difficulty: 'MEDIUM' as string,
  category: 'SQL' as string,
  description: '',
  expected_output: '',
  schema_info: '',
  setup_sql: '',
  solution_sql: '',
  table_preview: '{"columns":[],"rows":[]}',
};

export default function AdminChallenges() {
  const [challenges, setChallenges] = useState<DbChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchChallenges = async () => {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) setChallenges(data);
    setLoading(false);
  };

  useEffect(() => { fetchChallenges(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: DbChallenge) => {
    setEditingId(c.id);
    setForm({
      title: c.title,
      difficulty: c.difficulty,
      category: c.category || 'SQL',
      description: c.description,
      expected_output: c.expected_output,
      schema_info: c.schema_info,
      setup_sql: c.setup_sql,
      solution_sql: c.solution_sql,
      table_preview: JSON.stringify(c.table_preview),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.setup_sql || !form.solution_sql) {
      toast.error('Please fill all required fields');
      return;
    }
    let tablePreview: any;
    try {
      tablePreview = JSON.parse(form.table_preview);
    } catch {
      toast.error('Table preview must be valid JSON');
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title,
      difficulty: form.difficulty,
      category: form.category,
      description: form.description,
      expected_output: form.expected_output,
      schema_info: form.schema_info,
      setup_sql: form.setup_sql,
      solution_sql: form.solution_sql,
      table_preview: tablePreview,
    };

    if (editingId) {
      const { error } = await supabase.from('challenges').update(payload).eq('id', editingId);
      if (error) toast.error('Failed to update: ' + error.message);
      else toast.success('Challenge updated');
    } else {
      const { error } = await supabase.from('challenges').insert(payload);
      if (error) toast.error('Failed to create: ' + error.message);
      else toast.success('Challenge created');
    }
    setSaving(false);
    setDialogOpen(false);
    fetchChallenges();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this challenge? This cannot be undone.')) return;
    const { error } = await supabase.from('challenges').delete().eq('id', id);
    if (error) toast.error('Failed to delete: ' + error.message);
    else {
      toast.success('Challenge deleted');
      fetchChallenges();
    }
  };

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Manage Challenges</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate} className="gap-1">
              <Plus className="h-4 w-4" /> Add Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Challenge' : 'New Challenge'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Title *</label>
                  <Input value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="Challenge title" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Category *</label>
                  <Select value={form.category} onValueChange={v => updateField('category', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SQL">SQL</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="Pandas">Pandas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Difficulty *</label>
                  <Select value={form.difficulty} onValueChange={v => updateField('difficulty', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Description *</label>
                <Textarea value={form.description} onChange={e => updateField('description', e.target.value)} rows={2} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Expected Output</label>
                <Input value={form.expected_output} onChange={e => updateField('expected_output', e.target.value)} placeholder="Return columns: ..." />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Schema Info</label>
                <Input value={form.schema_info} onChange={e => updateField('schema_info', e.target.value)} placeholder="table_name (col1, col2, ...)" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Setup SQL *</label>
                <Textarea value={form.setup_sql} onChange={e => updateField('setup_sql', e.target.value)} rows={4} className="font-mono text-xs" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Solution SQL *</label>
                <Textarea value={form.solution_sql} onChange={e => updateField('solution_sql', e.target.value)} rows={3} className="font-mono text-xs" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Table Preview (JSON)</label>
                <Textarea value={form.table_preview} onChange={e => updateField('table_preview', e.target.value)} rows={3} className="font-mono text-xs" />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? 'Saving...' : editingId ? 'Update Challenge' : 'Create Challenge'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading challenges...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {challenges.map((c, i) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">{c.category || 'SQL'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.difficulty === 'EASY' ? 'default' : c.difficulty === 'MEDIUM' ? 'secondary' : 'destructive'} className="font-mono text-xs">
                      {c.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(c.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
