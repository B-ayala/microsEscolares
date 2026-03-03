import { useState, useMemo } from 'react';
import { Plus, Search, CheckCircle2, XCircle, Users, Wallet } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useEmployeePaymentStore } from '../../store/useEmployeePaymentStore';
import { useModalStore } from '../../store/useModalStore';
import { formatCurrency, mesActualKey, mesActualLabel } from '../../utils/payments';
import type { RolEmpleado } from '../../types';

function EmployeeForm() {
  const addEmployee = useEmployeePaymentStore((state) => state.addEmployee);
  const closeModal = useModalStore((state) => state.closeModal);
  const [form, setForm] = useState({ nombre: '', apellido: '', rol: 'Conductor' as RolEmpleado, salario: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.apellido.trim() || !form.salario) return;
    addEmployee({ nombre: form.nombre.trim(), apellido: form.apellido.trim(), rol: form.rol, salario: Number(form.salario) });
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
          <Input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as RolEmpleado })}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
            <option value="Conductor">Conductor</option>
            <option value="Celador">Celador</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salario ($) *</label>
          <Input type="number" value={form.salario} onChange={(e) => setForm({ ...form, salario: e.target.value })} placeholder="0" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" type="button" onClick={closeModal}>Cancelar</Button>
        <Button type="submit" disabled={!form.nombre.trim() || !form.apellido.trim() || !form.salario}>Registrar</Button>
      </div>
    </form>
  );
}

export default function EmployeePayments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState<RolEmpleado | 'all'>('all');
  const [filterPagado, setFilterPagado] = useState<'all' | 'pagado' | 'pendiente'>('all');

  const employees = useEmployeePaymentStore((state) => state.employees);
  const payments = useEmployeePaymentStore((state) => state.payments);
  const registrarPago = useEmployeePaymentStore((state) => state.registrarPago);
  const revertirPago = useEmployeePaymentStore((state) => state.revertirPago);
  const openModal = useModalStore((state) => state.openModal);

  const currentMonth = mesActualKey();
  const mesLabel = mesActualLabel();

  // Merge employees with their current month payment
  const employeesWithPayments = useMemo(() => {
    return employees.map((emp) => {
      const payment = payments.find((p) => p.empleadoId === emp.id && p.mes === currentMonth);
      return {
        ...emp,
        payment,
        pagado: payment?.pagado ?? false,
        fechaPago: payment?.fechaPago ?? null,
        paymentId: payment?.id,
      };
    }).filter((emp) => {
      const matchSearch = `${emp.nombre} ${emp.apellido}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRol = filterRol === 'all' || emp.rol === filterRol;
      const matchPago = filterPagado === 'all' || (filterPagado === 'pagado' ? emp.pagado : !emp.pagado);
      return matchSearch && matchRol && matchPago;
    });
  }, [employees, payments, currentMonth, searchTerm, filterRol, filterPagado]);

  const totalConductores = employees.filter((e) => e.rol === 'Conductor').length;
  const totalCeladores = employees.filter((e) => e.rol === 'Celador').length;
  const totalSalarios = employees.reduce((acc, e) => acc + e.salario, 0);
  const totalPagados = employeesWithPayments.filter((e) => e.pagado).length;
  const totalPendientes = employeesWithPayments.filter((e) => !e.pagado).length;
  const montoPagado = employeesWithPayments.filter((e) => e.pagado).reduce((acc, e) => acc + e.salario, 0);
  const montoPendiente = employeesWithPayments.filter((e) => !e.pagado).reduce((acc, e) => acc + e.salario, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagos de Empleados — {mesLabel}</h1>
          <p className="text-gray-500 text-sm mt-1">Conductores, celadores y registro de pagos mensuales.</p>
        </div>
        <Button className="shrink-0" onClick={() => openModal('Nuevo Empleado', <EmployeeForm />)}>
          <Plus className="w-5 h-5 mr-2" /> Nuevo Empleado
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Users className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-xs text-gray-500">Empleados</p>
              <p className="text-xl font-bold">{employees.length}</p>
              <p className="text-xs text-gray-400">{totalConductores} cond. · {totalCeladores} cel.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><Wallet className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Nómina Mensual</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(totalSalarios)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Pagados</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(montoPagado)}</p>
              <p className="text-xs text-gray-400">{totalPagados} empleados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg"><XCircle className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Pendientes</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(montoPendiente)}</p>
              <p className="text-xs text-gray-400">{totalPendientes} empleados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden text-sm">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-center bg-gray-50/50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Buscar empleado..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={filterRol} onChange={(e) => setFilterRol(e.target.value as any)} title="Rol"
            className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm">
            <option value="all">Todos los roles</option>
            <option value="Conductor">Conductores</option>
            <option value="Celador">Celadores</option>
          </select>
          <select value={filterPagado} onChange={(e) => setFilterPagado(e.target.value as any)} title="Estado"
            className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm">
            <option value="all">Todos</option>
            <option value="pagado">Pagados</option>
            <option value="pendiente">Pendientes</option>
          </select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Salario</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Fecha Pago</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employeesWithPayments.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-gray-400 py-8">No hay empleados.</TableCell></TableRow>
            ) : (
              employeesWithPayments.map((emp) => (
                <TableRow key={emp.id} className={!emp.pagado ? 'bg-yellow-50/30' : ''}>
                  <TableCell className="font-medium text-gray-900">{emp.apellido}, {emp.nombre}</TableCell>
                  <TableCell><Badge status={emp.rol === 'Conductor' ? 'active' : 'en_espera'}>{emp.rol}</Badge></TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(emp.salario)}</TableCell>
                  <TableCell className="text-center">
                    {emp.pagado ? (
                      <Badge status="pagado">Pagado</Badge>
                    ) : (
                      <Badge status="impago">Pendiente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-xs text-gray-500">
                    {emp.fechaPago ? emp.fechaPago.split('-').reverse().join('/') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {!emp.pagado ? (
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => registrarPago(emp.id, currentMonth)}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Pagar
                      </Button>
                    ) : emp.paymentId ? (
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600"
                        onClick={() => revertirPago(emp.paymentId!)}>
                        Revertir
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
