import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatbotWidget from './ChatbotWidget';
import GlobalModal from '../modal/GlobalModal';
import { cn } from '../ui/Button'; // Assuming cn inside Button handles tailwind merges well

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <span className="font-bold text-lg text-gray-900">TranspoSys</span>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -mr-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full">
          {/* Contenedor centralizado con márgenes seguros y padding progresivo */}
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      <GlobalModal />
      <ChatbotWidget />
    </div>
  );
}
