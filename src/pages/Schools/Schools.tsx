import { useState, useMemo } from 'react';
import {
  Plus, Search, MapPin, Phone, Building2, ArrowLeft, ChevronRight,
  AlertCircle, CheckCircle2, Clock, Pencil, Trash2, Banknote, Wallet,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useStudentStore } from '../../store/useStudentStore';
import { useModalStore } from '../../store/useModalStore';
import { openConfirmDelete } from '../../components/modal/confirm';
import SchoolForm from '../../components/forms/SchoolForm';
import StudentForm from '../../components/forms/StudentForm';
import { formatCurrency, calcularMontoConRecargo, calcularDiasMora } from '../../utils/payments';
import type { Turno, Nivel, EstadoPago } from '../../types';

function translateEstado(estado: EstadoPago): string {
  switch (estado) {
    case 'en_espera': return 'En espera';
    case 'pagado': return 'Pagado';
    case 'impago': return 'Impago';
  }
}

export default function Schools() {
  const [searchTerm, setSearchTerm] = useState('');
  const schools = useSchoolStore((state) => state.schools);
  const selectedSchoolId = useSchoolStore((state) => state.selectedSchoolId);
  const selectSchool = useSchoolStore((state) => state.selectSchool);
  const deleteSchool = useSchoolStore((state) => state.deleteSchool);
  const students = useStudentStore((state) => state.students);
  const marcarPagado = useStudentStore((state) => state.marcarPagado);
  const desmarcarPago = useStudentStore((state) => state.desmarcarPago);
  const deleteStudentStore = useStudentStore((state) => state.deleteStudent);
  const openModal = useModalStore((state) => state.openModal);

  const [filterTurno, setFilterTurno] = useState<Turno | 'all'>('all');
  const [filterNivel, setFilterNivel] = useState<Nivel | 'all'>('all');
  const [filterEstado, setFilterEstado] = useState<EstadoPago | 'all'>('all');

  const selectedSchool = schools.find((s) => s.id === selectedSchoolId);

  const schoolStudents = useMemo(() => {
    if (!selectedSchoolId) return [];
    return students.filter((s) => {
      if (s.escuelaId !== selectedSchoolId || s.estado !== 'active') return false;
      const matchTurno = filterTurno === 'all' || s.turno === filterTurno;
      const matchNivel = filterNivel === 'all' || s.nivel === filterNivel;
      const matchEstado = filterEstado === 'all' || s.estadoPago === filterEstado;
      return matchTurno && matchNivel && matchEstado;
    });
  }, [students, selectedSchoolId, filterTurno, filterNivel, filterEstado]);

  const schoolStats = useMemo(() => {
    return schools.map((school) => {
      const alumnos = students.filter((s) => s.escuelaId === school.id && s.estado === 'active');
      const pagados = alumnos.filter((s) => s.estadoPago === 'pagado').length;
      const impagos = alumnos.filter((s) => s.estadoPago === 'impago').length;
      const enEspera = alumnos.filter((s) => s.estadoPago === 'en_espera').length;
      const facturado = alumnos.reduce((acc, s) => acc + s.valor, 0);
      return { ...school, totalAlumnos: alumnos.length, pagados, impagos, enEspera, facturado };
    });
  }, [schools, students]);

  const filteredSchools = schoolStats.filter((s) =>
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAlumnos = schoolStats.reduce((acc, s) => acc + s.totalAlumnos, 0);
  const totalFacturado = schoolStats.reduce((acc, s) => acc + s.facturado, 0);

  const handleOpenNewSchoolModal = () => openModal('Registrar Nueva Escuela', <SchoolForm />);

  const handleEditSchool = (school: typeof schools[0]) =>
    openModal('Editar Escuela', <SchoolForm school={school} />);

  const handleDeleteSchool = (school: typeof schools[0]) => {
    const alumnosCount = students.filter((s) => s.escuelaId === school.id && s.estado === 'active').length;
    openConfirmDelete({
      title: 'Eliminar Escuela',
      message: <>¿Querés eliminar la escuela <strong>{school.nombre}</strong>?</>,
      warning: alumnosCount > 0
        ? <>Esta escuela tiene <strong>{alumnosCount} alumno(s) activo(s)</strong> asociado(s).</>
        : undefined,
      onConfirm: () => deleteSchool(school.id),
    });
  };

  const handleEditStudentInSchool = (student: typeof students[0]) =>
    openModal('Editar Alumno', <StudentForm student={student} />);

  const handleDeleteStudentInSchool = (student: typeof students[0]) => {
    openConfirmDelete({
      title: 'Eliminar Alumno',
      message: <>¿Querés eliminar al alumno <strong>{student.apellido}, {student.nombre}</strong>?</>,
      onConfirm: () => deleteStudentStore(student.id),
    });
  };

  const now = new Date();
  const diasMora = calcularDiasMora(now);

  // ── VISTA DETALLE DE ESCUELA ──
  if (selectedSchool) {
    const stats = schoolStats.find((s) => s.id === selectedSchool.id);
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <Button variant="outline" size="md" className="self-start" onClick={() => { selectSchool(null); setFilterTurno('all'); setFilterNivel('all'); setFilterEstado('all'); }}>
            <ArrowLeft className="w-5 h-5 mr-2" /> Volver a Escuelas
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{selectedSchool.nombre}</h1>
            <p className="text-gray-700 text-base mt-1">{selectedSchool.direccion} · {selectedSchool.nivel}</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl"><Building2 className="w-6 h-6 text-primary" /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Alumnos</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalAlumnos ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-green-50 rounded-xl"><CheckCircle2 className="w-6 h-6 text-green-700" /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pagados</p>
                <p className="text-2xl font-bold text-green-700">{stats?.pagados ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-yellow-50 rounded-xl"><Clock className="w-6 h-6 text-yellow-700" /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">En espera</p>
                <p className="text-2xl font-bold text-yellow-700">{stats?.enEspera ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-red-50 rounded-xl"><AlertCircle className="w-6 h-6 text-red-700" /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Impagos</p>
                <p className="text-2xl font-bold text-red-700">{stats?.impagos ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros + listado */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <Select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value as EstadoPago | 'all')} aria-label="Filtrar por estado de pago">
                <option value="all">Todos los estados</option>
                <option value="en_espera">En espera</option>
                <option value="pagado">Pagado</option>
                <option value="impago">Impago</option>
              </Select>
            </div>
            {diasMora > 0 && (
              <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                ⚠ {diasMora} días de mora vigente
              </p>
            )}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {schoolStudents.length === 0 ? (
              <p className="text-center text-gray-500 py-10 text-base">No se encontraron alumnos con los filtros seleccionados.</p>
            ) : (
              schoolStudents.map((student) => {
                const montoFinal = student.estadoPago !== 'pagado' ? calcularMontoConRecargo(student.valor, now) : student.valor;
                const isImpago = student.estadoPago === 'impago';
                return (
                  <div key={student.id} className={`p-5 ${isImpago ? 'bg-red-50/50' : ''}`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{student.apellido}, {student.nombre}</p>
                        <p className="text-sm text-gray-700 mt-0.5">{student.turno} · {student.nivel}</p>
                      </div>
                      <Badge status={student.estadoPago}>{translateEstado(student.estadoPago)}</Badge>
                    </div>
                    <p className="text-base font-semibold text-gray-900 mb-3">{formatCurrency(montoFinal)}</p>
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
                        <Button variant="outline" size="md" onClick={() => handleEditStudentInSchool(student)}>
                          <Pencil className="w-5 h-5 mr-1.5" /> Editar
                        </Button>
                        <Button variant="outline" size="md" className="text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300" onClick={() => handleDeleteStudentInSchool(student)}>
                          <Trash2 className="w-5 h-5 mr-1.5" /> Eliminar
                        </Button>
                      </div>
                    </div>
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
                  <TableHead>Nivel</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Fecha pago</TableHead>
                  <TableHead className="text-center">Forma de pago</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-10 text-base">No se encontraron alumnos con los filtros seleccionados.</TableCell>
                  </TableRow>
                ) : (
                  schoolStudents.map((student) => {
                    const montoFinal = student.estadoPago !== 'pagado' ? calcularMontoConRecargo(student.valor, now) : student.valor;
                    return (
                      <TableRow key={student.id} className={student.estadoPago === 'impago' ? 'bg-red-50/50' : ''}>
                        <TableCell className="font-semibold text-gray-900">{student.apellido}, {student.nombre}</TableCell>
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
                        <TableCell className="text-center text-gray-700 text-sm">
                          {student.fechaPago ? student.fechaPago.split('-').reverse().join('/') : '—'}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          {student.estadoPago !== 'pagado' ? (
                            <div className="flex justify-center gap-1.5">
                              <Button size="sm" className="min-w-[104px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                onClick={() => marcarPagado(student.id, 'Efectivo')}
                                aria-label="Marcar como pagado en efectivo">
                                <Banknote className="w-4 h-4" /> Efectivo
                              </Button>
                              <Button size="sm" className="min-w-[72px] bg-sky-500 hover:bg-sky-600 text-white shadow-sm"
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
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1.5">
                            <Button variant="ghost" size="sm" aria-label="Editar alumno"
                              onClick={() => handleEditStudentInSchool(student)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" aria-label="Eliminar alumno"
                              onClick={() => handleDeleteStudentInSchool(student)}>
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

  // ── VISTA LISTA DE ESCUELAS ──
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="hidden md:block text-3xl font-bold text-gray-900">Gestión de Escuelas</h1>
          <p className="text-gray-600 text-base mt-1">Tocá una escuela para ver sus alumnos y controlar pagos.</p>
        </div>
        <Button size="lg" className="w-full sm:w-auto shrink-0" onClick={handleOpenNewSchoolModal}>
          <Plus className="w-5 h-5 mr-2" /> Nueva Escuela
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl"><Building2 className="w-6 h-6 text-primary" /></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Alumnos activos totales</p>
              <p className="text-3xl font-bold text-gray-900">{totalAlumnos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl"><span className="text-2xl font-bold text-green-700">$</span></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Facturación estimada del mes</p>
              <p className="text-2xl md:text-3xl font-bold text-green-700">{formatCurrency(totalFacturado)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" aria-hidden="true" />
            <Input
              placeholder="Buscar escuela por nombre o dirección..."
              className="pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar escuela"
            />
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredSchools.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-base">No se encontraron escuelas.</p>
          ) : (
            filteredSchools.map((school) => (
              <div key={school.id} className="p-5">
                <button
                  type="button"
                  className="w-full text-left mb-4 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 rounded-lg"
                  onClick={() => selectSchool(school.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900">{school.nombre}</p>
                      <Badge status="active" className="mt-1">{school.nivel}</Badge>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 mt-1" aria-hidden="true" />
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm text-gray-700">
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" />{school.direccion}</p>
                    {school.telefono && <p className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" />{school.telefono}</p>}
                  </div>
                </button>

                <dl className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="rounded-lg bg-gray-50 py-2">
                    <dt className="text-sm font-medium text-gray-600">Alumnos</dt>
                    <dd className="text-xl font-bold text-gray-900">{school.totalAlumnos}</dd>
                  </div>
                  <div className="rounded-lg bg-green-50 py-2">
                    <dt className="text-sm font-medium text-gray-700">Pagados</dt>
                    <dd className="text-xl font-bold text-green-700">{school.pagados}</dd>
                  </div>
                  <div className="rounded-lg bg-red-50 py-2">
                    <dt className="text-sm font-medium text-gray-700">Impagos</dt>
                    <dd className="text-xl font-bold text-red-700">{school.impagos}</dd>
                  </div>
                </dl>

                <p className="text-base mb-3">
                  <span className="text-sm font-medium text-gray-600">Facturado: </span>
                  <span className="font-bold text-gray-900">{formatCurrency(school.facturado)}</span>
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="md" onClick={() => handleEditSchool(school)}>
                    <Pencil className="w-5 h-5 mr-1.5" /> Editar
                  </Button>
                  <Button variant="outline" size="md" className="text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300" onClick={() => handleDeleteSchool(school)}>
                    <Trash2 className="w-5 h-5 mr-1.5" /> Eliminar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[260px]">Establecimiento</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead className="text-center">Alumnos</TableHead>
                <TableHead className="text-center">Pagados</TableHead>
                <TableHead className="text-center">Impagos</TableHead>
                <TableHead className="text-right">Facturado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.map((school) => (
                <TableRow key={school.id} className="cursor-pointer hover:bg-violet-50/50 transition-colors" onClick={() => selectSchool(school.id)}>
                  <TableCell>
                    <p className="font-semibold text-gray-900">{school.nombre}</p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-gray-700 text-sm">
                      <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{school.direccion}</div>
                      {school.telefono && <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{school.telefono}</div>}
                    </div>
                  </TableCell>
                  <TableCell><Badge status="active">{school.nivel}</Badge></TableCell>
                  <TableCell className="text-center font-semibold">{school.totalAlumnos}</TableCell>
                  <TableCell className="text-center font-semibold text-green-700">{school.pagados}</TableCell>
                  <TableCell className="text-center font-semibold text-red-700">{school.impagos > 0 ? school.impagos : '—'}</TableCell>
                  <TableCell className="text-right font-semibold text-gray-900">{formatCurrency(school.facturado)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" aria-label="Editar escuela"
                        onClick={(e) => { e.stopPropagation(); handleEditSchool(school); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" aria-label="Eliminar escuela"
                        onClick={(e) => { e.stopPropagation(); handleDeleteSchool(school); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell><ChevronRight className="w-5 h-5 text-gray-400" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
