import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, AlertCircle, School, AlertTriangle, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useStudentStore } from '../../store/useStudentStore';
import { useExpenseStore } from '../../store/useExpenseStore';
import { formatCurrency, calcularDiasMora, calcularMontoConRecargo, mesActualKey, mesActualLabel } from '../../utils/payments';

export default function Dashboard() {
  const navigate = useNavigate();
  const schools = useSchoolStore((state) => state.schools);
  const students = useStudentStore((state) => state.students);
  const expenses = useExpenseStore((state) => state.expenses);

  const now = new Date();
  const diasMora = calcularDiasMora(now);
  const currentMonth = mesActualKey();
  const mesLabel = mesActualLabel();

  const activeStudents = students.filter((s) => s.estado === 'active');
  const totalAlumnos = activeStudents.length;
  const totalPagados = activeStudents.filter((s) => s.estadoPago === 'pagado');
  const totalEnEspera = activeStudents.filter((s) => s.estadoPago === 'en_espera');
  const totalImpagos = activeStudents.filter((s) => s.estadoPago === 'impago');

  const recaudado = totalPagados.reduce((acc, s) => acc + s.valor, 0);
  const deudaImpagos = totalImpagos.reduce((acc, s) => acc + calcularMontoConRecargo(s.valor, now), 0);
  const adeudado = [...totalEnEspera, ...totalImpagos].reduce((acc, s) => acc + calcularMontoConRecargo(s.valor, now), 0);
  const gastosMes = expenses.filter((e) => e.mes === currentMonth).reduce((acc, e) => acc + e.monto, 0);
  const balance = recaudado - gastosMes;

  // School data for chart
  const schoolData = useMemo(() => {
    return schools.map((school) => {
      const alumnos = activeStudents.filter((s) => s.escuelaId === school.id).length;
      return { name: school.nombre, alumnos };
    }).filter((s) => s.alumnos > 0);
  }, [schools, activeStudents]);

  // Mock monthly revenue (could come from historical data)
  const revenueData = useMemo(() => {
    return [
      { name: 'Ene', recaudado: 450000, adeudado: 50000 },
      { name: 'Feb', recaudado: 520000, adeudado: 40000 },
      { name: mesLabel.slice(0, 3), recaudado, adeudado: adeudado },
    ];
  }, [recaudado, adeudado, mesLabel]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard General — {mesLabel}</h1>
        <p className="text-gray-500 text-sm">Resumen de métricas operativas y financieras.</p>
      </div>

      {/* Alerts */}
      {totalImpagos.length > 0 && diasMora === 0 && (
        <div
          className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2 cursor-pointer hover:bg-orange-100 transition-colors"
          onClick={() => navigate('/students?filterPago=impago')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/students?filterPago=impago')}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span><strong>{totalImpagos.length} alumno(s) con pago impago.</strong> Monto pendiente: <strong>{formatCurrency(deudaImpagos)}</strong></span>
          <span className="ml-auto text-xs font-medium underline whitespace-nowrap">Ver alumnos →</span>
        </div>
      )}

      {totalImpagos.length > 0 && diasMora > 0 && (
        <div
          className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2 cursor-pointer hover:bg-red-100 transition-colors"
          onClick={() => navigate('/students?filterPago=vencido_con_mora')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/students?filterPago=vencido_con_mora')}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span><strong>{totalImpagos.length} alumno(s) vencido(s) con mora</strong> ({diasMora} días de mora). Monto pendiente con recargo: <strong>{formatCurrency(deudaImpagos)}</strong></span>
          <span className="ml-auto text-xs font-medium underline whitespace-nowrap">Ver alumnos →</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Alumnos Activos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalAlumnos}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg"><Users className="w-6 h-6 text-primary" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Recaudado (Mes)</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(recaudado)}</p>
                <p className="text-xs text-green-600 mt-1">{totalPagados.length} pagos</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg"><DollarSign className="w-6 h-6 text-green-600" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Adeudado (Mes)</p>
                <p className="text-3xl font-bold text-danger mt-2">{formatCurrency(adeudado)}</p>
                <p className="text-xs text-red-500 mt-1">{totalImpagos.length} impagos · {totalEnEspera.length} en espera</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg"><AlertCircle className="w-6 h-6 text-danger" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Balance Mensual</p>
                <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(balance)}</p>
                <p className="text-xs text-gray-400 mt-1">Ingresos - Gastos ({formatCurrency(gastosMes)})</p>
              </div>
              <div className={`p-3 rounded-lg ${balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <TrendingDown className={`w-6 h-6 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader><CardTitle>Ingresos vs Adeudado</CardTitle></CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis tickFormatter={(val) => `$${val / 1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} />
                <Tooltip formatter={(value: any) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="recaudado" name="Recaudado" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="adeudado" name="Adeudado" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader><CardTitle>Alumnos por Escuela</CardTitle></CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schoolData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }} dx={-10} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="alumnos" name="Cant. Alumnos" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
