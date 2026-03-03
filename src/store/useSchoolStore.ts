import { create } from 'zustand';
import type { School, Nivel } from '../types';

interface SchoolState {
  schools: School[];
  selectedSchoolId: number | null;
  addSchool: (school: Omit<School, 'id'>) => void;
  editSchool: (id: number, data: Partial<Omit<School, 'id'>>) => void;
  deleteSchool: (id: number) => void;
  selectSchool: (id: number | null) => void;
}

const initialSchools: School[] = [
  { id: 1, nombre: 'Colegio San José', direccion: 'Av. Mitre 1234', telefono: '4455-6677', nivel: 'Primaria', estado: 'Activa' },
  { id: 2, nombre: 'Escuela Normal', direccion: 'San Martín 555', telefono: '4422-1188', nivel: 'Secundaria', estado: 'Activa' },
  { id: 3, nombre: 'Instituto Técnico', direccion: 'Belgrano 890', telefono: '4433-9900', nivel: 'Secundaria', estado: 'Activa' },
  { id: 4, nombre: 'Liceo N°1', direccion: 'Rivadavia 450', telefono: '4411-2233', nivel: 'Primaria', estado: 'Activa' },
  { id: 5, nombre: 'Colegio del Sol', direccion: 'Sarmiento 110', telefono: '4488-7766', nivel: 'Jardín', estado: 'Activa' },
  { id: 6, nombre: 'Escuela Unificada N°3', direccion: 'Moreno 320', telefono: '4499-1122', nivel: 'Escuela Unificada', estado: 'Activa' },
];

export const useSchoolStore = create<SchoolState>((set) => ({
  schools: initialSchools,
  selectedSchoolId: null,

  addSchool: (newSchool) =>
    set((state) => ({
      schools: [
        ...state.schools,
        {
          ...newSchool,
          id: Math.max(...state.schools.map((s) => s.id), 0) + 1,
        },
      ],
    })),

  editSchool: (id, data) =>
    set((state) => ({
      schools: state.schools.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),

  deleteSchool: (id) =>
    set((state) => ({
      schools: state.schools.filter((s) => s.id !== id),
      selectedSchoolId: state.selectedSchoolId === id ? null : state.selectedSchoolId,
    })),

  selectSchool: (id) => set({ selectedSchoolId: id }),
}));
