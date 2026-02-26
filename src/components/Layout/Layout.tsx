import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ChatbotWidget from './ChatbotWidget';
import GlobalModal from '../modal/GlobalModal';

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header -> TODO: Add Hamburger menu here for mobile later */}
        <header className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center px-4">
          <span className="font-bold text-lg text-gray-900">TranspoSys</span>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <GlobalModal />
      <ChatbotWidget />
    </div>
  );
}
