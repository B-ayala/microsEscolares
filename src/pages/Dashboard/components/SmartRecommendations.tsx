import { useMemo } from 'react';
import { TrendingDown, AlertTriangle, DollarSign, Bus, UserX, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useSchoolStore } from '../../../store/useSchoolStore';
import { useStudentStore } from '../../../store/useStudentStore';
import { generateInsights } from '../../../utils/analytics';
import type { Insight } from '../../../utils/analytics';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const ICON_MAP = {
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Bus,
  UserX,
};

const PRIORITY_STYLES = {
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
};

const ICON_STYLES = {
  info: 'text-blue-500',
  warning: 'text-yellow-600',
  critical: 'text-red-600',
};

export default function SmartRecommendations() {
  const schools = useSchoolStore((state) => state.schools);
  const students = useStudentStore((state) => state.students);

  const insights: Insight[] = useMemo(() => {
    return generateInsights(schools, students);
  }, [schools, students]);

  if (insights.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
          <h3 className="text-lg font-semibold text-green-800">Todo funciona correctamente este mes</h3>
          <p className="text-green-600/80 text-sm mt-1">No hay alertas logísticas ni de morosidad pendientes.</p>
        </CardContent>
      </Card>
    );
  }

  // Ordenar para mostrar críticos primero
  const sortedInsights = [...insights].sort((a, b) => {
    const priorityWeight = { critical: 3, warning: 2, info: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

  return (
    <Card className="border-t-4 border-t-gray-800 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          <CardTitle>Recomendaciones Inteligentes</CardTitle>
        </div>
        <p className="text-sm text-gray-500">Alertas y sugerencias basadas en el análisis de tus datos.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedInsights.map((insight) => {
          const Icon = ICON_MAP[insight.iconName];
          return (
            <div
              key={insight.id}
              className={twMerge(
                clsx(
                  'flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md',
                  PRIORITY_STYLES[insight.priority]
                )
              )}
            >
              <div className="mt-0.5 shrink-0">
                <Icon className={twMerge(clsx('w-5 h-5', ICON_STYLES[insight.priority]))} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-0.5">{insight.title}</h4>
                <p className="text-sm opacity-90 leading-relaxed">{insight.description}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
