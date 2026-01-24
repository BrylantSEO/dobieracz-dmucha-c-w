import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, Search, Edit2, Trash2, Eye, EyeOff, 
  Package, Zap, Users, Ruler
} from 'lucide-react';
import { cn } from '@/lib/utils';
import InflatableForm from '@/components/admin/InflatableForm';

const typeLabels = {
  slide: 'Zjeżdżalnia',
  castle: 'Zamek',
  obstacle_course: 'Tor przeszkód',
  combo: 'Kombo',
  for_toddlers: 'Dla maluchów',
  interactive: 'Interaktywny',
  other: 'Inne',
};

export default function AdminInflatables() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingInflatable, setEditingInflatable] = useState(null);
  const queryClient = useQueryClient();

  const { data: inflatables = [], isLoading } = useQuery({
    queryKey: ['inflatables'],
    queryFn: () => base44.entities.Inflatable.list('sort_order'),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: () => base44.entities.Tag.list(),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.Inflatable.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries(['inflatables']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Inflatable.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['inflatables']),
  });

  const filtered = inflatables.filter(inf => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return inf.name?.toLowerCase().includes(q) || 
           inf.description?.toLowerCase().includes(q);
  });

  const handleEdit = (inflatable) => {
    setEditingInflatable(inflatable);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingInflatable(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingInflatable(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Dmuchańce</h1>
          <p className="text-slate-500">Zarządzaj katalogiem atrakcji</p>
        </div>
        <Button onClick={handleAdd} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" />
          Dodaj dmuchańca
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Szukaj po nazwie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map(inf => (
          <Card key={inf.id} className={cn(!inf.is_active && "opacity-60")}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img
                  src={inf.main_image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop'}
                  alt={inf.name}
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        {inf.name}
                        {!inf.is_active && (
                          <Badge variant="outline" className="text-xs">Ukryty</Badge>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {typeLabels[inf.type] || inf.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActiveMutation.mutate({ id: inf.id, is_active: !inf.is_active })}
                      >
                        {inf.is_active ? (
                          <Eye className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-slate-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(inf)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Czy na pewno usunąć ten dmuchaniec?')) {
                            deleteMutation.mutate(inf.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="text-xs gap-1">
                      <Users className="w-3 h-3" />
                      max {inf.max_capacity || '?'}
                    </Badge>
                    <Badge variant="outline" className="text-xs gap-1">
                      <Ruler className="w-3 h-3" />
                      {inf.length_m || '?'}×{inf.width_m || '?'}m
                    </Badge>
                    {inf.requires_power && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Zap className="w-3 h-3" />
                        Prąd
                      </Badge>
                    )}
                    <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                      {inf.base_price?.toLocaleString('pl-PL')} zł
                    </Badge>
                  </div>

                  {inf.tag_ids?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {inf.tag_ids.map(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        return tag ? (
                          <Badge key={tagId} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Brak dmuchańców</p>
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInflatable ? 'Edytuj dmuchańca' : 'Dodaj dmuchańca'}
            </DialogTitle>
          </DialogHeader>
          <InflatableForm
            inflatable={editingInflatable}
            tags={tags}
            onClose={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}