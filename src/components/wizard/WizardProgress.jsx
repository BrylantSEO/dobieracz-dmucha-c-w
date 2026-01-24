import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, name: 'Termin' },
  { id: 2, name: 'Impreza' },
  { id: 3, name: 'Miejsce' },
  { id: 4, name: 'Preferencje' },
  { id: 5, name: 'Kontakt' },
];

export default function WizardProgress({ currentStep }) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  currentStep > step.id
                    ? "bg-emerald-500 text-white"
                    : currentStep === step.id
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                    : "bg-slate-100 text-slate-400"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium hidden sm:block transition-colors",
                  currentStep >= step.id ? "text-slate-700" : "text-slate-400"
                )}
              >
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-colors duration-300",
                  currentStep > step.id ? "bg-emerald-500" : "bg-slate-200"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}