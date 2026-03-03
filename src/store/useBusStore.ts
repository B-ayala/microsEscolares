import { create } from 'zustand';
import type { Bus } from '../types';

interface BusState {
  buses: Bus[];
  addBus: (bus: Omit<Bus, 'id'>) => void;
  editBus: (id: number, data: Partial<Omit<Bus, 'id'>>) => void;
  deleteBus: (id: number) => void;
}

const initialBuses: Bus[] = [
  { id: 1, patente: 'AB 123 CD', capacidad: 45, conductor: 'Roberto Sánchez', celador: 'Laura Vega', escuelasAsignadas: [1, 4], turno: 'Mañana', estado: 'Activo' },
  { id: 2, patente: 'EF 456 GH', capacidad: 30, conductor: 'Marcelo Ríos', celador: 'Patricia Luna', escuelasAsignadas: [2, 3], turno: 'Mañana', estado: 'Activo' },
  { id: 3, patente: 'IJ 789 KL', capacidad: 45, conductor: 'Roberto Sánchez', celador: 'Laura Vega', escuelasAsignadas: [1, 5], turno: 'Tarde', estado: 'Activo' },
  { id: 4, patente: 'MN 012 OP', capacidad: 30, conductor: 'Gustavo Peralta', celador: 'Ana Romero', escuelasAsignadas: [6], turno: 'Mañana', estado: 'En mantenimiento' },
];

export const useBusStore = create<BusState>((set) => ({
  buses: initialBuses,

  addBus: (newBus) =>
    set((state) => ({
      buses: [
        ...state.buses,
        { ...newBus, id: Math.max(...state.buses.map((b) => b.id), 0) + 1 },
      ],
    })),

  editBus: (id, data) =>
    set((state) => ({
      buses: state.buses.map((b) => (b.id === id ? { ...b, ...data } : b)),
    })),

  deleteBus: (id) =>
    set((state) => ({
      buses: state.buses.filter((b) => b.id !== id),
    })),
}));
