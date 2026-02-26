import type { School } from '../store/useSchoolStore';
import type { Student } from '../store/useStudentStore';

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

  // 1. Escuela con baja demanda de alumnos (info/warning)
  // Calculamos el promedio de alumnos global para determinar "baja demanda"
  const totalStudents = students.filter(s => s.estado === 'active').length;
  const avgStudents = Math.max(totalStudents / schools.length, 1);
  const lowDemandThreshold = avgStudents * 0.4; // 40% debajo del promedio

  schools.forEach(school => {
    const schoolStudents = students.filter(s => s.escuela === school.nombre && s.estado === 'active');
    if (schoolStudents.length < lowDemandThreshold) {
      insights.push({
        id: `low-demand-${school.id}`,
        title: 'Baja matrícula detectada',
        description: `${school.nombre} tiene solo ${schoolStudents.length} alumnos activos, muy por debajo del promedio.`,
        priority: 'info',
        iconName: 'TrendingDown'
      });
    }
  });

  // 2. Alto nivel de morosidad por escuela (warning/critical)
  schools.forEach(school => {
    const schoolStudents = students.filter(s => s.escuela === school.nombre && s.estado === 'active');
    if (schoolStudents.length > 0) {
      const unpaidCount = schoolStudents.filter(s => s.estadoPago === 'pending' || s.estadoPago === 'overdue').length;
      const unpaidPercentage = unpaidCount / schoolStudents.length;
      
      if (unpaidPercentage >= 0.3) {
        insights.push({
          id: `high-debt-${school.id}`,
          title: 'Alto nivel de morosidad',
          description: `El ${(unpaidPercentage * 100).toFixed(0)}% de los alumnos de ${school.nombre} tienen pagos atrasados o pendientes.`,
          priority: unpaidPercentage > 0.5 ? 'critical' : 'warning',
          iconName: 'AlertTriangle'
        });
      }
    }
  });

  // 3. Alumno crítico impago (critical)
  // Utilizamos el listado de todos los vencidos
  const overdueStudents = students.filter(s => s.estadoPago === 'overdue' && s.estado === 'active');
  if (overdueStudents.length > 0) {
    const exampleStudent = overdueStudents[0];
    insights.push({
      id: 'overdue-students',
      title: 'Cobros críticos vencidos',
      description: `Hay ${overdueStudents.length} pasajero(s) con pago vencido (ej. ${exampleStudent.nombre} ${exampleStudent.apellido}).`,
      priority: 'critical',
      iconName: 'UserX'
    });
  }

  // 4. Logística: Muchos alumnos en doble turno (info/warning)
  schools.forEach(school => {
    const doubleShiftCount = students.filter(s => s.escuela === school.nombre && s.turno === 'Doble' && s.estado === 'active').length;
    // Asumimos que más de 2 alumnos en doble turno en la misma escuela amerita revisar la logística de asientos
    if (doubleShiftCount > 2) {
      insights.push({
        id: `logistics-${school.id}`,
        title: 'Ocupación logística alta',
        description: `${school.nombre} tiene ${doubleShiftCount} alumnos en Turno Doble. Sugerencia: Planificar cupos de viaje.`,
        priority: 'warning',
        iconName: 'Bus'
      });
    }
  });

  // 5. Escuela con mayor facturación estimada (info)
  let maxRevenue = 0;
  let topSchool = '';
  schools.forEach(school => {
    const schoolStudents = students.filter(s => s.escuela === school.nombre && s.estado === 'active');
    const revenue = schoolStudents.reduce((sum, s) => sum + s.valor, 0);
    if (revenue > maxRevenue) {
      maxRevenue = revenue;
      topSchool = school.nombre;
    }
  });

  if (topSchool && maxRevenue > 0) {
    insights.push({
      id: 'top-revenue',
      title: 'Mayor recaudación estimada',
      description: `${topSchool} lidera los ingresos esperados mensuales por valor de $${maxRevenue.toLocaleString('es-AR')}.`,
      priority: 'info',
      iconName: 'DollarSign'
    });
  }

  return insights;
}
