import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { 
  Users, Ruler, Zap, Clock, Star,
  CheckCircle2, XCircle, Baby
} from 'lucide-react';

export default function InflatableCard({ 
  inflatable, 
  recommendation, 
  isSelected, 
  onToggleSelect,
  showCheckbox = true 
}) {
  const isAvailable = recommendation?.is_available !== false;
  const score = recommendation?.score || 0;
  const reasons = recommendation?.reasons || [];
  const price = recommendation?.calculated_price || inflatable.base_price;

  return (
    <div className={cn(
      "bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-lg",
      isSelected ? "border-violet-500 shadow-violet-100" : "border-slate-100",
      !isAvailable && "opacity-60"
    )}>
      <div className="relative">
        <img 
          src={inflatable.main_image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'} 
          alt={inflatable.name}
          className="w-full h-48 object-cover"
        />
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
          <div className="mb-4 p-3 bg-violet-50 rounded-xl">
            <p className="text-xs font-medium text-violet-700 mb-1">Dlaczego pasuje:</p>
            <p className="text-xs text-violet-600">{reasons.slice(0, 2).join('. ')}</p>
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
      </div>
    </div>
  );
}