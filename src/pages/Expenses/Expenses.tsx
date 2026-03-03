import { useState, useMemo } from 'react';
import { Plus, Search, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useStudentStore } from '../../store/useStudentStore';
import { useModalStore } from '../../store/useModalStore';
import { formatCurrency, mesActualKey, mesActualLabel } from '../../utils/payments';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
        <Input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej: Combustible colectivo AB 123 CD" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoGasto })}
          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value="Conductor">Conductor</option>
          <option value="Celador">Celador</option>
          <option value="Combustible">Combustible</option>
          <option value="Mantenimiento">Mantenimiento</option>
          <option value="Seguro">Seguro</option>
          <option value="Otro">Otro</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($) *</label>
        <Input type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} placeholder="0" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" type="button" onClick={closeModal}>Cancelar</Button>
        <Button type="submit" disabled={!form.descripcion.trim() || !form.monto}>Registrar Gasto</Button>
      </div>
    </form>
  );
}

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<TipoGasto | 'all'>('all');
  const [filterMes, setFilterMes] = useState(mesActualKey());

  const expenses = useExpenseStore((state) => state.expenses);
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);
  const students = useStudentStore((state) => state.students);
  const openModal = useModalStore((state) => state.openModal);

  const currentMonth = mesActualKey();

  // Ingresos estimados del mes (valor de todos los alumnos activos)
  const ingresosEstimados = useMemo(() => {
    return students.filter((s) => s.estado === 'active').reduce((acc, s) => acc + s.valor, 0);
  }, [students]);

  const ingresosRecaudados = useMemo(() => {
    return students.filter((s) => s.estado === 'active' && s.estadoPago === 'pagado').reduce((acc, s) => acc + s.valor, 0);
  }, [students]);

  // Filter expenses
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

  // Gastos por tipo
  const gastosPorTipo = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      map[e.tipo] = (map[e.tipo] || 0) + e.monto;
    });
    return Object.entries(map).map(([tipo, monto]) => ({ tipo, monto }));
  }, [filteredExpenses]);

  // Monthly comparison data
  const monthlyData = useMemo(() => {
    const monthsMap: Record<string, { ingresos: number; egresos: number }> = {};
    expenses.forEach((e) => {
      if (!monthsMap[e.mes]) monthsMap[e.mes] = { ingresos: 0, egresos: 0 };
      monthsMap[e.mes].egresos += e.monto;
    });
    // Add current month income
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Gastos</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de egresos mensuales, conductores, celadores y costos operativos.</p>
        </div>
        <Button className="shrink-0" onClick={() => openModal('Registrar Gasto', <ExpenseForm />)}>
          <Plus className="w-5 h-5 mr-2" /> Nuevo Gasto
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Ingresos Recaudados</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(ingresosRecaudados)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg"><TrendingDown className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Egresos del Mes</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(totalGastosMes)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <DollarSign className={`w-5 h-5 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Balance Mensual</p>
              <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(balance)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><DollarSign className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Ingresos Esperados</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(ingresosEstimados)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart: Ingresos vs Egresos */}
      {monthlyData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Comparativa Mensual: Ingresos vs Egresos</CardTitle></CardHeader>
          <CardContent className="min-h-[280px]">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `$${v / 1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="Ingresos" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Egresos" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gastos Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden text-sm">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-center bg-gray-50/50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Buscar gasto..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value as any)} title="Tipo"
            className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm">
            <option value="all">Todos los tipos</option>
            <option value="Conductor">Conductor</option>
            <option value="Celador">Celador</option>
            <option value="Combustible">Combustible</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Seguro">Seguro</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

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
              <TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-8">No hay gastos registrados.</TableCell></TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium text-gray-900">{expense.descripcion}</TableCell>
                  <TableCell><Badge status="active">{expense.tipo}</Badge></TableCell>
                  <TableCell className="text-gray-500">{expense.fecha.split('-').reverse().join('/')}</TableCell>
                  <TableCell className="text-right font-medium text-red-600">{formatCurrency(expense.monto)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600" onClick={() => deleteExpense(expense.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filteredExpenses.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex justify-between">
            <span className="text-sm font-medium text-gray-600">Total gastos ({filteredExpenses.length} registros)</span>
            <span className="text-sm font-bold text-red-600">{formatCurrency(totalGastosMes)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
