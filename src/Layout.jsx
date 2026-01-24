import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  PartyPopper, Menu, LayoutDashboard, Package, Tag, Upload,
  ClipboardList, Calendar, CalendarOff, LogOut, X, ChevronRight
} from 'lucide-react';

const publicPages = ['Home', 'Wizard'];

const adminNavItems = [
  { name: 'Dashboard', page: 'AdminDashboard', icon: LayoutDashboard },
  { name: 'Dmuchańce', page: 'AdminInflatables', icon: Package },
  { name: 'Import CSV', page: 'AdminImport', icon: Upload },
  { name: 'Tagi', page: 'AdminTags', icon: Tag },
  { name: 'Zgłoszenia', page: 'AdminQuotes', icon: ClipboardList },
  { name: 'Rezerwacje', page: 'AdminBookings', icon: Calendar },
  { name: 'Blokady', page: 'AdminAvailability', icon: CalendarOff },
];

<style>{`
  :root {
    --bg-primary: #F9B857;
    --bg-secondary: #F5D0D0;
    --accent-cyan: #00CED1;
    --accent-purple: #9B6DFF;
    --accent-coral: #E8686D;
    --text-dark: #8B6914;
    --text-muted: #A0A0A0;
    --text-light: #FFFFFF;
    --radius-sm: 8px;
    --radius-md: 16px;
    --radius-lg: 24px;
    --radius-pill: 25px;
  }
`}</style>

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);





  // Public pages - no layout wrapper needed
  if (publicPages.includes(currentPageName)) {
    return <>{children}</>;
  }



  // Default - just render children
  return <>{children}</>;
}