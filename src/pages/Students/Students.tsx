import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Plus, ArrowUpDown, CheckCircle2, AlertCircle, Clock, X, Filter,
  Pencil, Trash2, AlertTriangle, Users as UsersIcon, Banknote, Wallet,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useStudentStore } from '../../store/useStudentStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useModalStore } from '../../store/useModalStore';
import { openConfirmDelete } from '../../components/modal/confirm';
import StudentForm from '../../components/forms/StudentForm';
import { formatCurrency, calcularMontoConRecargo, calcularDiasMora, recargoLabel } from '../../utils/payments';
import type { Turno, Nivel, FilterEstado, EstadoPago, SortField, SortDirection } from '../../types';

function translateEstado(estado: EstadoPago): string {
  switch (estado) {
    case 'en_espera': return 'En espera';
    case 'pagado': return 'Pagado';
    case 'impago': return 'Impago';
  }
}

function translateFilterEstado(filter: FilterEstado): string {
  switch (filter) {
    case 'all': return 'Todos los estados';
    case 'en_espera': return 'En espera';
    case 'pagado': return 'Pagado';
    case 'impago': return 'Impago';
    case 'vencido_con_mora': return 'Vencido con mora';
  }
}

const VALID_FILTER_ESTADO: FilterEstado[] = ['all', 'en_espera', 'pagado', 'impago', 'vencido_con_mora'];

function isValidFilterEstado(value: string): value is FilterEstado {
  return VALID_FILTER_ESTADO.includes(value as FilterEstado);
}

const ALERT_LABELS: Record<string, string> = {
  impago: 'Alumnos con pago vencido (impagos)',
  en_espera: 'Alumnos en espera de pago',
  vencido_con_mora: 'Alumnos vencidos con mora activa',
};

export default function Students() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPago, setFilterPago] = useState<FilterEstado>('all');
  const [filterTurno, setFilterTurno] = useState<Turno | 'all'>('all');
  const [filterNivel, setFilterNivel] = useState<Nivel | 'all'>('all');
  const [filterEscuela, setFilterEscuela] = useState<string>('all');
  const [soloImpagos, setSoloImpagos] = useState(false);
  const [sortField, setSortField] = useState<SortField>('apellido');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [fromAlert, setFromAlert] = useState<string | null>(null);

  const students = useStudentStore((state) => state.students);
  const marcarPagado = useStudentStore((state) => state.marcarPagado);
  const desmarcarPago = useStudentStore((state) => state.desmarcarPago);
  const deleteStudent = useStudentStore((state) => state.deleteStudent);
  const schools = useSchoolStore((state) => state.schools);
  const openModal = useModalStore((state) => state.openModal);

  useEffect(() => {
    const paramFilter = searchParams.get('filterPago');
    if (paramFilter && isValidFilterEstado(paramFilter)) {
      setFilterPago(paramFilter);
      setFromAlert(paramFilter);
      setSearchParams({}, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearAlertFilter = () => {
    setFilterPago('all');
    setFromAlert(null);
  };

  const now = new Date();
  const diasMora = calcularDiasMora(now);
  const recargo = recargoLabel(now);

  const filteredStudents = useMemo(() => {
    let result = students.filter((student) => {
      if (student.estado !== 'active') return false;

      const matchSearch =
        student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.dni.includes(searchTerm);

      let matchPago = false;
      if (filterPago === 'all') {
        matchPago = true;
      } else if (filterPago === 'vencido_con_mora') {
        matchPago = student.estadoPago === 'impago' && diasMora > 0;
      } else {
        matchPago = student.estadoPago === filterPago;
      }
      const matchTurno = filterTurno === 'all' || student.turno === filterTurno;
      const matchNivel = filterNivel === 'all' || student.nivel === filterNivel;
      const matchEscuela = filterEscuela === 'all' || student.escuela === filterEscuela;
      const matchImpago = !soloImpagos || student.estadoPago === 'impago';

      return matchSearch && matchPago && matchTurno && matchNivel && matchEscuela && matchImpago;
    });

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'escuela': cmp = a.escuela.localeCompare(b.escuela); break;
        case 'apellido': cmp = a.apellido.localeCompare(b.apellido); break;
        case 'estadoPago': {
          const order: Record<EstadoPago, number> = { impago: 0, en_espera: 1, pagado: 2 };
          cmp = order[a.estadoPago] - order[b.estadoPago];
          break;
        }
        case 'diasMora': {
          const moraA = a.estadoPago === 'impago' ? diasMora : 0;
          const moraB = b.estadoPago === 'impago' ? diasMora : 0;
          cmp = moraB - moraA;
          break;
        }
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [students, searchTerm, filterPago, filterTurno, filterNivel, filterEscuela, soloImpagos, sortField, sortDir, diasMora]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleOpenNewStudentModal = () => openModal('Nuevo Alumno', <StudentForm />);
  const handleEditStudent = (student: typeof students[0]) =>
    openModal('Editar Alumno', <StudentForm student={student} />);

  const handleDeleteStudent = (student: typeof students[0]) => {
    openConfirmDelete({
      title: 'Eliminar Alumno',
      message: <>¿Querés eliminar al alumno <strong>{student.apellido}, {student.nombre}</strong>?</>,
      onConfirm: () => deleteStudent(student.id),
    });
  };

  const activeStudents = students.filter((s) => s.estado === 'active');
  const totalPagados = activeStudents.filter((s) => s.estadoPago === 'pagado').length;
  const totalEnEspera = activeStudents.filter((s) => s.estadoPago === 'en_espera').length;
  const totalImpagos = activeStudents.filter((s) => s.estadoPago === 'impago').length;
  const totalVencidoConMora = activeStudents.filter((s) => s.estadoPago === 'impago' && diasMora > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="hidden md:block text-3xl font-bold text-gray-900">Gestión de Alumnos</h1>
          <p className="text-gray-600 text-base mt-1">
            Listado completo de alumnos, pagos y filtros avanzados.
            {diasMora > 0 && (
              <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0 text-red-700 font-semibold">
                ({recargo} · {diasMora} días de mora)
              </span>
            )}
          </p>
        </div>
        <Button size="lg" className="w-full sm:w-auto shrink-0" onClick={handleOpenNewStudentModal}>
          <Plus className="w-5 h-5 mr-2" /> Nuevo Alumno
        </Button>
      </div>

      {/* Banner desde Dashboard */}
      {fromAlert && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-blue-50 border-2 border-blue-200 text-blue-900 px-4 py-3 rounded-lg text-base">
          <Filter className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span className="flex-1">
            Filtro aplicado desde el inicio: <strong>{ALERT_LABELS[fromAlert] || translateFilterEstado(fromAlert as FilterEstado)}</strong>
            {' '}— Mostrando {filteredStudents.length} alumno(s).
          </span>
          <Button variant="outline" size="sm" onClick={clearAlertFilter} className="self-start sm:self-auto">
            <X className="w-4 h-4 mr-1.5" /> Quitar filtro
          </Button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl"><UsersIcon className="w-6 h-6 text-primary" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">{activeStudents.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl"><CheckCircle2 className="w-6 h-6 text-green-700" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pagados</p>
              <p className="text-2xl font-bold text-green-700">{totalPagados}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-yellow-50 rounded-xl"><Clock className="w-6 h-6 text-yellow-700" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">En espera</p>
              <p className="text-2xl font-bold text-yellow-700">{totalEnEspera}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-xl"><AlertCircle className="w-6 h-6 text-red-700" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Impagos</p>
              <p className="text-2xl font-bold text-red-700">{totalImpagos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 rounded-xl"><AlertTriangle className="w-6 h-6 text-orange-700" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Con mora</p>
              <p className="text-2xl font-bold text-orange-700">{totalVencidoConMora}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros + lista */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-3">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" aria-hidden="true" />
            <Input
              placeholder="Buscar por nombre, apellido o DNI..."
              className="pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar alumno"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select value={filterEscuela} onChange={(e) => setFilterEscuela(e.target.value)} aria-label="Filtrar por escuela">
              <option value="all">Todas las escuelas</option>
              {schools.map((s) => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
            </Select>
            <Select value={filterTurno} onChange={(e) => setFilterTurno(e.target.value as Turno | 'all')} aria-label="Filtrar por turno">
              <option value="all">Todos los turnos</option>
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
            </Select>
            <Select value={filterNivel} onChange={(e) => setFilterNivel(e.target.value as Nivel | 'all')} aria-label="Filtrar por nivel">
              <option value="all">Todos los niveles</option>
              <option value="Jardín">Jardín</option>
              <option value="Primaria">Primaria</option>
              <option value="Secundaria">Secundaria</option>
              <option value="Escuela Unificada">Escuela Unificada</option>
            </Select>
            <Select
              value={filterPago}
              onChange={(e) => { setFilterPago(e.target.value as FilterEstado); if (fromAlert && e.target.value !== fromAlert) setFromAlert(null); }}
              aria-label="Filtrar por estado de pago"
              className={fromAlert ? 'border-blue-400 bg-blue-50' : ''}
            >
              <option value="all">Todos los estados</option>
              <option value="en_espera">En espera</option>
              <option value="pagado">Pagado</option>
              <option value="impago">Impago</option>
              <option value="vencido_con_mora">Vencido con mora</option>
            </Select>
          </div>
          <button
            onClick={() => setSoloImpagos(!soloImpagos)}
            className={`min-h-[48px] w-full sm:w-auto px-5 py-2.5 rounded-lg text-base font-semibold border-2 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${
              soloImpagos
                ? 'bg-red-100 text-red-800 border-red-300'
                : 'bg-white text-gray-800 border-gray-300 hover:bg-red-50 hover:border-red-300'
            }`}
            aria-pressed={soloImpagos}
          >
            {soloImpagos ? '✕ Quitar filtro de impagos' : '⚠ Ver solo impagos'}
          </button>
        </div>

        {/* Vista Mobile — tarjeta por alumno */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredStudents.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-base">No se encontraron alumnos.</p>
          ) : (
            filteredStudents.map((student) => {
              const montoFinal = student.estadoPago !== 'pagado' ? calcularMontoConRecargo(student.valor, now) : student.valor;
              const tieneRecargo = montoFinal > student.valor;
              const mora = student.estadoPago === 'impago' ? diasMora : 0;
              const isImpago = student.estadoPago === 'impago';
              return (
                <div key={student.id} className={`p-5 ${isImpago ? 'bg-red-50/50' : ''}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{student.apellido}, {student.nombre}</p>
                      <p className="text-sm text-gray-700 mt-0.5">DNI {student.dni}</p>
                    </div>
                    <Badge status={student.estadoPago}>{translateEstado(student.estadoPago)}</Badge>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-base mb-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Escuela</dt>
                      <dd className="text-gray-900">{student.escuela}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Turno · Nivel</dt>
                      <dd className="text-gray-900">{student.turno} · {student.nivel}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Monto</dt>
                      <dd className="text-gray-900 font-semibold">
                        {formatCurrency(montoFinal)}
                        {tieneRecargo && (
                          <span className="block text-sm text-red-700 font-medium">
                            +{Math.round(((montoFinal / student.valor) - 1) * 100)}% recargo
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">{mora > 0 ? 'Mora' : 'Vencimiento'}</dt>
                      <dd className={mora > 0 ? 'text-red-700 font-bold' : 'text-gray-900'}>
                        {mora > 0 ? `${mora} días` : student.fechaVencimiento.split('-').reverse().join('/')}
                      </dd>
                    </div>
                  </dl>

                  <div className="space-y-2">
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
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="md" onClick={() => handleEditStudent(student)}>
                        <Pencil className="w-5 h-5 mr-1.5" /> Editar
                      </Button>
                      <Button variant="outline" size="md" className="text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300" onClick={() => handleDeleteStudent(student)}>
                        <Trash2 className="w-5 h-5 mr-1.5" /> Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Vista Desktop — tabla */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('apellido')}>
                  <span className="flex items-center gap-1">Alumno <ArrowUpDown className="w-4 h-4" /></span>
                </TableHead>
                <TableHead>DNI</TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort('escuela')}>
                  <span className="flex items-center gap-1">Escuela <ArrowUpDown className="w-4 h-4" /></span>
                </TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="cursor-pointer select-none text-center" onClick={() => handleSort('estadoPago')}>
                  <span className="flex items-center justify-center gap-1">Estado <ArrowUpDown className="w-4 h-4" /></span>
                </TableHead>
                <TableHead className="text-center">Vencimiento</TableHead>
                <TableHead className="cursor-pointer select-none text-center" onClick={() => handleSort('diasMora')}>
                  <span className="flex items-center justify-center gap-1">Mora <ArrowUpDown className="w-4 h-4" /></span>
                </TableHead>
                <TableHead className="text-center">Forma de pago</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow><TableCell colSpan={11} className="text-center text-gray-500 py-10 text-base">No se encontraron alumnos.</TableCell></TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const montoFinal = student.estadoPago !== 'pagado' ? calcularMontoConRecargo(student.valor, now) : student.valor;
                  const mora = student.estadoPago === 'impago' ? diasMora : 0;
                  return (
                    <TableRow key={student.id} className={student.estadoPago === 'impago' ? 'bg-red-50/50' : ''}>
                      <TableCell className="font-semibold text-gray-900">{student.apellido}, {student.nombre}</TableCell>
                      <TableCell className="text-gray-700">{student.dni}</TableCell>
                      <TableCell>{student.escuela}</TableCell>
                      <TableCell>{student.nivel}</TableCell>
                      <TableCell>{student.turno}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(montoFinal)}
                        {student.estadoPago !== 'pagado' && montoFinal > student.valor && (
                          <span className="block text-sm text-red-700 font-medium">+{Math.round(((montoFinal / student.valor) - 1) * 100)}%</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge status={student.estadoPago}>{translateEstado(student.estadoPago)}</Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-700">
                        {student.fechaVencimiento.split('-').reverse().join('/')}
                      </TableCell>
                      <TableCell className="text-center">
                        {mora > 0 ? (
                          <span className="text-sm font-bold text-red-700">{mora} días</span>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        {student.estadoPago !== 'pagado' ? (
                          <div className="flex justify-center gap-1.5">
                            <Button size="sm" className="min-w-[104px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus-visible:ring-emerald-400/50"
                              onClick={() => marcarPagado(student.id, 'Efectivo')}
                              aria-label="Marcar como pagado en efectivo">
                              <Banknote className="w-4 h-4" /> Efectivo
                            </Button>
                            <Button size="sm" className="min-w-[72px] bg-sky-500 hover:bg-sky-600 text-white shadow-sm focus-visible:ring-sky-400/50"
                              onClick={() => marcarPagado(student.id, 'Mercado Pago')}
                              aria-label="Marcar como pagado por Mercado Pago">
                              <Wallet className="w-4 h-4" /> MP
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-800">
                              {student.tipoPago === 'Efectivo'
                                ? <Banknote className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                : <Wallet className="w-4 h-4 text-sky-500" aria-hidden="true" />}
                              {student.tipoPago}
                            </span>
                            <button type="button" onClick={() => desmarcarPago(student.id)}
                              className="text-xs text-gray-500 hover:text-red-700 hover:underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded">
                              Revertir
                            </button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <div className="flex justify-center gap-1.5">
                          <Button variant="ghost" size="sm" aria-label="Editar alumno"
                            onClick={() => handleEditStudent(student)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" aria-label="Eliminar alumno"
                            onClick={() => handleDeleteStudent(student)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
