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
    --bg-primary: #FEF9FB;
    --accent-pink: #EE2C5E;
    --accent-orange: #F99E20;
    --accent-blue: #1E1E9F;
    --text-dark: #0B060A;
    --text-muted: #BDA4A6;
    --radius-sm: 8px;
    --radius-md: 16px;
    --radius-lg: 24px;
  }
`}</style>

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Home'));
  };

  // Public pages - no layout wrapper needed
  if (publicPages.includes(currentPageName)) {
    return <>{children}</>;
  }



  // Default - just render children
  return <>{children}</>;
}