import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InflatableCard from './InflatableCard';
import PricingSidebar from './PricingSidebar';
import { AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
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
  const [hours, setHours] = useState('');

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
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

  const selectedInflatables = selectedIds
    .map(id => inflatables.find(i => i.id === id))
    .filter(Boolean);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1 space-y-8">
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
              : 'Wybierz dmuchańce, które Cię interesują'}
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
                     inflatable={rec.inflatable || inflatable}
                     recommendation={rec}
                     isSelected={selectedIds.includes(rec.inflatable_id)}
                     onToggleSelect={toggleSelect}
                     eventDate={sessionStorage.getItem('eventDate')}
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
                     inflatable={rec.inflatable || inflatable}
                     recommendation={rec}
                     showCheckbox={false}
                     eventDate={sessionStorage.getItem('eventDate')}
                   />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pricing Sidebar */}
      <div className="lg:w-80">
        <PricingSidebar
          selectedInflatables={selectedInflatables}
          onRemove={(id) => setSelectedIds(selectedIds.filter(i => i !== id))}
          onSubmit={handleSubmit}
          submitting={submitting}
          hours={hours}
          onHoursChange={setHours}
        />
      </div>
    </div>
  );
}