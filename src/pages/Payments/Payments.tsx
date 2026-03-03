import { useState, useMemo } from 'react';
import { Search, CheckCircle2, AlertCircle, Clock, ArrowUpDown } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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

  // Summary stats
  const totalBase = activeStudents.reduce((acc, s) => acc + s.valor, 0);
  const totalRecaudado = activeStudents.filter((s) => s.estadoPago === 'pagado').reduce((acc, s) => acc + s.valor, 0);
  const totalPendiente = activeStudents.filter((s) => s.estadoPago !== 'pagado').reduce((acc, s) => acc + calcularMontoConRecargo(s.valor, now), 0);
  const cantPagados = activeStudents.filter((s) => s.estadoPago === 'pagado').length;
  const cantImpagos = activeStudents.filter((s) => s.estadoPago === 'impago').length;
  const cantEnEspera = activeStudents.filter((s) => s.estadoPago === 'en_espera').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Pagos — {mesLabel}</h1>
          <p className="text-gray-500 text-sm mt-1">
            Estado de cobranzas del mes actual.
            {diasMora > 0 && <span className="ml-2 text-red-500 font-medium">{recargo} · {diasMora} días de mora</span>}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Recaudado</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(totalRecaudado)}</p>
              <p className="text-xs text-gray-400">{cantPagados} pagos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-xs text-gray-500">En espera</p>
              <p className="text-lg font-bold text-yellow-600">{cantEnEspera}</p>
              <p className="text-xs text-gray-400">alumnos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg"><AlertCircle className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Impagos</p>
              <p className="text-lg font-bold text-red-600">{cantImpagos}</p>
              <p className="text-xs text-gray-400">alumnos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><span className="text-lg font-bold text-purple-600">$</span></div>
            <div>
              <p className="text-xs text-gray-500">Pendiente de cobro</p>
              <p className="text-lg font-bold text-purple-600">{formatCurrency(totalPendiente)}</p>
              <p className="text-xs text-gray-400">con recargos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {cantImpagos > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <strong>{cantImpagos} alumno(s)</strong> con pago vencido ({diasMora} días de mora). Total pendiente: <strong>{formatCurrency(totalPendiente)}</strong>
        </div>
      )}

      {/* Filters + Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden text-sm">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-center bg-gray-50/50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Buscar por alumno o escuela..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={filterEscuela} onChange={(e) => setFilterEscuela(e.target.value)} title="Escuela"
            className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">Todas las escuelas</option>
            {schools.map((s) => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
          </select>
          <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value as any)} title="Estado"
            className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">Todos los estados</option>
            <option value="en_espera">En espera</option>
            <option value="pagado">Pagado</option>
            <option value="impago">Impago</option>
          </select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alumno</TableHead>
              <TableHead>Escuela</TableHead>
              <TableHead className="text-right">Base</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Fecha Pago</TableHead>
              <TableHead className="text-center">Tipo Pago</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-gray-400 py-8">No hay registros.</TableCell></TableRow>
            ) : (
              filteredStudents.map((student) => {
                const montoFinal = student.estadoPago !== 'pagado' ? calcularMontoConRecargo(student.valor, now) : student.valor;
                return (
                  <TableRow key={student.id} className={student.estadoPago === 'impago' ? 'bg-red-50/50' : ''}>
                    <TableCell className="font-medium text-gray-900">{student.apellido}, {student.nombre}</TableCell>
                    <TableCell className="text-gray-600">{student.escuela}</TableCell>
                    <TableCell className="text-right">{formatCurrency(student.valor)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(montoFinal)}
                      {montoFinal > student.valor && (
                        <span className="block text-xs text-red-500">recargo</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge status={student.estadoPago}>{translateEstado(student.estadoPago)}</Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs text-gray-500">
                      {student.fechaPago ? student.fechaPago.split('-').reverse().join('/') : '-'}
                    </TableCell>
                    <TableCell className="text-center text-xs text-gray-500">
                      {student.tipoPago ?? '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {student.estadoPago !== 'pagado' ? (
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => marcarPagado(student.id, 'Efectivo')}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Efectivo
                          </Button>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => marcarPagado(student.id, 'Mercado Pago')}>
                            MP
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600"
                          onClick={() => desmarcarPago(student.id)}>
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
  );
}
