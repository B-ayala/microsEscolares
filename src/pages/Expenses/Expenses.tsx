import { useState, useMemo } from 'react';
import { Plus, Search, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useStudentStore } from '../../store/useStudentStore';
import { useModalStore } from '../../store/useModalStore';
import { openConfirmDelete } from '../../components/modal/confirm';
import { formatCurrency, mesActualKey } from '../../utils/payments';
import type { TipoGasto } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

function ExpenseForm() {
  const addExpense = useExpenseStore((state) => state.addExpense);
  const closeModal = useModalStore((state) => state.closeModal);
  const [form, setForm] = useState({ descripcion: '', tipo: 'Otro' as TipoGasto, monto: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descripcion.trim() || !form.monto) return;
    const today = new Date().toISOString().split('T')[0];
    addExpense({
      descripcion: form.descripcion.trim(),
      tipo: form.tipo,
      monto: Number(form.monto),
      fecha: today,
      mes: mesActualKey(),
    });
    closeModal();
  };

  const labelClass = 'block text-base font-semibold text-gray-800 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="exp-descripcion" className={labelClass}>Descripción <span className="text-danger">*</span></label>
        <Input id="exp-descripcion" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej: Combustible colectivo AB 123 CD" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="exp-tipo" className={labelClass}>Tipo</label>
          <Select id="exp-tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoGasto })}>
            <option value="Conductor">Conductor</option>
            <option value="Celador">Celador</option>
            <option value="Combustible">Combustible</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Seguro">Seguro</option>
            <option value="Otro">Otro</option>
          </Select>
        </div>
        <div>
          <label htmlFor="exp-monto" className={labelClass}>Monto ($) <span className="text-danger">*</span></label>
          <Input id="exp-monto" type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} placeholder="0" />
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <Button variant="outline" type="button" onClick={closeModal} className="w-full sm:w-auto">Cancelar</Button>
        <Button type="submit" disabled={!form.descripcion.trim() || !form.monto} className="w-full sm:w-auto">Registrar gasto</Button>
      </div>
    </form>
  );
}

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<TipoGasto | 'all'>('all');
  const filterMes = mesActualKey();

  const expenses = useExpenseStore((state) => state.expenses);
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);
  const students = useStudentStore((state) => state.students);
  const openModal = useModalStore((state) => state.openModal);

  const currentMonth = mesActualKey();

  const ingresosEstimados = useMemo(() => {
    return students.filter((s) => s.estado === 'active').reduce((acc, s) => acc + s.valor, 0);
  }, [students]);

  const ingresosRecaudados = useMemo(() => {
    return students.filter((s) => s.estado === 'active' && s.estadoPago === 'pagado').reduce((acc, s) => acc + s.valor, 0);
  }, [students]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchMes = e.mes === filterMes;
      const matchTipo = filterTipo === 'all' || e.tipo === filterTipo;
      const matchSearch = e.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      return matchMes && matchTipo && matchSearch;
    });
  }, [expenses, filterMes, filterTipo, searchTerm]);

  const totalGastosMes = filteredExpenses.reduce((acc, e) => acc + e.monto, 0);
  const balance = ingresosRecaudados - totalGastosMes;

  const monthlyData = useMemo(() => {
    const monthsMap: Record<string, { ingresos: number; egresos: number }> = {};
    expenses.forEach((e) => {
      if (!monthsMap[e.mes]) monthsMap[e.mes] = { ingresos: 0, egresos: 0 };
      monthsMap[e.mes].egresos += e.monto;
    });
    if (!monthsMap[currentMonth]) monthsMap[currentMonth] = { ingresos: 0, egresos: 0 };
    monthsMap[currentMonth].ingresos = ingresosRecaudados;

    return Object.entries(monthsMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, data]) => ({
        mes: mes.slice(5) + '/' + mes.slice(0, 4),
        Ingresos: data.ingresos,
        Egresos: data.egresos,
      }));
  }, [expenses, currentMonth, ingresosRecaudados]);

  const handleDeleteExpense = (expense: typeof expenses[0]) => {
    openConfirmDelete({
      title: 'Eliminar Gasto',
      message: <>¿Querés eliminar el gasto <strong>{expense.descripcion}</strong> por <strong>{formatCurrency(expense.monto)}</strong>?</>,
      onConfirm: () => deleteExpense(expense.id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="hidden md:block text-3xl font-bold text-gray-900">Control de Gastos</h1>
          <p className="text-gray-600 text-base mt-1">Gestión de egresos mensuales: combustible, conductores, celadores y costos operativos.</p>
        </div>
        <Button size="lg" className="w-full sm:w-auto shrink-0" onClick={() => openModal('Registrar Gasto', <ExpenseForm />)}>
          <Plus className="w-5 h-5 mr-2" /> Nuevo Gasto
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl"><TrendingUp className="w-6 h-6 text-green-700" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos recaudados</p>
              <p className="text-xl md:text-2xl font-bold text-green-700">{formatCurrency(ingresosRecaudados)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-xl"><TrendingDown className="w-6 h-6 text-red-700" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Egresos del mes</p>
              <p className="text-xl md:text-2xl font-bold text-red-700">{formatCurrency(totalGastosMes)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <DollarSign className={`w-6 h-6 ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Balance mensual</p>
              <p className={`text-xl md:text-2xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(balance)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl"><DollarSign className="w-6 h-6 text-blue-700" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos esperados</p>
              <p className="text-xl md:text-2xl font-bold text-blue-700">{formatCurrency(ingresosEstimados)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {monthlyData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Comparativa mensual: ingresos vs egresos</CardTitle></CardHeader>
          <CardContent className="min-h-[280px]">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 13 }} />
                <YAxis tickFormatter={(v) => `$${v / 1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 13 }} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="Ingresos" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Egresos" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Listado */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-3">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" aria-hidden="true" />
            <Input
              placeholder="Buscar gasto..."
              className="pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar gasto"
            />
          </div>
          <Select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value as TipoGasto | 'all')} aria-label="Filtrar por tipo de gasto" className="w-full sm:max-w-xs">
            <option value="all">Todos los tipos</option>
            <option value="Conductor">Conductor</option>
            <option value="Celador">Celador</option>
            <option value="Combustible">Combustible</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Seguro">Seguro</option>
            <option value="Otro">Otro</option>
          </Select>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredExpenses.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-base">No hay gastos registrados.</p>
          ) : (
            filteredExpenses.map((expense) => (
              <div key={expense.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{expense.descripcion}</p>
                    <p className="text-sm text-gray-700 mt-0.5">{expense.fecha.split('-').reverse().join('/')}</p>
                  </div>
                  <Badge status="active">{expense.tipo}</Badge>
                </div>
                <p className="text-2xl font-bold text-red-700 mb-3">{formatCurrency(expense.monto)}</p>
                <Button variant="outline" size="md" className="w-full text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300" onClick={() => handleDeleteExpense(expense)}>
                  <Trash2 className="w-5 h-5 mr-2" /> Eliminar gasto
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-10 text-base">No hay gastos registrados.</TableCell></TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-semibold text-gray-900">{expense.descripcion}</TableCell>
                    <TableCell><Badge status="active">{expense.tipo}</Badge></TableCell>
                    <TableCell className="text-gray-700">{expense.fecha.split('-').reverse().join('/')}</TableCell>
                    <TableCell className="text-right font-semibold text-red-700">{formatCurrency(expense.monto)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300" onClick={() => handleDeleteExpense(expense)}>
                        <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredExpenses.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="text-base font-medium text-gray-700">Total gastos ({filteredExpenses.length} registros)</span>
            <span className="text-lg font-bold text-red-700">{formatCurrency(totalGastosMes)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
