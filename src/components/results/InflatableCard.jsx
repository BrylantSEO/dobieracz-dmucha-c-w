import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Users, Ruler, Zap, Clock, Star,
  CheckCircle2, XCircle, Baby, ChevronLeft, ChevronRight, Bell
} from 'lucide-react';
import NotificationModal from './NotificationModal';

export default function InflatableCard({ 
  inflatable, 
  recommendation, 
  isSelected, 
  onToggleSelect,
  showCheckbox = true,
  eventDate = null
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  const isAvailable = recommendation?.is_available !== false;
  const score = recommendation?.score || 0;
  const reasons = recommendation?.reasons || [];
  const price = recommendation?.calculated_price || inflatable.base_price;
  
  const images = inflatable.images?.length > 0 
    ? inflatable.images 
    : inflatable.main_image 
      ? [inflatable.main_image]
      : ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'];

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-lg",
      isSelected ? "border-violet-500 shadow-violet-100" : "border-slate-100",
      !isAvailable && "opacity-60"
    )}>
      <div className="relative group">
        <img 
          src={images[currentImageIndex]} 
          alt={`${inflatable.name} - zdjęcie ${currentImageIndex + 1}`}
          className="w-full h-48 object-cover"
        />
        
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    idx === currentImageIndex 
                      ? "bg-white w-4" 
                      : "bg-white/60"
                  )}
                />
              ))}
            </div>
          </>
        )}
        
        {showCheckbox && isAvailable && (
          <div className="absolute top-3 right-3">
            <div 
              onClick={() => onToggleSelect?.(inflatable.id)}
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all",
                isSelected 
                  ? "bg-violet-600 text-white" 
                  : "bg-white/90 text-slate-400 hover:bg-white"
              )}
            >
              {isSelected && <CheckCircle2 className="w-5 h-5" />}
              {!isSelected && <div className="w-5 h-5 rounded-full border-2 border-slate-300" />}
            </div>
          </div>
        )}
        {score > 0 && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 shadow-lg">
              <Star className="w-3 h-3 mr-1" />
              {score}% dopasowania
            </Badge>
          </div>
        )}
        <div className={cn(
          "absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5",
          isAvailable 
            ? "bg-emerald-500 text-white" 
            : "bg-red-500 text-white"
        )}>
          {isAvailable ? (
            <><CheckCircle2 className="w-4 h-4" /> Dostępny</>
          ) : (
            <><XCircle className="w-4 h-4" /> Niedostępny</>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-800 mb-2">{inflatable.name}</h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="text-xs">
            <Baby className="w-3 h-3 mr-1" />
            {inflatable.age_min || 3}-{inflatable.age_max || 99} lat
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Users className="w-3 h-3 mr-1" />
            max {inflatable.max_capacity || '?'} osób
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Ruler className="w-3 h-3 mr-1" />
            {inflatable.length_m || '?'}×{inflatable.width_m || '?'}m
          </Badge>
          {inflatable.requires_power && (
            <Badge variant="outline" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Prąd
            </Badge>
          )}
        </div>

        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
          {inflatable.short_description || inflatable.description}
        </p>

        {reasons.length > 0 && (
          <div className="mb-4 p-3 bg-violet-50 rounded-xl border border-violet-100">
            <p className="text-xs font-semibold text-violet-800 mb-2 flex items-center gap-1">
              ✨ Dlaczego polecamy
            </p>
            <div className="space-y-1">
              {reasons.slice(0, 3).map((reason, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <span className="text-violet-500 mt-0.5">•</span>
                  <span className="text-xs text-violet-700">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {inflatable.price_for_hours && Object.keys(inflatable.price_for_hours).length > 0 && (
          <div className="mb-4 p-3 bg-slate-50 rounded-xl">
            <p className="text-xs font-medium text-slate-700 mb-2">Ceny za wynajem:</p>
            <div className="grid grid-cols-3 gap-2">
              {[3, 4, 5, 6, 8].map((hours) => {
                const price = inflatable.price_for_hours?.[`${hours}h`];
                return price ? (
                  <div key={hours} className="text-center">
                    <p className="text-xs text-slate-600">{hours}h</p>
                    <p className="text-sm font-bold text-slate-800">
                      {price.toLocaleString('pl-PL')} zł
                    </p>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        <div className="flex items-end justify-between pt-3 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500">Cena od</p>
            <p className="text-2xl font-bold text-slate-800">
              {price?.toLocaleString('pl-PL')} <span className="text-sm font-normal text-slate-500">zł</span>
            </p>
          </div>
          {inflatable.setup_time_minutes && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              Montaż ~{inflatable.setup_time_minutes} min
            </div>
          )}
        </div>

        {!isAvailable && eventDate && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotificationModal(true)}
              className="w-full gap-2"
              style={{ color: 'var(--accent-pink)', borderColor: 'var(--accent-pink)' }}
            >
              <Bell className="w-4 h-4" />
              Powiadom mnie
            </Button>
          </div>
        )}
      </div>

      {showNotificationModal && (
        <NotificationModal
          inflatable={inflatable}
          eventDate={eventDate}
          onClose={() => setShowNotificationModal(false)}
        />
      )}
    </div>
  );
}