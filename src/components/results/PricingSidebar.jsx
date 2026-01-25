import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Send, Loader2, Tag, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PricingSidebar({ 
  selectedInflatables, 
  onRemove, 
  onSubmit, 
  submitting,
  hours,
  onHoursChange 
}) {
  const calculateTotals = () => {
    if (selectedInflatables.length === 0) return { subtotal: 0, discount: 0, total: 0, discountPercent: 0 };

    const subtotal = selectedInflatables.reduce((sum, inf) => {
      const price = hours && inf.price_for_hours?.[`${hours}h`] 
        ? inf.price_for_hours[`${hours}h`] 
        : inf.base_price || 0;
      return sum + price;
    }, 0);

    let discountPercent = 0;
    if (selectedInflatables.length === 3) discountPercent = 10;
    if (selectedInflatables.length === 4) discountPercent = 15;

    const discount = (subtotal * discountPercent) / 100;
    const total = subtotal - discount;

    return { subtotal, discount, total, discountPercent };
  };

  const { subtotal, discount, total, discountPercent } = calculateTotals();
  const showCustomQuote = selectedInflatables.length >= 5;

  return (
    <div className="lg:sticky lg:top-6">
      <Card className="shadow-xl border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            🛒 Twój wybór
            {selectedInflatables.length > 0 && (
              <span className="text-sm font-normal text-slate-500">
                ({selectedInflatables.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hours Selection */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Czas wynajmu
            </label>
            <Select value={hours || ''} onValueChange={onHoursChange}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz liczbę godzin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 godziny</SelectItem>
                <SelectItem value="4">4 godziny</SelectItem>
                <SelectItem value="5">5 godzin</SelectItem>
                <SelectItem value="6">6 godzin</SelectItem>
                <SelectItem value="8">8 godzin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selected Items */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {selectedInflatables.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  Zaznacz dmuchańce, które Cię interesują
                </p>
              ) : (
                selectedInflatables.map((inf) => {
                  const price = hours && inf.price_for_hours?.[`${hours}h`] 
                    ? inf.price_for_hours[`${hours}h`] 
                    : inf.base_price || 0;
                  
                  return (
                    <motion.div
                      key={inf.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg"
                    >
                      <img 
                        src={inf.main_image || inf.images?.[0]} 
                        alt={inf.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 truncate">{inf.name}</p>
                        <p className="text-sm text-slate-600">{price.toLocaleString('pl-PL')} zł</p>
                      </div>
                      <button
                        onClick={() => onRemove(inf.id)}
                        className="text-slate-400 hover:text-slate-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Pricing Summary */}
          {selectedInflatables.length > 0 && !showCustomQuote && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Suma</span>
                <span className="font-medium">{subtotal.toLocaleString('pl-PL')} zł</span>
              </div>
              
              {discountPercent > 0 && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-green-600 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Rabat ({discountPercent}%)
                  </span>
                  <span className="font-medium text-green-600">-{discount.toLocaleString('pl-PL')} zł</span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span className="text-slate-900">Razem</span>
                <span className="text-slate-900">{total.toLocaleString('pl-PL')} zł</span>
              </div>

              {!hours && (
                <p className="text-xs text-slate-500 italic">
                  * Wybierz czas wynajmu aby zobaczyć dokładną cenę
                </p>
              )}
            </div>
          )}

          {/* Custom Quote Message */}
          {showCustomQuote && (
            <div className="border-t pt-4">
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-4">
                <p className="text-sm font-medium text-violet-900 mb-1">
                  💎 Specjalna oferta
                </p>
                <p className="text-sm text-violet-700">
                  Przy wyborze 5+ dmuchańców przygotujemy indywidualną wycenę z najlepszą ceną. Wyślemy ją mailem!
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={onSubmit}
            disabled={selectedInflatables.length === 0 || submitting}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wysyłanie...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Poproś o wycenę
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}