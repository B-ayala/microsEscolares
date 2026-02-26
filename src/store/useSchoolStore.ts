import { create } from 'zustand';

export interface School {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  email?: string;
  alumnos: number;
  facturado: number;
  estado: 'Activa' | 'Inactiva';
}

interface SchoolState {
  schools: School[];
  addSchool: (school: Omit<School, 'id' | 'alumnos' | 'facturado'>) => void;
  // TODO: add other operations like edit/delete when needed
}

const initialSchools: School[] = [
  { id: 1, nombre: 'Colegio San José', direccion: 'Av. Mitre 1234', telefono: '4455-6677', alumnos: 120, facturado: 3000000, estado: 'Activa' },
  { id: 2, nombre: 'Escuela Normal', direccion: 'San Martín 555', telefono: '4422-1188', alumnos: 85, facturado: 1700000, estado: 'Activa' },
  { id: 3, nombre: 'Instituto Técnico', direccion: 'Belgrano 890', telefono: '4433-9900', alumnos: 60, facturado: 2400000, estado: 'Activa' },
  { id: 4, nombre: 'Liceo N°1', direccion: 'Rivadavia 450', telefono: '4411-2233', alumnos: 40, facturado: 1000000, estado: 'Activa' },
  { id: 5, nombre: 'Colegio del Sol', direccion: 'Sarmiento 110', telefono: '4488-7766', alumnos: 35, facturado: 980000, estado: 'Activa' },
];

export const useSchoolStore = create<SchoolState>((set) => ({
  schools: initialSchools,
  addSchool: (newSchool) =>
    set((state) => ({
      schools: [
        ...state.schools,
        {
          ...newSchool,
          id: Math.max(...state.schools.map((s) => s.id), 0) + 1,
          alumnos: 0, // Inicia sin alumnos
          facturado: 0, // Inicia sin facturacion
        },
      ],
    })),
}));
