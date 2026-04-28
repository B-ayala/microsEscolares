import { useState, useMemo } from 'react';
import { Plus, Search, CheckCircle2, XCircle, Users, Wallet } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
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

  const labelClass = 'block text-base font-semibold text-gray-800 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="emp-nombre" className={labelClass}>Nombre *</label>
          <Input id="emp-nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        </div>
        <div>
          <label htmlFor="emp-apellido" className={labelClass}>Apellido *</label>
          <Input id="emp-apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="emp-rol" className={labelClass}>Rol</label>
          <Select id="emp-rol" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as RolEmpleado })}>
            <option value="Conductor">Conductor</option>
            <option value="Celador">Celador</option>
          </Select>
        </div>
        <div>
          <label htmlFor="emp-salario" className={labelClass}>Salario ($) *</label>
          <Input id="emp-salario" type="number" value={form.salario} onChange={(e) => setForm({ ...form, salario: e.target.value })} placeholder="0" />
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <Button variant="outline" type="button" onClick={closeModal} className="w-full sm:w-auto">Cancelar</Button>
        <Button type="submit" disabled={!form.nombre.trim() || !form.apellido.trim() || !form.salario} className="w-full sm:w-auto">
          Registrar empleado
        </Button>
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
          <h1 className="hidden md:block text-3xl font-bold text-gray-900">Pagos de Empleados — {mesLabel}</h1>
          <p className="text-gray-600 text-base mt-1">Conductores, celadores y registro de pagos mensuales.</p>
        </div>
        <Button size="lg" className="w-full sm:w-auto shrink-0" onClick={() => openModal('Nuevo Empleado', <EmployeeForm />)}>
          <Plus className="w-5 h-5 mr-2" /> Nuevo Empleado
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl"><Users className="w-6 h-6 text-primary" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Empleados</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              <p className="text-sm text-gray-600">{totalConductores} cond. · {totalCeladores} cel.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 rounded-xl"><Wallet className="w-6 h-6 text-purple-700" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Nómina mensual</p>
              <p className="text-xl md:text-2xl font-bold text-purple-700">{formatCurrency(totalSalarios)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl"><CheckCircle2 className="w-6 h-6 text-green-700" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pagados</p>
              <p className="text-xl md:text-2xl font-bold text-green-700">{formatCurrency(montoPagado)}</p>
              <p className="text-sm text-gray-600">{totalPagados} empleados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-xl"><XCircle className="w-6 h-6 text-red-700" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-xl md:text-2xl font-bold text-red-700">{formatCurrency(montoPendiente)}</p>
              <p className="text-sm text-gray-600">{totalPendientes} empleados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros + listado */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-3">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" aria-hidden="true" />
            <Input
              placeholder="Buscar empleado..."
              className="pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar empleado"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={filterRol} onChange={(e) => setFilterRol(e.target.value as RolEmpleado | 'all')} aria-label="Filtrar por rol">
              <option value="all">Todos los roles</option>
              <option value="Conductor">Conductores</option>
              <option value="Celador">Celadores</option>
            </Select>
            <Select value={filterPagado} onChange={(e) => setFilterPagado(e.target.value as 'all' | 'pagado' | 'pendiente')} aria-label="Filtrar por estado de pago">
              <option value="all">Todos</option>
              <option value="pagado">Pagados</option>
              <option value="pendiente">Pendientes</option>
            </Select>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {employeesWithPayments.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-base">No hay empleados.</p>
          ) : (
            employeesWithPayments.map((emp) => (
              <div key={emp.id} className={`p-5 ${!emp.pagado ? 'bg-yellow-50/30' : ''}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{emp.apellido}, {emp.nombre}</p>
                    <Badge status={emp.rol === 'Conductor' ? 'active' : 'en_espera'} className="mt-1">{emp.rol}</Badge>
                  </div>
                  {emp.pagado ? (
                    <Badge status="pagado">Pagado</Badge>
                  ) : (
                    <Badge status="impago">Pendiente</Badge>
                  )}
                </div>

                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Salario</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(emp.salario)}</p>
                  </div>
                  {emp.fechaPago && (
                    <div className="text-right text-sm text-gray-700">
                      <p className="font-medium">Pagado el</p>
                      <p>{emp.fechaPago.split('-').reverse().join('/')}</p>
                    </div>
                  )}
                </div>

                {!emp.pagado ? (
                  <Button size="md" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => registrarPago(emp.id, currentMonth)}>
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Registrar pago
                  </Button>
                ) : emp.paymentId ? (
                  <Button variant="outline" size="md" className="w-full" onClick={() => revertirPago(emp.paymentId!)}>
                    Revertir pago
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Salario</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Fecha pago</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeesWithPayments.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-10 text-base">No hay empleados.</TableCell></TableRow>
              ) : (
                employeesWithPayments.map((emp) => (
                  <TableRow key={emp.id} className={!emp.pagado ? 'bg-yellow-50/30' : ''}>
                    <TableCell className="font-semibold text-gray-900">{emp.apellido}, {emp.nombre}</TableCell>
                    <TableCell><Badge status={emp.rol === 'Conductor' ? 'active' : 'en_espera'}>{emp.rol}</Badge></TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(emp.salario)}</TableCell>
                    <TableCell className="text-center">
                      {emp.pagado ? <Badge status="pagado">Pagado</Badge> : <Badge status="impago">Pendiente</Badge>}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-700">
                      {emp.fechaPago ? emp.fechaPago.split('-').reverse().join('/') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {!emp.pagado ? (
                        <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300"
                          onClick={() => registrarPago(emp.id, currentMonth)}>
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Pagar
                        </Button>
                      ) : emp.paymentId ? (
                        <Button variant="outline" size="sm"
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
    </div>
  );
}
