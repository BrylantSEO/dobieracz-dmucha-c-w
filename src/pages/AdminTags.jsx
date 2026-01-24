import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Tag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { value: 'type', label: 'Typ dmuchańca', color: 'bg-blue-100 text-blue-800' },
  { value: 'age_group', label: 'Grupa wiekowa', color: 'bg-green-100 text-green-800' },
  { value: 'theme', label: 'Tematyka', color: 'bg-purple-100 text-purple-800' },
  { value: 'feature', label: 'Cecha', color: 'bg-orange-100 text-orange-800' },
];

const defaultColors = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', 
  '#EF4444', '#EC4899', '#6366F1', '#14B8A6'
];

export default function AdminTags() {
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'feature', color: defaultColors[0] });
  const queryClient = useQueryClient();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => base44.entities.Tag.list('category'),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingTag) {
        return base44.entities.Tag.update(editingTag.id, data);
      }
      return base44.entities.Tag.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tags']);
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Tag.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['tags']),
  });

  const handleAdd = () => {
    setEditingTag(null);
    setFormData({ name: '', category: 'feature', color: defaultColors[Math.floor(Math.random() * defaultColors.length)] });
    setShowForm(true);
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, category: tag.category, color: tag.color || defaultColors[0] });
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingTag(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const groupedTags = categories.map(cat => ({
    ...cat,
    tags: tags.filter(t => t.category === cat.value)
  }));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Tagi</h1>
          <p className="text-slate-500">Zarządzaj tagami do kategoryzacji dmuchańców</p>
        </div>
        <Button onClick={handleAdd} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" />
          Dodaj tag
        </Button>
      </div>

      <div className="space-y-6">
        {groupedTags.map(group => (
          <Card key={group.value}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="w-5 h-5" />
                {group.label}
                <Badge variant="outline" className="ml-2">{group.tags.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {group.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {group.tags.map(tag => (
                    <div
                      key={tag.id}
                      className="group flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white hover:bg-slate-50 transition-colors"
                      style={{ borderColor: tag.color || '#e2e8f0' }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: tag.color || '#94a3b8' }}
                      />
                      <span className="text-sm font-medium">{tag.name}</span>
                      <div className="hidden group-hover:flex items-center gap-1 ml-1">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Usunąć tag?')) deleteMutation.mutate(tag.id);
                          }}
                          className="p-1 hover:bg-red-100 rounded text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Brak tagów w tej kategorii</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? 'Edytuj tag' : 'Dodaj tag'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nazwa *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="np. dla maluchów"
                required
              />
            </div>
            <div>
              <Label>Kategoria *</Label>
              <Select 
                value={formData.category}
                onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kolor</Label>
              <div className="flex gap-2 mt-2">
                {defaultColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={cn(
                      "w-8 h-8 rounded-full transition-transform",
                      formData.color === color && "ring-2 ring-offset-2 ring-slate-400 scale-110"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Anuluj
              </Button>
              <Button type="submit" disabled={saveMutation.isPending} className="bg-violet-600 hover:bg-violet-700">
                {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingTag ? 'Zapisz' : 'Dodaj'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}