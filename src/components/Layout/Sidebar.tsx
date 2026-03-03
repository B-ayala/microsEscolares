import { NavLink } from 'react-router-dom';
import { LayoutDashboard, School, Users, LogOut, Bus, Receipt, Wallet, X } from 'lucide-react';
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
    <div className={twMerge("flex flex-col w-64 bg-[linear-gradient(90deg,rgb(0,0,0)_0%,rgb(90,85,214)_100%)] border-r border-white/10 h-screen shadow-xl", className)}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Bus className="w-5 h-5 text-violet-300" />
          </div>
          <span className="font-bold text-lg text-white tracking-wide">TranspoSys</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 text-violet-300 hover:text-white focus:outline-none"
            title="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                twMerge(
                  clsx(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]'
                      : 'text-violet-200/70 hover:bg-white/10 hover:text-white'
                  )
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={clsx(
                      'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200',
                      isActive ? 'text-white' : 'text-violet-300/50 group-hover:text-violet-200'
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
        <button className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-violet-200/70 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200">
          <LogOut className="mr-3 h-5 w-5 text-violet-300/50 group-hover:text-violet-200" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
