import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InflatableCard from './InflatableCard';
import { Send, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResultsDisplay({ 
  recommendations, 
  inflatables, 
  isLoading,
  onSubmitRequest,
  submitting,
  noResults = false
}) {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSubmit = () => {
    onSubmitRequest?.(selectedIds);
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 mb-6">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Dobieramy najlepsze atrakcje...
        </h3>
        <p className="text-slate-500">
          Analizujemy Twoje wymagania i sprawdzamy dostępność
        </p>
      </div>
    );
  }

  const availableRecs = recommendations.filter(r => r.is_available !== false);
  const unavailableRecs = recommendations.filter(r => r.is_available === false);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <span className="text-sm font-medium text-violet-700">Rekomendacje dla Ciebie</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {noResults ? 'Nie znaleźliśmy idealnego dopasowania' : `Znaleźliśmy ${availableRecs.length} idealnych propozycji`}
        </h2>
        <p className="text-slate-500">
          {noResults 
            ? 'Ale nie martw się - wyślij zgłoszenie, a przygotujemy indywidualną ofertę'
            : 'Wybierz do 3 dmuchańców, które Cię interesują'}
        </p>
      </div>

      {noResults && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Na wybrany termin lub przy podanych ograniczeniach nie mamy idealnie pasujących atrakcji. 
            Skontaktujemy się z alternatywnymi propozycjami!
          </AlertDescription>
        </Alert>
      )}

      {availableRecs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableRecs.map((rec, index) => {
            const inflatable = inflatables.find(i => i.id === rec.inflatable_id);
            if (!inflatable) return null;
            return (
              <motion.div
                key={rec.inflatable_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <InflatableCard
                  inflatable={inflatable}
                  recommendation={rec}
                  isSelected={selectedIds.includes(rec.inflatable_id)}
                  onToggleSelect={toggleSelect}
                />
              </motion.div>
            );
          })}
        </div>
      )}

      {unavailableRecs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-600 mb-4">
            Niedostępne w wybranym terminie
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unavailableRecs.slice(0, 3).map((rec) => {
              const inflatable = inflatables.find(i => i.id === rec.inflatable_id);
              if (!inflatable) return null;
              return (
                <InflatableCard
                  key={rec.inflatable_id}
                  inflatable={inflatable}
                  recommendation={rec}
                  showCheckbox={false}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="sticky bottom-4 z-10 mt-8">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-4 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="font-medium text-slate-800">
                {selectedIds.length > 0 
                  ? `Wybrano ${selectedIds.length} z 3 możliwych`
                  : 'Wybierz dmuchańce lub wyślij bez wyboru'}
              </p>
              <p className="text-sm text-slate-500">
                Przygotujemy dla Ciebie szczegółową ofertę
              </p>
            </div>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 shadow-lg shadow-violet-200"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Wysyłanie...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Poproś o wycenę</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}