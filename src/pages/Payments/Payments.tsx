import { useState, useMemo } from 'react';
import { Search, CheckCircle2, AlertCircle, Clock, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useStudentStore } from '../../store/useStudentStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { formatCurrency, calcularMontoConRecargo, calcularDiasMora, mesActualLabel, recargoLabel } from '../../utils/payments';
import type { EstadoPago } from '../../types';

function translateEstado(estado: EstadoPago): string {
  switch (estado) {
    case 'en_espera': return 'En espera';
    case 'pagado': return 'Pagado';
    case 'impago': return 'Impago';
  }
}

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<EstadoPago | 'all'>('all');
  const [filterEscuela, setFilterEscuela] = useState<string>('all');

  const students = useStudentStore((state) => state.students);
  const marcarPagado = useStudentStore((state) => state.marcarPagado);
  const desmarcarPago = useStudentStore((state) => state.desmarcarPago);
  const schools = useSchoolStore((state) => state.schools);

  const now = new Date();
  const diasMora = calcularDiasMora(now);
  const recargo = recargoLabel(now);
  const mesLabel = mesActualLabel();

  const activeStudents = students.filter((s) => s.estado === 'active');

  const filteredStudents = useMemo(() => {
    return activeStudents.filter((s) => {
      const matchSearch =
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.escuela.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEstado = filterEstado === 'all' || s.estadoPago === filterEstado;
      const matchEscuela = filterEscuela === 'all' || s.escuela === filterEscuela;
      return matchSearch && matchEstado && matchEscuela;
    });
  }, [activeStudents, searchTerm, filterEstado, filterEscuela]);

  const totalRecaudado = activeStudents.filter((s) => s.estadoPago === 'pagado').reduce((acc, s) => acc + s.valor, 0);
  const totalPendiente = activeStudents.filter((s) => s.estadoPago !== 'pagado').reduce((acc, s) => acc + calcularMontoConRecargo(s.valor, now), 0);
  const cantPagados = activeStudents.filter((s) => s.estadoPago === 'pagado').length;
  const cantImpagos = activeStudents.filter((s) => s.estadoPago === 'impago').length;
  const cantEnEspera = activeStudents.filter((s) => s.estadoPago === 'en_espera').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="hidden md:block text-3xl font-bold text-gray-900">Control de Pagos — {mesLabel}</h1>
        <p className="text-gray-600 text-base">
          Estado de cobranzas del mes actual.
          {diasMora > 0 && (
            <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0 text-red-700 font-semibold">
              {recargo} · {diasMora} días de mora
            </span>
          )}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl"><CheckCircle2 className="w-6 h-6 text-green-700" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Recaudado</p>
              <p className="text-xl md:text-2xl font-bold text-green-700">{formatCurrency(totalRecaudado)}</p>
              <p className="text-sm text-gray-600">{cantPagados} pagos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-yellow-50 rounded-xl"><Clock className="w-6 h-6 text-yellow-700" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">En espera</p>
              <p className="text-2xl font-bold text-yellow-700">{cantEnEspera}</p>
              <p className="text-sm text-gray-600">alumnos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-xl"><AlertCircle className="w-6 h-6 text-red-700" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Impagos</p>
              <p className="text-2xl font-bold text-red-700">{cantImpagos}</p>
              <p className="text-sm text-gray-600">alumnos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 rounded-xl"><DollarSign className="w-6 h-6 text-purple-700" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pendiente</p>
              <p className="text-xl md:text-2xl font-bold text-purple-700">{formatCurrency(totalPendiente)}</p>
              <p className="text-sm text-gray-600">con recargos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {cantImpagos > 0 && (
        <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg text-base flex items-start sm:items-center gap-3">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
          <span>
            <strong>{cantImpagos} alumno(s)</strong> con pago vencido ({diasMora} días de mora).
            Total pendiente: <strong>{formatCurrency(totalPendiente)}</strong>
          </span>
        </div>
      )}

      {/* Filtros + listado */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-3">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" aria-hidden="true" />
            <Input
              placeholder="Buscar por alumno o escuela..."
              className="pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar pago"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={filterEscuela} onChange={(e) => setFilterEscuela(e.target.value)} aria-label="Filtrar por escuela">
              <option value="all">Todas las escuelas</option>
              {schools.map((s) => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
            </Select>
            <Select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value as EstadoPago | 'all')} aria-label="Filtrar por estado">
              <option value="all">Todos los estados</option>
              <option value="en_espera">En espera</option>
              <option value="pagado">Pagado</option>
              <option value="impago">Impago</option>
            </Select>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredStudents.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-base">No hay registros con estos filtros.</p>
          ) : (
            filteredStudents.map((student) => {
              const montoFinal = student.estadoPago !== 'pagado' ? calcularMontoConRecargo(student.valor, now) : student.valor;
              const tieneRecargo = montoFinal > student.valor;
              const isImpago = student.estadoPago === 'impago';
              return (
                <div key={student.id} className={`p-5 ${isImpago ? 'bg-red-50/50' : ''}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{student.apellido}, {student.nombre}</p>
                      <p className="text-sm text-gray-700 mt-0.5">{student.escuela}</p>
                    </div>
                    <Badge status={student.estadoPago}>{translateEstado(student.estadoPago)}</Badge>
                  </div>

                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total a pagar</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(montoFinal)}</p>
                      {tieneRecargo && (
                        <p className="text-sm text-red-700 font-semibold">incluye recargo</p>
                      )}
                    </div>
                    {student.estadoPago === 'pagado' && student.fechaPago && (
                      <div className="text-right text-sm text-gray-700">
                        <p>{student.fechaPago.split('-').reverse().join('/')}</p>
                        <p className="font-medium">{student.tipoPago}</p>
                      </div>
                    )}
                  </div>

                  {student.estadoPago !== 'pagado' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="md" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => marcarPagado(student.id, 'Efectivo')}>
                        <CheckCircle2 className="w-5 h-5 mr-1.5" /> Efectivo
                      </Button>
                      <Button size="md" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => marcarPagado(student.id, 'Mercado Pago')}>
                        Mercado Pago
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="md" className="w-full" onClick={() => desmarcarPago(student.id)}>
                      Revertir pago
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead>Escuela</TableHead>
                <TableHead className="text-right">Base</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Fecha pago</TableHead>
                <TableHead className="text-center">Tipo pago</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-gray-500 py-10 text-base">No hay registros.</TableCell></TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const montoFinal = student.estadoPago !== 'pagado' ? calcularMontoConRecargo(student.valor, now) : student.valor;
                  return (
                    <TableRow key={student.id} className={student.estadoPago === 'impago' ? 'bg-red-50/50' : ''}>
                      <TableCell className="font-semibold text-gray-900">{student.apellido}, {student.nombre}</TableCell>
                      <TableCell className="text-gray-700">{student.escuela}</TableCell>
                      <TableCell className="text-right">{formatCurrency(student.valor)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(montoFinal)}
                        {montoFinal > student.valor && (
                          <span className="block text-sm text-red-700 font-medium">recargo</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge status={student.estadoPago}>{translateEstado(student.estadoPago)}</Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-700">
                        {student.fechaPago ? student.fechaPago.split('-').reverse().join('/') : '—'}
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-700">
                        {student.tipoPago ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {student.estadoPago !== 'pagado' ? (
                          <div className="flex justify-end gap-1.5 flex-wrap">
                            <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300"
                              onClick={() => marcarPagado(student.id, 'Efectivo')}>
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Efectivo
                            </Button>
                            <Button variant="outline" size="sm" className="text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                              onClick={() => marcarPagado(student.id, 'Mercado Pago')}>
                              MP
                            </Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => desmarcarPago(student.id)}>
                            Revertir
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
