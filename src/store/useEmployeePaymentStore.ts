import { create } from 'zustand';
import type { Employee, EmployeePayment, RolEmpleado } from '../types';
import { mesActualKey } from '../utils/payments';

interface EmployeePaymentState {
  employees: Employee[];
  payments: EmployeePayment[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  editEmployee: (id: number, data: Partial<Omit<Employee, 'id'>>) => void;
  deleteEmployee: (id: number) => void;
  registrarPago: (empleadoId: number, mes: string) => void;
  revertirPago: (paymentId: number) => void;
}

const currentMonth = mesActualKey();

const initialEmployees: Employee[] = [
  { id: 1, nombre: 'Roberto', apellido: 'Sánchez', rol: 'Conductor', salario: 350000 },
  { id: 2, nombre: 'Marcelo', apellido: 'Ríos', rol: 'Conductor', salario: 350000 },
  { id: 3, nombre: 'Gustavo', apellido: 'Peralta', rol: 'Conductor', salario: 350000 },
  { id: 4, nombre: 'Laura', apellido: 'Vega', rol: 'Celador', salario: 200000 },
  { id: 5, nombre: 'Patricia', apellido: 'Luna', rol: 'Celador', salario: 200000 },
  { id: 6, nombre: 'Ana', apellido: 'Romero', rol: 'Celador', salario: 200000 },
];

const initialPayments: EmployeePayment[] = [
  { id: 1, empleadoId: 1, empleado: 'Roberto Sánchez', rol: 'Conductor', mes: currentMonth, monto: 350000, fechaPago: '2026-03-01', pagado: true },
  { id: 2, empleadoId: 2, empleado: 'Marcelo Ríos', rol: 'Conductor', mes: currentMonth, monto: 350000, fechaPago: '2026-03-01', pagado: true },
  { id: 3, empleadoId: 3, empleado: 'Gustavo Peralta', rol: 'Conductor', mes: currentMonth, monto: 350000, fechaPago: null, pagado: false },
  { id: 4, empleadoId: 4, empleado: 'Laura Vega', rol: 'Celador', mes: currentMonth, monto: 200000, fechaPago: '2026-03-01', pagado: true },
  { id: 5, empleadoId: 5, empleado: 'Patricia Luna', rol: 'Celador', mes: currentMonth, monto: 200000, fechaPago: null, pagado: false },
  { id: 6, empleadoId: 6, empleado: 'Ana Romero', rol: 'Celador', mes: currentMonth, monto: 200000, fechaPago: null, pagado: false },
];

export const useEmployeePaymentStore = create<EmployeePaymentState>((set, get) => ({
  employees: initialEmployees,
  payments: initialPayments,

  addEmployee: (emp) =>
    set((state) => ({
      employees: [
        ...state.employees,
        { ...emp, id: Math.max(...state.employees.map((e) => e.id), 0) + 1 },
      ],
    })),

  editEmployee: (id, data) =>
    set((state) => ({
      employees: state.employees.map((e) => (e.id === id ? { ...e, ...data } : e)),
    })),

  deleteEmployee: (id) =>
    set((state) => ({
      employees: state.employees.filter((e) => e.id !== id),
      payments: state.payments.filter((p) => p.empleadoId !== id),
    })),

  registrarPago: (empleadoId, mes) => {
    const { employees, payments } = get();
    const emp = employees.find((e) => e.id === empleadoId);
    if (!emp) return;

    const existing = payments.find((p) => p.empleadoId === empleadoId && p.mes === mes);
    const today = new Date().toISOString().split('T')[0];

    if (existing) {
      set((state) => ({
        payments: state.payments.map((p) =>
          p.id === existing.id ? { ...p, pagado: true, fechaPago: today } : p
        ),
      }));
    } else {
      set((state) => ({
        payments: [
          ...state.payments,
          {
            id: Math.max(...state.payments.map((p) => p.id), 0) + 1,
            empleadoId,
            empleado: `${emp.nombre} ${emp.apellido}`,
            rol: emp.rol,
            mes,
            monto: emp.salario,
            fechaPago: today,
            pagado: true,
          },
        ],
      }));
    }
  },

  revertirPago: (paymentId) =>
    set((state) => ({
      payments: state.payments.map((p) =>
        p.id === paymentId ? { ...p, pagado: false, fechaPago: null } : p
      ),
    })),
}));
