import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, ChevronLeft, ChevronRight, Users, Ruler, Zap, 
  Clock, Wind, MapPin, CheckCircle2, Sparkles
} from 'lucide-react';

export default function InflatableDetailsModal({ inflatable, recommendation, isOpen, onClose, onSelect, isSelected }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!inflatable) return null;

  const images = inflatable.images?.length > 0 
    ? inflatable.images 
    : inflatable.main_image 
      ? [inflatable.main_image] 
      : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const intensityLabels = {
    LOW: 'Spokojne',
    MEDIUM: 'Średnie',
    HIGH: 'Hardcore'
  };

  const typeLabels = {
    slide: 'Zjeżdżalnia',
    castle: 'Zamek',
    obstacle_course: 'Tor przeszkód',
    combo: 'Kombo',
    for_toddlers: 'Dla maluchów',
    interactive: 'Interaktywny',
    other: 'Inne'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{inflatable.name}</DialogTitle>
        </DialogHeader>

        {/* Galeria zdjęć */}
        {images.length > 0 && (
          <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden">
            <img 
              src={images[currentImageIndex]} 
              alt={inflatable.name}
              className="w-full h-full object-cover"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition ${
                        idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Score i powody */}
        {recommendation && (
          <div className="space-y-3">
            {recommendation.score && (
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-violet-600">{Math.round(recommendation.score)}%</div>
                <div className="text-sm text-slate-500">dopasowania</div>
              </div>
            )}
            
            {recommendation.reasons?.length > 0 && (
              <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
                <p className="text-sm font-semibold text-violet-800 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Dlaczego polecamy
                </p>
                <div className="space-y-1">
                  {recommendation.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-violet-500 mt-0.5">•</span>
                      <span className="text-sm text-violet-700">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Opis */}
        {inflatable.description && (
          <div>
            <h3 className="font-semibold mb-2">Opis</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{inflatable.description}</p>
          </div>
        )}

        {/* Specyfikacja */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-semibold">Specyfikacja</h3>
            
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">
                Wiek: {inflatable.age_min}-{inflatable.age_max} lat
              </span>
            </div>

            {inflatable.max_capacity && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">Max: {inflatable.max_capacity} osób</span>
              </div>
            )}

            {(inflatable.length_m && inflatable.width_m) && (
              <div className="flex items-center gap-2 text-sm">
                <Ruler className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">
                  {inflatable.length_m}×{inflatable.width_m}m
                  {inflatable.height_m && ` (wys. ${inflatable.height_m}m)`}
                </span>
              </div>
            )}

            {inflatable.setup_time_minutes && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">Montaż: {inflatable.setup_time_minutes} min</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Wymagania</h3>
            
            {inflatable.requires_power && (
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-slate-600">Wymaga prądu</span>
              </div>
            )}

            {inflatable.blower_count && (
              <div className="flex items-center gap-2 text-sm">
                <Wind className="w-4 h-4 text-sky-500" />
                <span className="text-slate-600">{inflatable.blower_count} dmuchawa(y)</span>
              </div>
            )}

            {(inflatable.indoor_suitable || inflatable.outdoor_suitable) && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="text-slate-600">
                  {inflatable.indoor_suitable && inflatable.outdoor_suitable 
                    ? 'Wewnątrz/Zewnątrz'
                    : inflatable.indoor_suitable 
                      ? 'Tylko wewnątrz'
                      : 'Tylko zewnątrz'}
                </span>
              </div>
            )}

            {inflatable.surface_types?.length > 0 && (
              <div className="text-sm">
                <span className="text-slate-500">Nawierzchnia:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {inflatable.surface_types.map(s => (
                    <Badge key={s} variant="outline" className="text-xs">
                      {s === 'grass' ? 'Trawa' : s === 'asphalt' ? 'Asfalt' : s === 'indoor' ? 'Sala' : 'Piasek'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cechy */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{typeLabels[inflatable.type] || inflatable.type}</Badge>
          {inflatable.is_competitive && (
            <Badge className="bg-purple-100 text-purple-700">🏆 Rywalizacja</Badge>
          )}
          {inflatable.intensity && (
            <Badge variant="outline">{intensityLabels[inflatable.intensity]}</Badge>
          )}
          {inflatable.requires_operator && (
            <Badge variant="outline">Animator</Badge>
          )}
        </div>

        {/* Cennik */}
        {inflatable.price_for_hours && Object.keys(inflatable.price_for_hours).length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Ceny wynajmu</h3>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(inflatable.price_for_hours).map(([hours, price]) => (
                <div key={hours} className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">{hours}</div>
                  <div className="font-semibold text-slate-800">{price} zł</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Akcje */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Zamknij
          </Button>
          {onSelect && (
            <Button 
              onClick={() => {
                onSelect(inflatable.id);
                onClose();
              }}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isSelected ? 'Odznacz' : 'Wybierz'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}