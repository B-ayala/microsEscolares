// ── Tipos principales del sistema MicrosMiguel ──

export type Turno = 'Mañana' | 'Tarde';
export type Nivel = 'Jardín' | 'Primaria' | 'Secundaria' | 'Escuela Unificada';
export type EstadoPago = 'en_espera' | 'pagado' | 'impago';
export type FilterEstado = EstadoPago | 'all' | 'vencido_con_mora';
export type TipoPago = 'Efectivo' | 'Mercado Pago';
export type EstadoEscuela = 'Activa' | 'Inactiva';

// ── Escuela ──
export interface School {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  email?: string;
  nivel: Nivel;
  estado: EstadoEscuela;
}

// ── Alumno ──
export interface Student {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  escuelaId: number;
  escuela: string; // nombre de la escuela (denormalizado para display)
  nivel: Nivel;
  turno: Turno;
  valor: number; // monto mensual base
  estadoPago: EstadoPago;
  fechaVencimiento: string; // YYYY-MM-DD (día 10 de cada mes)
  fechaPago: string | null; // YYYY-MM-DD o null si no pagó
  tipoPago: TipoPago | null; // null si no pagó
  direccion: string;
  estado: 'active' | 'inactive';
  fechaAlta: string; // YYYY-MM-DD
}

// ── Pago (registro histórico) ──
export interface PaymentRecord {
  id: number;
  studentId: number;
  alumno: string;
  escuela: string;
  mes: string; // "Marzo 2026"
  montoBase: number;
  recargo: number;
  montoFinal: number;
  estado: EstadoPago;
  fechaPago: string | null;
  tipoPago: TipoPago | null;
  diasMora: number;
}

// ── Colectivo ──
export interface Bus {
  id: number;
  patente: string;
  capacidad: number;
  conductor: string;
  celador: string;
  escuelasAsignadas: number[]; // IDs de escuelas
  turno: Turno;
  estado: 'Activo' | 'Inactivo' | 'En mantenimiento';
}

// ── Gasto ──
export type TipoGasto = 'Conductor' | 'Celador' | 'Combustible' | 'Mantenimiento' | 'Seguro' | 'Otro';

export interface Expense {
  id: number;
  descripcion: string;
  tipo: TipoGasto;
  monto: number;
  fecha: string; // YYYY-MM-DD
  mes: string; // "2026-03"
}

// ── Pago de Empleado ──
export type RolEmpleado = 'Conductor' | 'Celador';

export interface Employee {
  id: number;
  nombre: string;
  apellido: string;
  rol: RolEmpleado;
  salario: number;
}

export interface EmployeePayment {
  id: number;
  empleadoId: number;
  empleado: string;
  rol: RolEmpleado;
  mes: string; // "2026-03"
  monto: number;
  fechaPago: string | null;
  pagado: boolean;
}

// ── Ordenamiento ──
export type SortField = 'escuela' | 'apellido' | 'estadoPago' | 'diasMora';
export type SortDirection = 'asc' | 'desc';
