import { NavLink } from 'react-router-dom';
import { LayoutDashboard, School, Users, CreditCard, LogOut, Bus, Receipt, Wallet, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Escuelas', href: '/schools', icon: School },
  { name: 'Alumnos', href: '/students', icon: Users },
  { name: 'Colectivos', href: '/buses', icon: Bus },
  { name: 'Control de Gastos', href: '/expenses', icon: Receipt },
  { name: 'Pagos Empleados', href: '/employee-payments', icon: Wallet },
];

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export default function Sidebar({ className, onClose }: SidebarProps) {
  return (
    <div className={twMerge("flex flex-col w-72 bg-[linear-gradient(90deg,rgb(0,0,0)_0%,rgb(90,85,214)_100%)] border-r border-white/10 h-screen shadow-xl", className)}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/30 p-2 rounded-lg">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-white tracking-wide">MicrosMiguel</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-white hover:bg-white/10 rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="flex-1 px-4 space-y-1.5">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                twMerge(
                  clsx(
                    'group flex items-center px-4 py-3.5 text-base font-semibold rounded-lg transition-all duration-200 min-h-[48px] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40',
                    isActive
                      ? 'bg-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]'
                      : 'text-violet-50 hover:bg-white/15 hover:text-white'
                  )
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={clsx(
                      'mr-4 flex-shrink-0 h-6 w-6 transition-colors duration-200',
                      isActive ? 'text-white' : 'text-violet-100 group-hover:text-white'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10 mb-2">
        <button className="flex items-center w-full px-4 py-3.5 text-base font-semibold text-violet-50 rounded-lg hover:bg-white/15 hover:text-white transition-all duration-200 min-h-[48px] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40">
          <LogOut className="mr-4 h-6 w-6 text-violet-100" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
