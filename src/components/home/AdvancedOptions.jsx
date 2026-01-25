import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdvancedOptions({ formData, updateFormData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-center gap-2 w-full py-3 text-sm text-slate-600 hover:text-slate-900 transition"
      >
        <Sparkles className="w-4 h-4" />
        <span>Dodatkowe informacje (dostaniesz lepsze wyniki)</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3 border-t border-slate-100 mt-2">
              <Select value={formData.event_type} onValueChange={(v) => updateFormData({ event_type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Typ imprezy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Urodziny</SelectItem>
                  <SelectItem value="przedszkole">Przedszkole</SelectItem>
                  <SelectItem value="school_event">Szkoła/Półkolonie</SelectItem>
                  <SelectItem value="festival">Festyn/Piknik</SelectItem>
                  <SelectItem value="corporate_event">Event firmowy</SelectItem>
                  <SelectItem value="communion">Komunia</SelectItem>
                  <SelectItem value="wedding">Wesele</SelectItem>
                  <SelectItem value="other">Inne</SelectItem>
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  value={formData.age_min}
                  onChange={(e) => updateFormData({ age_min: e.target.value })}
                  placeholder="Wiek od"
                  min="2"
                  max="99"
                />
                <Input
                  type="number"
                  value={formData.age_max}
                  onChange={(e) => updateFormData({ age_max: e.target.value })}
                  placeholder="Wiek do"
                  min="2"
                  max="99"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <input
                  type="checkbox"
                  id="is_competitive"
                  checked={formData.is_competitive}
                  onChange={(e) => updateFormData({ is_competitive: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-purple-400 text-purple-600 focus:ring-2 focus:ring-purple-300"
                />
                <label htmlFor="is_competitive" className="text-sm font-medium text-slate-800 cursor-pointer flex-1">
                  🏆 Rywalizacja (wyścigi, tory)
                </label>
              </div>

              <Select value={formData.intensity} onValueChange={(v) => updateFormData({ intensity: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Intensywność" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Spokojne</SelectItem>
                  <SelectItem value="MEDIUM">Średnie (nie ekstremalne)</SelectItem>
                  <SelectItem value="HIGH">Hardcore (ekstremalne)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}