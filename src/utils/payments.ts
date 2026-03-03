import type { EstadoPago, Student } from '../types';

/**
 * Calcula el estado de pago automático según el día del mes.
 * - Día 1-10: en_espera
 * - Después del día 10: impago (si no está pagado)
 */
export function calcularEstadoPago(student: Student, now: Date = new Date()): EstadoPago {
  if (student.estadoPago === 'pagado') return 'pagado';

  const dia = now.getDate();
  if (dia <= 10) return 'en_espera';
  return 'impago';
}

/**
 * Calcula el recargo según el día del mes.
 * - Día 1-10: 0%
 * - Día 11-20: 10%
 * - Después del día 20: 20%
 */
export function calcularRecargo(now: Date = new Date()): number {
  const dia = now.getDate();
  if (dia <= 10) return 0;
  if (dia <= 20) return 0.10;
  return 0.20;
}

/**
 * Calcula el monto final con recargo aplicado.
 */
export function calcularMontoConRecargo(montoBase: number, now: Date = new Date()): number {
  const recargo = calcularRecargo(now);
  return Math.round(montoBase * (1 + recargo));
}

/**
 * Calcula los días de mora desde el día 10 del mes actual.
 * Retorna 0 si estamos dentro del período de gracia (día 1-10).
 */
export function calcularDiasMora(now: Date = new Date()): number {
  const dia = now.getDate();
  if (dia <= 10) return 0;
  return dia - 10;
}

/**
 * Genera la fecha de vencimiento (día 10) del mes/año indicados.
 */
export function generarFechaVencimiento(year: number, month: number): string {
  const m = String(month).padStart(2, '0');
  return `${year}-${m}-10`;
}

/**
 * Obtiene la fecha de vencimiento del mes actual.
 */
export function fechaVencimientoActual(): string {
  const now = new Date();
  return generarFechaVencimiento(now.getFullYear(), now.getMonth() + 1);
}

/**
 * Retorna el nombre del mes en español.
 */
export function nombreMes(monthIndex: number): string {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return meses[monthIndex] || '';
}

/**
 * Retorna "Marzo 2026" para el mes actual.
 */
export function mesActualLabel(): string {
  const now = new Date();
  return `${nombreMes(now.getMonth())} ${now.getFullYear()}`;
}

/**
 * Retorna "2026-03" para el mes actual.
 */
export function mesActualKey(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${m}`;
}

/**
 * Formatea moneda ARS.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * Formatea una fecha YYYY-MM-DD a DD/MM/YYYY.
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Porcentaje de recargo para display.
 */
export function recargoLabel(now: Date = new Date()): string {
  const r = calcularRecargo(now);
  if (r === 0) return 'Sin recargo';
  return `+${Math.round(r * 100)}% recargo`;
}

/**
 * Color CSS según estado de pago.
 */
export function colorEstadoPago(estado: EstadoPago): string {
  switch (estado) {
    case 'en_espera': return 'yellow';
    case 'pagado': return 'green';
    case 'impago': return 'red';
  }
}
