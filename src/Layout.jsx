import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  Menu, LayoutDashboard, Package, Tag, Upload,
  ClipboardList, Calendar, CalendarOff, LogOut
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

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  // Public pages - no layout wrapper needed
  if (publicPages.includes(currentPageName)) {
    return <>{children}</>;
  }

  // Admin pages - show header with navigation
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Home')} className="text-2xl font-bold text-slate-900">
              Dmucha.
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={cn(
                      "flex items-center gap-2 text-sm transition",
                      isActive 
                        ? "text-slate-900 font-medium" 
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Wyloguj
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPageName === item.page;
                    return (
                      <Link
                        key={item.page}
                        to={createPageUrl(item.page)}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 text-base transition p-2 rounded-lg",
                          isActive 
                            ? "bg-slate-100 text-slate-900 font-medium" 
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="gap-2 justify-start"
                  >
                    <LogOut className="w-5 h-5" />
                    Wyloguj
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}