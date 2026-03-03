import type { School, Student } from '../types';
import { calcularDiasMora, calcularMontoConRecargo, formatCurrency } from './payments';

export type Priority = 'info' | 'warning' | 'critical';

export interface Insight {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  iconName: 'TrendingDown' | 'AlertTriangle' | 'DollarSign' | 'Bus' | 'UserX';
}

export function generateInsights(schools: School[], students: Student[]): Insight[] {
  const insights: Insight[] = [];

  if (schools.length === 0 || students.length === 0) return insights;

  const now = new Date();
  const active = students.filter((s) => s.estado === 'active');
  const avgStudents = Math.max(active.length / schools.length, 1);
  const lowDemandThreshold = avgStudents * 0.4;

  // 1. Escuela con baja demanda
  schools.forEach((school) => {
    const count = active.filter((s) => s.escuelaId === school.id).length;
    if (count < lowDemandThreshold && count > 0) {
      insights.push({
        id: `low-demand-${school.id}`,
        title: 'Baja matrícula detectada',
        description: `${school.nombre} tiene solo ${count} alumnos activos, muy por debajo del promedio.`,
        priority: 'info',
        iconName: 'TrendingDown',
      });
    }
  });

  // 2. Alto nivel de morosidad por escuela
  schools.forEach((school) => {
    const schoolStudents = active.filter((s) => s.escuelaId === school.id);
    if (schoolStudents.length > 0) {
      const unpaid = schoolStudents.filter((s) => s.estadoPago === 'en_espera' || s.estadoPago === 'impago').length;
      const pct = unpaid / schoolStudents.length;
      if (pct >= 0.3) {
        insights.push({
          id: `high-debt-${school.id}`,
          title: 'Alto nivel de morosidad',
          description: `El ${(pct * 100).toFixed(0)}% de los alumnos de ${school.nombre} tienen pagos atrasados o pendientes.`,
          priority: pct > 0.5 ? 'critical' : 'warning',
          iconName: 'AlertTriangle',
        });
      }
    }
  });

  // 3. Alumnos impagos
  const impagos = active.filter((s) => s.estadoPago === 'impago');
  if (impagos.length > 0) {
    const dias = calcularDiasMora(now);
    const totalDeuda = impagos.reduce((sum, s) => sum + calcularMontoConRecargo(s.valor, now), 0);
    insights.push({
      id: 'impago-students',
      title: 'Cobros críticos vencidos',
      description: `Hay ${impagos.length} pasajero(s) impagos (${dias} días de mora). Deuda total: ${formatCurrency(totalDeuda)}.`,
      priority: 'critical',
      iconName: 'UserX',
    });
  }

  // 4. Alumnos en espera (informativo)
  const enEspera = active.filter((s) => s.estadoPago === 'en_espera');
  if (enEspera.length > 3) {
    insights.push({
      id: 'en-espera-students',
      title: 'Pagos en espera',
      description: `${enEspera.length} alumno(s) aún no realizaron el pago. Período sin recargo vigente.`,
      priority: 'info',
      iconName: 'DollarSign',
    });
  }

  // 5. Escuela con mayor facturación estimada
  let maxRevenue = 0;
  let topSchool = '';
  schools.forEach((school) => {
    const revenue = active
      .filter((s) => s.escuelaId === school.id)
      .reduce((sum, s) => sum + s.valor, 0);
    if (revenue > maxRevenue) {
      maxRevenue = revenue;
      topSchool = school.nombre;
    }
  });

  if (topSchool && maxRevenue > 0) {
    insights.push({
      id: 'top-revenue',
      title: 'Mayor recaudación estimada',
      description: `${topSchool} lidera los ingresos esperados mensuales por valor de ${formatCurrency(maxRevenue)}.`,
      priority: 'info',
      iconName: 'DollarSign',
    });
  }

  return insights;
}
