import { create } from 'zustand';
import type { Student, EstadoPago, TipoPago } from '../types';
import { fechaVencimientoActual } from '../utils/payments';

interface StudentState {
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'fechaAlta'>) => { success: boolean; error?: string };
  editStudent: (id: number, data: Partial<Omit<Student, 'id'>>) => void;
  deleteStudent: (id: number) => void;
  marcarPagado: (id: number, tipoPago: TipoPago) => void;
  desmarcarPago: (id: number) => void;
  actualizarEstadosPago: () => void;
}

const venc = fechaVencimientoActual();

const initialStudents: Student[] = [
  { id: 1, nombre: 'Juan', apellido: 'Pérez', dni: '45123456', escuelaId: 1, escuela: 'Colegio San José', nivel: 'Primaria', turno: 'Mañana', valor: 25000, estadoPago: 'pagado', fechaVencimiento: venc, fechaPago: '2026-03-05', tipoPago: 'Efectivo', direccion: 'Calle Falsa 123', estado: 'active', fechaAlta: '2026-01-15' },
  { id: 2, nombre: 'María', apellido: 'López', dni: '46987654', escuelaId: 4, escuela: 'Liceo N°1', nivel: 'Primaria', turno: 'Tarde', valor: 25000, estadoPago: 'en_espera', fechaVencimiento: venc, fechaPago: null, tipoPago: null, direccion: 'Av. Siempre Viva 742', estado: 'active', fechaAlta: '2026-02-01' },
  { id: 3, nombre: 'Carlos', apellido: 'Ruiz', dni: '44555333', escuelaId: 3, escuela: 'Instituto Técnico', nivel: 'Secundaria', turno: 'Mañana', valor: 40000, estadoPago: 'impago', fechaVencimiento: '2026-02-10', fechaPago: null, tipoPago: null, direccion: 'Boulevard de los Sueños 55', estado: 'active', fechaAlta: '2026-02-10' },
  { id: 4, nombre: 'Ana', apellido: 'Gómez', dni: '47111222', escuelaId: 1, escuela: 'Colegio San José', nivel: 'Primaria', turno: 'Mañana', valor: 25000, estadoPago: 'pagado', fechaVencimiento: venc, fechaPago: '2026-03-02', tipoPago: 'Mercado Pago', direccion: 'Elm Street 13', estado: 'active', fechaAlta: '2026-02-20' },
  { id: 5, nombre: 'Pedro', apellido: 'Díaz', dni: '43333444', escuelaId: 2, escuela: 'Escuela Normal', nivel: 'Secundaria', turno: 'Mañana', valor: 20000, estadoPago: 'pagado', fechaVencimiento: venc, fechaPago: '2026-03-01', tipoPago: 'Efectivo', direccion: 'Wallaby 42', estado: 'active', fechaAlta: '2025-10-05' },
  { id: 6, nombre: 'Lucía', apellido: 'Fernández', dni: '48222111', escuelaId: 5, escuela: 'Colegio del Sol', nivel: 'Jardín', turno: 'Mañana', valor: 22000, estadoPago: 'en_espera', fechaVencimiento: venc, fechaPago: null, tipoPago: null, direccion: 'Av. Colón 300', estado: 'active', fechaAlta: '2026-03-01' },
  { id: 7, nombre: 'Tomás', apellido: 'Martínez', dni: '44888777', escuelaId: 2, escuela: 'Escuela Normal', nivel: 'Secundaria', turno: 'Tarde', valor: 20000, estadoPago: 'impago', fechaVencimiento: '2026-02-10', fechaPago: null, tipoPago: null, direccion: 'Ruta 8 km 52', estado: 'active', fechaAlta: '2026-01-20' },
  { id: 8, nombre: 'Sofía', apellido: 'Acosta', dni: '49333555', escuelaId: 6, escuela: 'Escuela Unificada N°3', nivel: 'Escuela Unificada', turno: 'Mañana', valor: 28000, estadoPago: 'en_espera', fechaVencimiento: venc, fechaPago: null, tipoPago: null, direccion: 'Lavalle 88', estado: 'active', fechaAlta: '2026-02-15' },
  { id: 9, nombre: 'Mateo', apellido: 'Vargas', dni: '45666777', escuelaId: 3, escuela: 'Instituto Técnico', nivel: 'Secundaria', turno: 'Tarde', valor: 40000, estadoPago: 'en_espera', fechaVencimiento: venc, fechaPago: null, tipoPago: null, direccion: 'San Juan 445', estado: 'active', fechaAlta: '2026-02-05' },
  { id: 10, nombre: 'Valentina', apellido: 'Torres', dni: '46111888', escuelaId: 1, escuela: 'Colegio San José', nivel: 'Primaria', turno: 'Tarde', valor: 25000, estadoPago: 'impago', fechaVencimiento: '2026-02-10', fechaPago: null, tipoPago: null, direccion: 'Córdoba 120', estado: 'active', fechaAlta: '2026-01-10' },
  { id: 11, nombre: 'Bruno', apellido: 'Castro', dni: '47999111', escuelaId: 1, escuela: 'Colegio San José', nivel: 'Primaria', turno: 'Mañana', valor: 25000, estadoPago: 'pagado', fechaVencimiento: venc, fechaPago: '2026-04-03', tipoPago: 'Mercado Pago', direccion: 'Pueyrredón 870', estado: 'active', fechaAlta: '2025-09-12' },
  { id: 12, nombre: 'Camila', apellido: 'Herrera', dni: '48555222', escuelaId: 4, escuela: 'Liceo N°1', nivel: 'Primaria', turno: 'Mañana', valor: 25000, estadoPago: 'en_espera', fechaVencimiento: venc, fechaPago: null, tipoPago: null, direccion: 'Belgrano 1250', estado: 'active', fechaAlta: '2026-02-25' },
  { id: 13, nombre: 'Diego', apellido: 'Romero', dni: '45111777', escuelaId: 2, escuela: 'Escuela Normal', nivel: 'Secundaria', turno: 'Mañana', valor: 20000, estadoPago: 'pagado', fechaVencimiento: venc, fechaPago: '2026-04-04', tipoPago: 'Efectivo', direccion: 'Mitre 600', estado: 'active', fechaAlta: '2025-08-20' },
  { id: 14, nombre: 'Florencia', apellido: 'Suárez', dni: '46222999', escuelaId: 3, escuela: 'Instituto Técnico', nivel: 'Secundaria', turno: 'Mañana', valor: 40000, estadoPago: 'impago', fechaVencimiento: '2026-02-10', fechaPago: null, tipoPago: null, direccion: 'Independencia 215', estado: 'active', fechaAlta: '2026-01-22' },
  { id: 15, nombre: 'Gonzalo', apellido: 'Méndez', dni: '47888333', escuelaId: 1, escuela: 'Colegio San José', nivel: 'Primaria', turno: 'Tarde', valor: 25000, estadoPago: 'pagado', fechaVencimiento: venc, fechaPago: '2026-04-02', tipoPago: 'Efectivo', direccion: 'Las Heras 980', estado: 'active', fechaAlta: '2026-03-05' },
  { id: 16, nombre: 'Helena', apellido: 'Aguirre', dni: '48444666', escuelaId: 5, escuela: 'Colegio del Sol', nivel: 'Jardín', turno: 'Mañana', valor: 22000, estadoPago: 'en_espera', fechaVencimiento: venc, fechaPago: null, tipoPago: null, direccion: 'Urquiza 45', estado: 'active', fechaAlta: '2026-03-10' },
  { id: 17, nombre: 'Iván', apellido: 'Bravo', dni: '45777888', escuelaId: 6, escuela: 'Escuela Unificada N°3', nivel: 'Escuela Unificada', turno: 'Mañana', valor: 28000, estadoPago: 'pagado', fechaVencimiento: venc, fechaPago: '2026-04-05', tipoPago: 'Mercado Pago', direccion: 'Alvear 720', estado: 'active', fechaAlta: '2025-11-18' },
  { id: 18, nombre: 'Julieta', apellido: 'Castro', dni: '49111444', escuelaId: 6, escuela: 'Escuela Unificada N°3', nivel: 'Escuela Unificada', turno: 'Mañana', valor: 28000, estadoPago: 'impago', fechaVencimiento: '2026-02-10', fechaPago: null, tipoPago: null, direccion: 'Lavalle 412', estado: 'active', fechaAlta: '2026-01-08' },
  { id: 19, nombre: 'Kevin', apellido: 'Ortega', dni: '46555111', escuelaId: 1, escuela: 'Colegio San José', nivel: 'Primaria', turno: 'Mañana', valor: 25000, estadoPago: 'en_espera', fechaVencimiento: venc, fechaPago: null, tipoPago: null, direccion: 'Sarmiento 333', estado: 'active', fechaAlta: '2026-03-15' },
  { id: 20, nombre: 'Lara', apellido: 'Pinto', dni: '47333222', escuelaId: 4, escuela: 'Liceo N°1', nivel: 'Primaria', turno: 'Tarde', valor: 25000, estadoPago: 'pagado', fechaVencimiento: venc, fechaPago: '2026-04-01', tipoPago: 'Efectivo', direccion: 'San Lorenzo 510', estado: 'active', fechaAlta: '2025-12-01' },
];

export const useStudentStore = create<StudentState>((set, get) => ({
  students: initialStudents,

  addStudent: (newStudent) => {
    const { students } = get();
    const dniExists = students.some((s) => s.dni === newStudent.dni);
    if (dniExists) {
      return { success: false, error: 'Ya existe un alumno registrado con ese DNI.' };
    }
    const today = new Date().toISOString().split('T')[0];
    set((state) => ({
      students: [
        ...state.students,
        {
          ...newStudent,
          id: Math.max(...state.students.map((s) => s.id), 0) + 1,
          fechaAlta: today,
        },
      ],
    }));
    return { success: true };
  },

  editStudent: (id, data) =>
    set((state) => ({
      students: state.students.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),

  deleteStudent: (id) =>
    set((state) => ({
      students: state.students.filter((s) => s.id !== id),
    })),

  marcarPagado: (id, tipoPago) => {
    const today = new Date().toISOString().split('T')[0];
    set((state) => ({
      students: state.students.map((s) =>
        s.id === id
          ? { ...s, estadoPago: 'pagado' as EstadoPago, fechaPago: today, tipoPago }
          : s
      ),
    }));
  },

  desmarcarPago: (id) => {
    const now = new Date();
    const dia = now.getDate();
    const nuevoEstado: EstadoPago = dia <= 10 ? 'en_espera' : 'impago';
    set((state) => ({
      students: state.students.map((s) =>
        s.id === id
          ? { ...s, estadoPago: nuevoEstado, fechaPago: null, tipoPago: null }
          : s
      ),
    }));
  },

  actualizarEstadosPago: () => {
    const now = new Date();
    const dia = now.getDate();
    if (dia <= 10) return; // No hay nada que actualizar en período de gracia
    set((state) => ({
      students: state.students.map((s) => {
        if (s.estadoPago === 'en_espera' && s.estado === 'active') {
          return { ...s, estadoPago: 'impago' as EstadoPago };
        }
        return s;
      }),
    }));
  },
}));
