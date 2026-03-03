import { create } from 'zustand';
import type { Expense, TipoGasto } from '../types';
import { mesActualKey } from '../utils/payments';

interface ExpenseState {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  editExpense: (id: number, data: Partial<Omit<Expense, 'id'>>) => void;
  deleteExpense: (id: number) => void;
}

const currentMonth = mesActualKey();

const initialExpenses: Expense[] = [
  { id: 1, descripcion: 'Salario - Roberto Sánchez (Conductor)', tipo: 'Conductor', monto: 350000, fecha: '2026-03-01', mes: currentMonth },
  { id: 2, descripcion: 'Salario - Marcelo Ríos (Conductor)', tipo: 'Conductor', monto: 350000, fecha: '2026-03-01', mes: currentMonth },
  { id: 3, descripcion: 'Salario - Laura Vega (Celador)', tipo: 'Celador', monto: 200000, fecha: '2026-03-01', mes: currentMonth },
  { id: 4, descripcion: 'Salario - Patricia Luna (Celador)', tipo: 'Celador', monto: 200000, fecha: '2026-03-01', mes: currentMonth },
  { id: 5, descripcion: 'Combustible - Colectivo AB 123 CD', tipo: 'Combustible', monto: 120000, fecha: '2026-03-05', mes: currentMonth },
  { id: 6, descripcion: 'Combustible - Colectivo EF 456 GH', tipo: 'Combustible', monto: 95000, fecha: '2026-03-05', mes: currentMonth },
  { id: 7, descripcion: 'Seguro flota mensual', tipo: 'Seguro', monto: 180000, fecha: '2026-03-01', mes: currentMonth },
  { id: 8, descripcion: 'Mantenimiento frenos - MN 012 OP', tipo: 'Mantenimiento', monto: 85000, fecha: '2026-02-28', mes: '2026-02' },
];

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: initialExpenses,

  addExpense: (newExpense) =>
    set((state) => ({
      expenses: [
        ...state.expenses,
        { ...newExpense, id: Math.max(...state.expenses.map((e) => e.id), 0) + 1 },
      ],
    })),

  editExpense: (id, data) =>
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),

  deleteExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    })),
}));
