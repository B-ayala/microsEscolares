import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, ArrowUpDown, CheckCircle2, AlertCircle, Clock, X, Filter, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useStudentStore } from '../../store/useStudentStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useModalStore } from '../../store/useModalStore';
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
  const editStudent = useStudentStore((state) => state.editStudent);
  const deleteStudent = useStudentStore((state) => state.deleteStudent);
  const schools = useSchoolStore((state) => state.schools);
  const openModal = useModalStore((state) => state.openModal);

  // Read filter from URL search params (when coming from Dashboard alert)
  useEffect(() => {
    const paramFilter = searchParams.get('filterPago');
    if (paramFilter && isValidFilterEstado(paramFilter)) {
      setFilterPago(paramFilter);
      setFromAlert(paramFilter);
      // Clean URL without reloading
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

    // Sort
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
          // Impagos first, then en_espera, then pagados
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

  const handleOpenNewStudentModal = () => {
    openModal('Nuevo Alumno', <StudentForm />);
  };

  const handleEditStudent = (student: typeof students[0]) => {
    openModal('Editar Alumno', <StudentForm student={student} />);
  };

  const handleDeleteStudent = (student: typeof students[0]) => {
    openModal(
      'Eliminar Alumno',
      <div className="space-y-4">
        <p className="text-gray-600">¿Estás seguro de que deseas eliminar al alumno <strong>{student.apellido}, {student.nombre}</strong>?</p>
        <p className="text-sm text-red-600">Esta acción no se puede deshacer.</p>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={() => useModalStore.getState().closeModal()}>Cancelar</Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => { deleteStudent(student.id); useModalStore.getState().closeModal(); }}>Eliminar</Button>
        </div>
      </div>
    );
  };

  // KPIs
  const activeStudents = students.filter((s) => s.estado === 'active');
  const totalPagados = activeStudents.filter((s) => s.estadoPago === 'pagado').length;
  const totalEnEspera = activeStudents.filter((s) => s.estadoPago === 'en_espera').length;
  const totalImpagos = activeStudents.filter((s) => s.estadoPago === 'impago').length;
  const totalVencidoConMora = activeStudents.filter((s) => s.estadoPago === 'impago' && diasMora > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Alumnos</h1>
          <p className="text-gray-500 text-sm mt-1">
            Listado completo de alumnos, pagos y filtros avanzados.
            {diasMora > 0 && <span className="ml-2 text-red-500 font-medium">({recargo} · {diasMora} días de mora)</span>}
          </p>
        </div>
        <Button className="shrink-0" onClick={handleOpenNewStudentModal}>
          <Plus className="w-5 h-5 mr-2" /> Nuevo Alumno
        </Button>
      </div>

      {/* Alert origin banner */}
      {fromAlert && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
          <Filter className="w-4 h-4 shrink-0" />
          <span>
            Filtro aplicado desde el Dashboard: <strong>{ALERT_LABELS[fromAlert] || translateFilterEstado(fromAlert as FilterEstado)}</strong>
            {' '}— Mostrando {filteredStudents.length} alumno(s).
          </span>
          <button
            onClick={clearAlertFilter}
            className="ml-auto flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Quitar filtro
          </button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Search className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-xs text-gray-500">Activos</p>
              <p className="text-xl font-bold">{activeStudents.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Pagados</p>
              <p className="text-xl font-bold text-green-600">{totalPagados}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-xs text-gray-500">En espera</p>
              <p className="text-xl font-bold text-yellow-600">{totalEnEspera}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg"><AlertCircle className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Impagos</p>
              <p className="text-xl font-bold text-red-600">{totalImpagos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg"><AlertTriangle className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Vencido con mora</p>
              <p className="text-xl font-bold text-orange-600">{totalVencidoConMora}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden text-sm">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-center bg-gray-50/50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Buscar por nombre o DNI..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={filterEscuela} onChange={(e) => setFilterEscuela(e.target.value)} title="Escuela"
            className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">Todas las escuelas</option>
            {schools.map((s) => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
          </select>
          <select value={filterTurno} onChange={(e) => setFilterTurno(e.target.value as any)} title="Turno"
            className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">Todos los turnos</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
          </select>
          <select value={filterNivel} onChange={(e) => setFilterNivel(e.target.value as any)} title="Nivel"
            className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">Todos los niveles</option>
            <option value="Jardín">Jardín</option>
            <option value="Primaria">Primaria</option>
            <option value="Secundaria">Secundaria</option>
            <option value="Escuela Unificada">Escuela Unificada</option>
          </select>
          <select value={filterPago} onChange={(e) => { setFilterPago(e.target.value as FilterEstado); if (fromAlert && e.target.value !== fromAlert) setFromAlert(null); }} title="Estado pago"
            className={`h-9 rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
              fromAlert ? 'border-blue-400 bg-blue-50 text-blue-800 ring-2 ring-blue-200' : 'border-gray-300 bg-white text-gray-900'
            }`}>
            <option value="all">Todos los estados</option>
            <option value="en_espera">En espera</option>
            <option value="pagado">Pagado</option>
            <option value="impago">Impago</option>
            <option value="vencido_con_mora">Vencido con mora</option>
          </select>
          <button
            onClick={() => setSoloImpagos(!soloImpagos)}
            className={`h-9 px-3 rounded-md text-sm font-medium border transition-colors ${soloImpagos ? 'bg-red-100 text-red-700 border-red-300' : 'bg-white text-gray-600 border-gray-300 hover:bg-red-50'}`}
          >
            {soloImpagos ? '✕ Quitar filtro impagos' : '⚠ Ver solo impagos'}
          </button>
        </div>

        <Table className="min-w-full whitespace-nowrap text-sm sm:text-base">
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort('apellido')}>
                <span className="flex items-center gap-1">Alumno <ArrowUpDown className="w-3 h-3" /></span>
              </TableHead>
              <TableHead>DNI</TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort('escuela')}>
                <span className="flex items-center gap-1">Escuela <ArrowUpDown className="w-3 h-3" /></span>
              </TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Turno</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="cursor-pointer select-none text-center" onClick={() => handleSort('estadoPago')}>
                <span className="flex items-center justify-center gap-1">Estado <ArrowUpDown className="w-3 h-3" /></span>
              </TableHead>
              <TableHead className="text-center">Vencimiento</TableHead>
              <TableHead className="cursor-pointer select-none text-center" onClick={() => handleSort('diasMora')}>
                <span className="flex items-center justify-center gap-1">Mora <ArrowUpDown className="w-3 h-3" /></span>
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow><TableCell colSpan={10} className="text-center text-gray-400 py-8">No se encontraron alumnos.</TableCell></TableRow>
            ) : (
              filteredStudents.map((student) => {
                const montoFinal = student.estadoPago !== 'pagado' ? calcularMontoConRecargo(student.valor, now) : student.valor;
                const mora = student.estadoPago === 'impago' ? diasMora : 0;
                return (
                  <TableRow key={student.id} className={student.estadoPago === 'impago' ? 'bg-red-50/50' : ''}>
                    <TableCell className="font-medium text-gray-900">{student.apellido}, {student.nombre}</TableCell>
                    <TableCell className="text-gray-500">{student.dni}</TableCell>
                    <TableCell>{student.escuela}</TableCell>
                    <TableCell>{student.nivel}</TableCell>
                    <TableCell>{student.turno}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(montoFinal)}
                      {student.estadoPago !== 'pagado' && montoFinal > student.valor && (
                        <span className="block text-xs text-red-500">+{Math.round(((montoFinal / student.valor) - 1) * 100)}%</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge status={student.estadoPago}>{translateEstado(student.estadoPago)}</Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs text-gray-500">
                      {student.fechaVencimiento.split('-').reverse().join('/')}
                    </TableCell>
                    <TableCell className="text-center">
                      {mora > 0 ? (
                        <span className="text-xs font-bold text-red-600">{mora} días</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {student.estadoPago !== 'pagado' ? (
                          <>
                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => marcarPagado(student.id, 'Efectivo')}>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Efectivo
                            </Button>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => marcarPagado(student.id, 'Mercado Pago')}>
                              MP
                            </Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600"
                            onClick={() => desmarcarPago(student.id)}>
                            Revertir
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary hover:bg-violet-50"
                          onClick={() => handleEditStudent(student)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteStudent(student)}>
                          <Trash2 className="w-3.5 h-3.5" />
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
  );
}
