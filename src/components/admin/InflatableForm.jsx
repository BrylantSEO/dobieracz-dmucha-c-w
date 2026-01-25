import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Upload, X } from 'lucide-react';

const types = [
  { value: 'slide', label: 'Zjeżdżalnia' },
  { value: 'castle', label: 'Zamek' },
  { value: 'obstacle_course', label: 'Tor przeszkód' },
  { value: 'combo', label: 'Kombo' },
  { value: 'for_toddlers', label: 'Dla maluchów' },
  { value: 'interactive', label: 'Interaktywny' },
  { value: 'other', label: 'Inne' },
];

const surfaces = [
  { value: 'grass', label: 'Trawa' },
  { value: 'asphalt', label: 'Asfalt/Kostka' },
  { value: 'indoor', label: 'Sala/Hala' },
  { value: 'sand', label: 'Piasek' },
];

export default function InflatableForm({ inflatable, tags, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    type: 'castle',
    main_image: '',
    images: [],
    age_min: 3,
    age_max: 99,
    age_recommended_min: 4,
    age_recommended_max: 12,
    max_capacity: 6,
    length_m: null,
    width_m: null,
    height_m: null,
    min_space_length: null,
    min_space_width: null,
    requires_power: true,
    power_outlets_needed: 1,
    blower_count: 1,
    setup_time_minutes: 30,
    requires_operator: false,
    indoor_suitable: false,
    outdoor_suitable: true,
    surface_types: ['grass'],
    base_price: null,
    price_per_hour: null,
    price_for_hours: {},
    delivery_price: null,
    tag_ids: [],
    is_active: true,
    is_competitive: false,
    intensity: 'MEDIUM',
    ...inflatable,
  });
  const [uploading, setUploading] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (inflatable?.id) {
        return base44.entities.Inflatable.update(inflatable.id, data);
      }
      return base44.entities.Inflatable.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['inflatables']);
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, main_image: file_url }));
    setUploading(false);
  };

  const toggleTag = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId]
    }));
  };

  const toggleSurface = (surface) => {
    setFormData(prev => ({
      ...prev,
      surface_types: prev.surface_types.includes(surface)
        ? prev.surface_types.filter(s => s !== surface)
        : [...prev.surface_types, surface]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid gap-4">
        <div>
          <Label>Nazwa *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Typ *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cena bazowa (zł) *</Label>
            <Input
              type="number"
              value={formData.base_price || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || null }))}
              required
            />
          </div>
        </div>

        <div>
          <Label>Opis krótki</Label>
          <Input
            value={formData.short_description}
            onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
            placeholder="Krótki opis do karty produktu"
          />
        </div>

        <div>
          <Label>Opis pełny</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>
      </div>

      {/* Image */}
      <div>
        <Label>Zdjęcie główne</Label>
        <div className="flex items-center gap-4 mt-2">
          {formData.main_image ? (
            <div className="relative">
              <img src={formData.main_image} className="w-24 h-24 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, main_image: '' }))}
                className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6 text-slate-400" />}
            </label>
          )}
        </div>
      </div>

      {/* Age & Capacity */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <Label>Wiek min</Label>
          <Input
            type="number"
            value={formData.age_min || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, age_min: parseInt(e.target.value) || null }))}
          />
        </div>
        <div>
          <Label>Wiek max</Label>
          <Input
            type="number"
            value={formData.age_max || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, age_max: parseInt(e.target.value) || null }))}
          />
        </div>
        <div>
          <Label>Max osób</Label>
          <Input
            type="number"
            value={formData.max_capacity || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, max_capacity: parseInt(e.target.value) || null }))}
          />
        </div>
        <div>
          <Label>Czas montażu (min)</Label>
          <Input
            type="number"
            value={formData.setup_time_minutes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, setup_time_minutes: parseInt(e.target.value) || null }))}
          />
        </div>
      </div>

      {/* Dimensions */}
      <div>
        <Label className="mb-2 block">Wymiary (m)</Label>
        <div className="grid grid-cols-3 gap-4">
          <Input
            type="number"
            step="0.1"
            placeholder="Długość"
            value={formData.length_m || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, length_m: parseFloat(e.target.value) || null }))}
          />
          <Input
            type="number"
            step="0.1"
            placeholder="Szerokość"
            value={formData.width_m || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, width_m: parseFloat(e.target.value) || null }))}
          />
          <Input
            type="number"
            step="0.1"
            placeholder="Wysokość"
            value={formData.height_m || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, height_m: parseFloat(e.target.value) || null }))}
          />
        </div>
      </div>

      {/* Min Space */}
      <div>
        <Label className="mb-2 block">Wymagana przestrzeń min (m)</Label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            step="0.1"
            placeholder="Długość"
            value={formData.min_space_length || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, min_space_length: parseFloat(e.target.value) || null }))}
          />
          <Input
            type="number"
            step="0.1"
            placeholder="Szerokość"
            value={formData.min_space_width || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, min_space_width: parseFloat(e.target.value) || null }))}
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <Label>Wymaga prądu</Label>
          <Switch
            checked={formData.requires_power}
            onCheckedChange={(v) => setFormData(prev => ({ ...prev, requires_power: v }))}
          />
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <Label>Wymaga animatora</Label>
          <Switch
            checked={formData.requires_operator}
            onCheckedChange={(v) => setFormData(prev => ({ ...prev, requires_operator: v }))}
          />
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <Label>Na zewnątrz</Label>
          <Switch
            checked={formData.outdoor_suitable}
            onCheckedChange={(v) => setFormData(prev => ({ ...prev, outdoor_suitable: v }))}
          />
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <Label>Wewnątrz</Label>
          <Switch
            checked={formData.indoor_suitable}
            onCheckedChange={(v) => setFormData(prev => ({ ...prev, indoor_suitable: v }))}
          />
        </div>
      </div>

      {/* Surface Types */}
      <div>
        <Label className="mb-2 block">Dozwolone nawierzchnie</Label>
        <div className="flex flex-wrap gap-2">
          {surfaces.map(s => (
            <Badge
              key={s.value}
              variant={formData.surface_types?.includes(s.value) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleSurface(s.value)}
            >
              {s.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label className="mb-2 block">Tagi</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Badge
              key={tag.id}
              variant={formData.tag_ids?.includes(tag.id) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Prices */}
      <div>
        <Label className="mb-3 block font-semibold">Ceny za wynajmy</Label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4 p-4 bg-slate-50 rounded-lg">
          {[3, 4, 5, 6, 8].map(hours => (
            <div key={`${hours}h`}>
              <Label className="text-xs">{hours}h (zł)</Label>
              <Input
                type="number"
                value={formData.price_for_hours?.[`${hours}h`] || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  price_for_hours: {
                    ...prev.price_for_hours,
                    [`${hours}h`]: e.target.value ? parseFloat(e.target.value) : undefined
                  }
                }))}
                placeholder="np. 299"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Cena/godz. (zł)</Label>
            <Input
              type="number"
              value={formData.price_per_hour || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, price_per_hour: parseFloat(e.target.value) || null }))}
            />
          </div>
          <div>
            <Label>Dostawa (zł)</Label>
            <Input
              type="number"
              value={formData.delivery_price || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, delivery_price: parseFloat(e.target.value) || null }))}
            />
          </div>
        </div>
      </div>

      {/* Rywalizacja i intensywność */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Dopasowanie do typu eventu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Checkbox
              checked={formData.is_competitive || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_competitive: checked }))}
              id="is_competitive"
            />
            <div className="flex-1">
              <Label htmlFor="is_competitive" className="font-semibold cursor-pointer">
                🏆 Rywalizacja (dmuchaniec rywalizacyjny)
              </Label>
              <p className="text-xs text-slate-600 mt-1">
                Tory przeszkód, wyścigi, duele, równoległe tory, konkurencje
              </p>
            </div>
          </div>

          <div>
            <Label>Intensywność</Label>
            <Select 
              value={formData.intensity || 'MEDIUM'} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, intensity: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz intensywność" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">
                  <div>
                    <div className="font-medium">Spokojne</div>
                    <div className="text-xs text-slate-500">Przedszkole, spokojna zabawa</div>
                  </div>
                </SelectItem>
                <SelectItem value="MEDIUM">
                  <div>
                    <div className="font-medium">Średnie (nie ekstremalne)</div>
                    <div className="text-xs text-slate-500">Szkoła 6-10, bezpiecznie</div>
                  </div>
                </SelectItem>
                <SelectItem value="HIGH">
                  <div>
                    <div className="font-medium">Hardcore (ekstremalne)</div>
                    <div className="text-xs text-slate-500">Starszaki, młodzież, adrenalina</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active */}
      <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
        <Label>Aktywny w ofercie</Label>
        <Switch
          checked={formData.is_active}
          onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_active: v }))}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Anuluj
        </Button>
        <Button type="submit" disabled={saveMutation.isPending} className="bg-violet-600 hover:bg-violet-700">
          {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {inflatable ? 'Zapisz zmiany' : 'Dodaj dmuchańca'}
        </Button>
      </div>
    </form>
  );
}