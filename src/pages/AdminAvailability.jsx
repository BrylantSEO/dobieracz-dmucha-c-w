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
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Plus, Trash2, Wrench, Calendar, AlertTriangle, Loader2 } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const reasonLabels = {
  repair: 'Naprawa',
  maintenance: 'Przegląd',
  reserved: 'Zarezerwowany',
  other: 'Inne',
};

const reasonColors = {
  repair: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  reserved: 'bg-blue-100 text-blue-800',
  other: 'bg-slate-100 text-slate-800',
};

export default function AdminAvailability() {
  const [showForm, setShowForm] = useState(false);
  const [selectedInflatable, setSelectedInflatable] = useState('all');
  const queryClient = useQueryClient();

  const { data: blocks = [] } = useQuery({
    queryKey: ['availabilityBlocks'],
    queryFn: () => base44.entities.AvailabilityBlock.list('-start_date'),
  });

  const { data: inflatables = [] } = useQuery({
    queryKey: ['inflatables'],
    queryFn: () => base44.entities.Inflatable.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AvailabilityBlock.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['availabilityBlocks']),
  });

  const filtered = blocks.filter(b => {
    if (selectedInflatable !== 'all' && b.inflatable_id !== selectedInflatable) return false;
    return b.is_active !== false;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Blokady dostępności</h1>
          <p className="text-slate-500">Zarządzaj serwisem i blokadami dmuchańców</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" />
          Dodaj blokadę
        </Button>
      </div>

      <div className="mb-6">
        <Select value={selectedInflatable} onValueChange={setSelectedInflatable}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtruj po dmuchańcu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie dmuchańce</SelectItem>
            {inflatables.map(inf => (
              <SelectItem key={inf.id} value={inf.id}>{inf.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filtered.map(block => {
          const inflatable = inflatables.find(i => i.id === block.inflatable_id);
          const isActive = new Date(block.end_date) >= new Date();

          return (
            <Card key={block.id} className={!isActive ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-slate-100">
                      {block.reason === 'repair' ? (
                        <Wrench className="w-6 h-6 text-red-500" />
                      ) : block.reason === 'maintenance' ? (
                        <Wrench className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {inflatable?.name || 'Nieznany dmuchaniec'}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge className={reasonColors[block.reason]}>
                          {reasonLabels[block.reason]}
                        </Badge>
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(block.start_date), 'd MMM', { locale: pl })} - 
                          {format(new Date(block.end_date), 'd MMM yyyy', { locale: pl })}
                        </span>
                      </div>
                      {block.reason_description && (
                        <p className="text-sm text-slate-500 mt-1">{block.reason_description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Usunąć blokadę?')) deleteMutation.mutate(block.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Brak aktywnych blokad</p>
          </div>
        )}
      </div>

      <BlockFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        inflatables={inflatables}
      />
    </div>
  );
}

function BlockFormDialog({ open, onOpenChange, inflatables }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    inflatable_id: '',
    reason: 'maintenance',
    reason_description: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.AvailabilityBlock.create({ ...data, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['availabilityBlocks']);
      onOpenChange(false);
      setFormData({
        inflatable_id: '',
        reason: 'maintenance',
        reason_description: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(), 'yyyy-MM-dd'),
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dodaj blokadę</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Dmuchaniec *</Label>
            <Select
              value={formData.inflatable_id}
              onValueChange={(v) => setFormData(prev => ({ ...prev, inflatable_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz..." />
              </SelectTrigger>
              <SelectContent>
                {inflatables.map(inf => (
                  <SelectItem key={inf.id} value={inf.id}>{inf.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Powód *</Label>
            <Select
              value={formData.reason}
              onValueChange={(v) => setFormData(prev => ({ ...prev, reason: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="repair">Naprawa</SelectItem>
                <SelectItem value="maintenance">Przegląd</SelectItem>
                <SelectItem value="reserved">Zarezerwowany</SelectItem>
                <SelectItem value="other">Inne</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Opis (opcjonalnie)</Label>
            <Input
              value={formData.reason_description}
              onChange={(e) => setFormData(prev => ({ ...prev, reason_description: e.target.value }))}
              placeholder="np. wymiana dmuchawy"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data od *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {formData.start_date ? format(new Date(formData.start_date), 'd MMM yyyy', { locale: pl }) : 'Wybierz datę'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={new Date(formData.start_date)}
                    onSelect={(date) => setFormData(prev => ({ ...prev, start_date: format(date, 'yyyy-MM-dd') }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Data do *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {formData.end_date ? format(new Date(formData.end_date), 'd MMM yyyy', { locale: pl }) : 'Wybierz datę'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={new Date(formData.end_date)}
                    onSelect={(date) => setFormData(prev => ({ ...prev, end_date: format(date, 'yyyy-MM-dd') }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit" disabled={saveMutation.isPending || !formData.inflatable_id} className="bg-violet-600 hover:bg-violet-700">
              {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Dodaj
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}