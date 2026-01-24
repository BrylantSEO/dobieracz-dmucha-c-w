import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Phone, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function ConfirmationView({ requestNumber, contactName }) {
  return (
    <motion.div 
      className="text-center py-12"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        Dziękujemy, {contactName?.split(' ')[0] || 'drogi Kliencie'}!
      </h2>
      <p className="text-lg text-slate-600 mb-6">
        Twoje zgłoszenie zostało przyjęte
      </p>

      <div className="inline-block bg-violet-50 rounded-xl px-6 py-4 mb-8">
        <p className="text-sm text-violet-600 mb-1">Numer zgłoszenia</p>
        <p className="text-2xl font-bold text-violet-800">{requestNumber}</p>
      </div>

      <div className="max-w-md mx-auto text-left bg-slate-50 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-slate-800 mb-3">Co dalej?</h3>
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
            <span>Nasz zespół przeanalizuje Twoje wymagania i sprawdzi dostępność</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
            <span>Skontaktujemy się z Tobą w ciągu 24h z szczegółową ofertą</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
            <span>Po akceptacji oferty zablokujemy termin i ustalimy szczegóły dostawy</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
        <div className="flex items-center gap-2 text-slate-600">
          <Phone className="w-4 h-4" />
          <span>+48 123 456 789</span>
        </div>
        <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
        <div className="flex items-center gap-2 text-slate-600">
          <Mail className="w-4 h-4" />
          <span>kontakt@dmuchance.pl</span>
        </div>
      </div>

      <Link to={createPageUrl('Home')}>
        <Button variant="outline" size="lg" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Powrót do strony głównej
        </Button>
      </Link>
    </motion.div>
  );
}