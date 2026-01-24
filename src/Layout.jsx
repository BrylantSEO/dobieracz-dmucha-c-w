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

const adminPages = ['AdminDashboard', 'AdminInflatables', 'AdminImport', 'AdminTags', 'AdminQuotes', 'AdminQuoteDetails', 'AdminBookings', 'AdminAvailability'];
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
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [currentPageName]);

  const checkAuth = async () => {
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      const userData = await base44.auth.me();
      setUser(userData);
      const hasAdminRole = userData?.business_role === 'admin' || userData?.business_role === 'staff' || userData?.role === 'admin';
      setIsAdmin(hasAdminRole);

      // Redirect non-admin from admin pages
      if (adminPages.includes(currentPageName) && !hasAdminRole) {
        navigate(createPageUrl('Home'));
      }
    } else {
      setUser(null);
      setIsAdmin(false);
      // Redirect to login for admin pages
      if (adminPages.includes(currentPageName)) {
        base44.auth.redirectToLogin(window.location.href);
      }
    }
  };

  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Home'));
  };

  // Public pages - no layout wrapper needed
  if (publicPages.includes(currentPageName)) {
    return <>{children}</>;
  }

  // Admin pages - show admin layout
  if (adminPages.includes(currentPageName)) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200">
          <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
              <PartyPopper className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800">Dmuchańce</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page || 
                (currentPageName === 'AdminQuoteDetails' && item.page === 'AdminQuotes');
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-violet-50 text-violet-700"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-medium">
                {user?.full_name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{user?.full_name || 'Admin'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Wyloguj
            </Button>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
              <PartyPopper className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800">Panel Admin</span>
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex items-center justify-between h-16 px-6 border-b">
                <span className="font-bold">Menu</span>
              </div>
              <nav className="p-4 space-y-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium",
                        isActive
                          ? "bg-violet-50 text-violet-700"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  );
                })}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-600 hover:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Wyloguj
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
          {children}
        </main>
      </div>
    );
  }

  // Default - just render children
  return <>{children}</>;
}