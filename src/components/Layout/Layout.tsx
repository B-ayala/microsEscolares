import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatbotWidget from './ChatbotWidget';
import GlobalModal from '../modal/GlobalModal';
import { PageLoader } from '../ui/PageLoader';
import { cn } from '../ui/Button';

const SECTION_TITLES: Record<string, string> = {
  '/dashboard': 'Inicio',
  '/schools': 'Escuelas',
  '/students': 'Alumnos',
  '/payments': 'Pagos',
  '/buses': 'Colectivos',
  '/expenses': 'Gastos',
  '/employee-payments': 'Empleados',
};

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const sectionTitle = SECTION_TITLES[location.pathname] ?? 'MicrosMiguel';

  const [isNavigating, setIsNavigating] = useState(true);
  useEffect(() => {
    setIsNavigating(true);
    const t = setTimeout(() => setIsNavigating(false), 450);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsInitialLoad(false), 900);
    return () => clearTimeout(t);
  }, []);

  if (isInitialLoad) {
    return <PageLoader fullScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Backdrop para el Drawer en Mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Mobile (Drawer) */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} className="flex w-full" />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="inline-flex items-center justify-center min-h-[48px] min-w-[48px] -ml-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 rounded-lg"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-7 h-7" />
          </button>
          <h1 className="font-bold text-xl text-gray-900 truncate">{sectionTitle}</h1>
          <span className="min-w-[48px]" aria-hidden="true" />
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full">
          {/* Contenedor centralizado con márgenes seguros y padding progresivo */}
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            {isNavigating ? <PageLoader /> : <Outlet />}
          </div>
        </main>
      </div>

      <GlobalModal />
      <ChatbotWidget />
    </div>
  );
}
