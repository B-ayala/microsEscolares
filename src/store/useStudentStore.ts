import { create } from 'zustand';

export interface Student {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  escuela: string;
  direccion: string;
  turno: 'Mañana' | 'Tarde' | 'Doble';
  valor: number;
  estadoPago: 'paid' | 'pending' | 'overdue';
  estado: 'active' | 'inactive';
  fechaAlta: string;
}

interface StudentState {
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'fechaAlta'>) => { success: boolean; error?: string };
}

const initialStudents: Student[] = [
  { id: 1, nombre: 'Juan', apellido: 'Pérez', dni: '45123456', escuela: 'Colegio San José', direccion: 'Calle Falsa 123', turno: 'Mañana', valor: 25000, estadoPago: 'paid', estado: 'active', fechaAlta: '2026-01-15' },
  { id: 2, nombre: 'María', apellido: 'López', dni: '46987654', escuela: 'Liceo N°1', direccion: 'Av. Siempre Viva 742', turno: 'Tarde', valor: 25000, estadoPago: 'pending', estado: 'active', fechaAlta: '2026-02-01' },
  { id: 3, nombre: 'Carlos', apellido: 'Ruiz', dni: '44555333', escuela: 'Instituto Técnico', direccion: 'Boulevard de los Sueños 55', turno: 'Doble', valor: 40000, estadoPago: 'overdue', estado: 'active', fechaAlta: '2026-02-10' },
  { id: 4, nombre: 'Ana', apellido: 'Gómez', dni: '47111222', escuela: 'Colegio San José', direccion: 'Elm Street 13', turno: 'Mañana', valor: 25000, estadoPago: 'paid', estado: 'active', fechaAlta: '2026-02-20' },
  { id: 5, nombre: 'Pedro', apellido: 'Díaz', dni: '43333444', escuela: 'Escuela Normal', direccion: 'Wallaby 42', turno: 'Mañana', valor: 20000, estadoPago: 'paid', estado: 'inactive', fechaAlta: '2025-10-05' },
];

export const useStudentStore = create<StudentState>((set, get) => ({
  students: initialStudents,
  addStudent: (newStudent) => {
    const { students } = get();
    
    // Validar DNI único
    const dniExists = students.some((s) => s.dni === newStudent.dni);
    if (dniExists) {
      return { success: false, error: 'Ya existe un alumno registrado con ese DNI.' };
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

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
}));
