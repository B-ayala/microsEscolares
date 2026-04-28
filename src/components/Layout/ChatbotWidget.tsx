import { useState, useRef, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  X,
  Bot,
  ArrowLeft,
  Users,
  School as SchoolIcon,
  AlertCircle,
  TrendingDown,
  BarChart3,
  ChevronRight,
  Trophy,
  Hash,
  type LucideIcon,
} from 'lucide-react';
import { Button, cn } from '../ui/Button';
import { useModalStore } from '../../store/useModalStore';
import { useStudentStore } from '../../store/useStudentStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import {
  calcularMontoConRecargo,
  formatCurrency,
  mesActualLabel,
} from '../../utils/payments';

type MenuId = 'root' | 'alumnos';

type QueryId =
  | 'alumnos-con-deuda'
  | 'top-alumnos-deuda'
  | 'cantidad-adeudados'
  | 'escuelas-adeudadas'
  | 'escuelas-mayor-deuda'
  | 'alumnos-mayor-deuda'
  | 'resumen-general';

interface MenuOption {
  id: string;
  label: string;
  icon: LucideIcon;
  submenu?: MenuId;
  query?: QueryId;
}

const MENUS: Record<MenuId, { title: string; options: MenuOption[] }> = {
  root: {
    title: '¿En qué te puedo ayudar?',
    options: [
      { id: 'alumnos', label: 'Alumnos', icon: Users, submenu: 'alumnos' },
      { id: 'escuelas-adeudadas', label: 'Escuelas adeudadas', icon: SchoolIcon, query: 'escuelas-adeudadas' },
      { id: 'escuelas-mayor-deuda', label: 'Escuelas con mayor deuda', icon: TrendingDown, query: 'escuelas-mayor-deuda' },
      { id: 'alumnos-mayor-deuda', label: 'Alumnos con mayor deuda', icon: Trophy, query: 'alumnos-mayor-deuda' },
      { id: 'resumen-general', label: 'Resumen general', icon: BarChart3, query: 'resumen-general' },
    ],
  },
  alumnos: {
    title: '¿Qué querés saber sobre los alumnos?',
    options: [
      { id: 'alumnos-con-deuda', label: 'Alumnos con deuda', icon: AlertCircle, query: 'alumnos-con-deuda' },
      { id: 'top-alumnos-deuda', label: 'Top con mayor deuda', icon: Trophy, query: 'top-alumnos-deuda' },
      { id: 'cantidad-adeudados', label: 'Cantidad total adeudados', icon: Hash, query: 'cantidad-adeudados' },
    ],
  },
};

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: ReactNode;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: 'init',
  type: 'bot',
  content: (
    <p className="text-base leading-relaxed">
      ¡Hola! Soy <strong>TranspoBot</strong>. Elegí una opción de abajo y te
      muestro la información al instante.
    </p>
  ),
  timestamp: new Date(),
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [currentMenu, setCurrentMenu] = useState<MenuId>('root');
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  const isModalOpen = useModalStore((s) => s.isOpen);
  const students = useStudentStore((s) => s.students);
  const schools = useSchoolStore((s) => s.schools);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowTooltip(false);
    } else if (!tooltipDismissed) {
      const timer = setTimeout(() => setShowTooltip(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen, isLoading, tooltipDismissed]);

  const queryRunner = useMemo(
    () => buildQueryRunner(students, schools),
    [students, schools]
  );

  const handleSelectOption = (option: MenuOption) => {
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      type: 'user',
      content: option.label,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    if (option.submenu) {
      setCurrentMenu(option.submenu);
      return;
    }

    if (option.query) {
      setIsLoading(true);
      const result = queryRunner(option.query);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            type: 'bot',
            content: result,
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
      }, 700);
    }
  };

  const handleBack = () => {
    setCurrentMenu('root');
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const menu = MENUS[currentMenu];
  const inSubmenu = currentMenu !== 'root';

  return (
    <>
      {/* Tooltip Bubble */}
      <div
        className={cn(
          'fixed bottom-24 right-4 sm:right-6 max-w-[calc(100vw-2rem)] bg-white px-4 py-3 rounded-2xl shadow-xl shadow-violet-500/10 border border-violet-100 z-50 transition-all duration-500 origin-bottom-right',
          showTooltip && !isOpen && !isModalOpen
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm sm:text-base font-medium text-gray-800 whitespace-nowrap">
            ¿Necesitás ayuda?
          </span>
          <button
            onClick={() => {
              setShowTooltip(false);
              setTooltipDismissed(true);
            }}
            className="text-gray-600 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Cerrar sugerencia"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute -bottom-2 right-4 sm:right-6 w-4 h-4 bg-white border-b border-r border-violet-100 transform rotate-45" />
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-4 rounded-full shadow-lg shadow-violet-500/40 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-violet-500/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 z-50 min-h-[56px] min-w-[56px] flex items-center justify-center',
          'bg-gradient-to-r from-violet-600 to-violet-500 text-white',
          isOpen || isModalOpen
            ? 'scale-0 opacity-0 pointer-events-none'
            : 'scale-100 opacity-100'
        )}
        aria-label="Abrir asistente TranspoBot"
      >
        <Bot className="w-7 h-7" />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          'fixed z-50 bg-white shadow-2xl flex flex-col overflow-hidden border border-gray-200 transition-all duration-300 origin-bottom-right',
          'inset-x-2 bottom-2 top-[4.5rem] rounded-2xl',
          'sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[640px] sm:max-h-[calc(100vh-3rem)]',
          isOpen && !isModalOpen
            ? 'scale-100 opacity-100 pointer-events-auto'
            : 'scale-50 opacity-0 pointer-events-none'
        )}
        role="dialog"
        aria-label="Asistente TranspoBot"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 to-violet-500 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 shadow-sm shrink-0">
          {inSubmenu && (
            <button
              onClick={handleBack}
              className="text-white/90 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              aria-label="Volver al menú principal"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="bg-white/20 p-2 rounded-full shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-base truncate">
                TranspoBot
              </h3>
              <p className="text-violet-100 text-sm truncate">
                Asistente Virtual
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/90 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="Cerrar asistente"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex w-full',
                msg.type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[88%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base shadow-sm',
                  msg.type === 'user'
                    ? 'bg-violet-600 text-white rounded-tr-sm font-medium'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                )}
              >
                {msg.type === 'bot' && (
                  <div className="flex items-center gap-2 mb-2 text-violet-700">
                    <Bot className="w-4 h-4" />
                    <span className="text-sm font-semibold uppercase tracking-wide">
                      TranspoBot
                    </span>
                  </div>
                )}
                <div className="leading-relaxed">{msg.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
                <span className="text-sm text-gray-700 mr-1">Buscando</span>
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Menu (sticky footer) */}
        <div className="border-t border-gray-200 bg-white p-3 sm:p-4 space-y-2 sm:space-y-3 shrink-0 max-h-[48%] sm:max-h-[55%] overflow-y-auto">
          <p className="text-sm sm:text-base font-semibold text-gray-900 text-center">
            {menu.title}
          </p>
          <div className="space-y-1.5 sm:space-y-2">
            {menu.options.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-between text-left font-semibold sm:text-sm h-auto py-2.5 sm:py-3"
                  onClick={() => handleSelectOption(option)}
                  disabled={isLoading}
                >
                  <span className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                    <span className="truncate text-sm">{option.label}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" />
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Result rendering helpers ─────────────────────────────────────

function ResultBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-base font-bold text-gray-900">{title}</p>
        {subtitle && <p className="text-sm text-gray-700">{subtitle}</p>}
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
        {children}
      </div>
    </div>
  );
}

function ResultEmpty({ msg }: { msg: string }) {
  return (
    <p className="text-base font-medium text-success">{msg}</p>
  );
}

function StatRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
      <span className="text-base text-gray-700">{label}</span>
      <span className={cn('text-base font-bold', danger ? 'text-danger' : 'text-gray-900')}>
        {value}
      </span>
    </div>
  );
}

// ── Query runners ────────────────────────────────────────────────

function buildQueryRunner(
  students: ReturnType<typeof useStudentStore.getState>['students'],
  schools: ReturnType<typeof useSchoolStore.getState>['schools']
) {
  return function run(query: QueryId): ReactNode {
    const activos = students.filter((s) => s.estado === 'active');
    const impagos = activos.filter((s) => s.estadoPago === 'impago');
    const totalAdeudado = impagos.reduce(
      (sum, s) => sum + calcularMontoConRecargo(s.valor),
      0
    );

    switch (query) {
      case 'alumnos-con-deuda': {
        if (impagos.length === 0) {
          return <ResultEmpty msg="¡Buenas noticias! No hay alumnos con deuda." />;
        }
        return (
          <ResultBlock
            title={`${impagos.length} alumno(s) con deuda`}
            subtitle={mesActualLabel()}
          >
            <ul className="divide-y divide-gray-200">
              {impagos.map((s) => (
                <li key={s.id} className="py-2.5 flex justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-gray-900 truncate">
                      {s.apellido}, {s.nombre}
                    </p>
                    <p className="text-sm text-gray-700 truncate">{s.escuela}</p>
                  </div>
                  <p className="text-base font-bold text-danger shrink-0">
                    {formatCurrency(calcularMontoConRecargo(s.valor))}
                  </p>
                </li>
              ))}
            </ul>
          </ResultBlock>
        );
      }

      case 'top-alumnos-deuda':
      case 'alumnos-mayor-deuda': {
        if (impagos.length === 0) {
          return <ResultEmpty msg="¡Buenas noticias! No hay alumnos con deuda." />;
        }
        const top = [...impagos]
          .sort((a, b) => calcularMontoConRecargo(b.valor) - calcularMontoConRecargo(a.valor))
          .slice(0, 5);
        return (
          <ResultBlock
            title="Top 5 alumnos con mayor deuda"
            subtitle={mesActualLabel()}
          >
            <ul className="space-y-2">
              {top.map((s, idx) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-2.5"
                >
                  <span className="w-7 h-7 rounded-full bg-violet-100 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-gray-900 truncate">
                      {s.apellido}, {s.nombre}
                    </p>
                    <p className="text-sm text-gray-700 truncate">{s.escuela}</p>
                  </div>
                  <p className="text-base font-bold text-danger shrink-0">
                    {formatCurrency(calcularMontoConRecargo(s.valor))}
                  </p>
                </li>
              ))}
            </ul>
          </ResultBlock>
        );
      }

      case 'cantidad-adeudados': {
        return (
          <ResultBlock title="Resumen de alumnos con deuda" subtitle={mesActualLabel()}>
            <StatRow label="Alumnos adeudados" value={String(impagos.length)} danger={impagos.length > 0} />
            <StatRow label="Total alumnos activos" value={String(activos.length)} />
            <StatRow label="Monto total adeudado" value={formatCurrency(totalAdeudado)} danger />
          </ResultBlock>
        );
      }

      case 'escuelas-adeudadas': {
        const porEscuela = schools.map((school) => {
          const cant = impagos.filter((s) => s.escuelaId === school.id).length;
          return { school, cant };
        }).filter((x) => x.cant > 0)
          .sort((a, b) => b.cant - a.cant);

        if (porEscuela.length === 0) {
          return <ResultEmpty msg="No hay escuelas con alumnos adeudados." />;
        }
        return (
          <ResultBlock
            title={`${porEscuela.length} escuela(s) con deuda`}
            subtitle="Ordenadas por cantidad de alumnos"
          >
            <ul className="space-y-2">
              {porEscuela.map(({ school, cant }) => (
                <li
                  key={school.id}
                  className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg p-2.5"
                >
                  <p className="text-base font-semibold text-gray-900 truncate">
                    {school.nombre}
                  </p>
                  <span className="text-sm font-bold text-danger bg-red-50 border border-red-200 px-2.5 py-1 rounded-full shrink-0">
                    {cant} alumno{cant !== 1 ? 's' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </ResultBlock>
        );
      }

      case 'escuelas-mayor-deuda': {
        const porEscuela = schools.map((school) => {
          const monto = impagos
            .filter((s) => s.escuelaId === school.id)
            .reduce((sum, s) => sum + calcularMontoConRecargo(s.valor), 0);
          return { school, monto };
        }).filter((x) => x.monto > 0)
          .sort((a, b) => b.monto - a.monto)
          .slice(0, 5);

        if (porEscuela.length === 0) {
          return <ResultEmpty msg="No hay escuelas con deuda." />;
        }
        return (
          <ResultBlock
            title="Escuelas con mayor deuda"
            subtitle={mesActualLabel()}
          >
            <ul className="space-y-2">
              {porEscuela.map(({ school, monto }, idx) => (
                <li
                  key={school.id}
                  className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-2.5"
                >
                  <span className="w-7 h-7 rounded-full bg-violet-100 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-base font-semibold text-gray-900 truncate flex-1">
                    {school.nombre}
                  </p>
                  <p className="text-base font-bold text-danger shrink-0">
                    {formatCurrency(monto)}
                  </p>
                </li>
              ))}
            </ul>
          </ResultBlock>
        );
      }

      case 'resumen-general': {
        const pagados = activos.filter((s) => s.estadoPago === 'pagado').length;
        const enEspera = activos.filter((s) => s.estadoPago === 'en_espera').length;
        return (
          <ResultBlock title="Resumen general" subtitle={mesActualLabel()}>
            <StatRow label="Escuelas registradas" value={String(schools.length)} />
            <StatRow label="Alumnos activos" value={String(activos.length)} />
            <StatRow label="Pagos al día" value={String(pagados)} />
            <StatRow label="En espera" value={String(enEspera)} />
            <StatRow
              label="Adeudados"
              value={String(impagos.length)}
              danger={impagos.length > 0}
            />
            <StatRow
              label="Monto total adeudado"
              value={formatCurrency(totalAdeudado)}
              danger={totalAdeudado > 0}
            />
          </ResultBlock>
        );
      }
    }
  };
}
