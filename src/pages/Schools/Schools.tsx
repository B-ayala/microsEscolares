import { useState, useMemo } from 'react';
import { Plus, Search, MapPin, Phone, Building2, ArrowLeft, ChevronRight, AlertCircle, CheckCircle2, Clock, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useStudentStore } from '../../store/useStudentStore';
import { useModalStore } from '../../store/useModalStore';
import SchoolForm from '../../components/forms/SchoolForm';
import StudentForm from '../../components/forms/StudentForm';
import { formatCurrency, calcularMontoConRecargo, calcularDiasMora } from '../../utils/payments';
import type { Turno, Nivel, EstadoPago, TipoPago } from '../../types';

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
  const editSchool = useSchoolStore((state) => state.editSchool);
  const deleteSchool = useSchoolStore((state) => state.deleteSchool);
  const students = useStudentStore((state) => state.students);
  const marcarPagado = useStudentStore((state) => state.marcarPagado);
  const desmarcarPago = useStudentStore((state) => state.desmarcarPago);
  const editStudent = useStudentStore((state) => state.editStudent);
  const deleteStudentStore = useStudentStore((state) => state.deleteStudent);
  const openModal = useModalStore((state) => state.openModal);

  // Filters for students inside school
  const [filterTurno, setFilterTurno] = useState<Turno | 'all'>('all');
  const [filterNivel, setFilterNivel] = useState<Nivel | 'all'>('all');
  const [filterEstado, setFilterEstado] = useState<EstadoPago | 'all'>('all');

  const selectedSchool = schools.find((s) => s.id === selectedSchoolId);

  // Students filtered by selected school
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

  // School-level computed data
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

  const handleOpenNewSchoolModal = () => {
    openModal('Registrar Nueva Escuela', <SchoolForm />);
  };

  const handleEditSchool = (school: typeof schools[0]) => {
    openModal('Editar Escuela', <SchoolForm school={school} />);
  };

  const handleDeleteSchool = (school: typeof schools[0]) => {
    const alumnosCount = students.filter((s) => s.escuelaId === school.id && s.estado === 'active').length;
    openModal(
      'Eliminar Escuela',
      <div className="space-y-4">
        <p className="text-gray-600">¿Estás seguro de que deseas eliminar la escuela <strong>{school.nombre}</strong>?</p>
        {alumnosCount > 0 && (
          <p className="text-sm text-amber-600">Esta escuela tiene {alumnosCount} alumno(s) activo(s) asociado(s).</p>
        )}
        <p className="text-sm text-red-600">Esta acción no se puede deshacer.</p>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={() => useModalStore.getState().closeModal()}>Cancelar</Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => { deleteSchool(school.id); useModalStore.getState().closeModal(); }}>Eliminar</Button>
        </div>
      </div>
    );
  };

  const handleEditStudentInSchool = (student: typeof students[0]) => {
    openModal('Editar Alumno', <StudentForm student={student} />);
  };

  const handleDeleteStudentInSchool = (student: typeof students[0]) => {
    openModal(
      'Eliminar Alumno',
      <div className="space-y-4">
        <p className="text-gray-600">¿Estás seguro de que deseas eliminar al alumno <strong>{student.apellido}, {student.nombre}</strong>?</p>
        <p className="text-sm text-red-600">Esta acción no se puede deshacer.</p>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={() => useModalStore.getState().closeModal()}>Cancelar</Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => { deleteStudentStore(student.id); useModalStore.getState().closeModal(); }}>Eliminar</Button>
        </div>
      </div>
    );
  };

  const now = new Date();
  const diasMora = calcularDiasMora(now);

  // ── VISTA DETALLE DE ESCUELA ──
  if (selectedSchool) {
    const stats = schoolStats.find((s) => s.id === selectedSchool.id);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => { selectSchool(null); setFilterTurno('all'); setFilterNivel('all'); setFilterEstado('all'); }}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedSchool.nombre}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{selectedSchool.direccion} · {selectedSchool.nivel}</p>
          </div>
        </div>

        {/* KPIs de la escuela */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg"><Building2 className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-xs text-gray-500">Alumnos</p>
                <p className="text-xl font-bold">{stats?.totalAlumnos ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Pagados</p>
                <p className="text-xl font-bold text-green-600">{stats?.pagados ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
              <div>
                <p className="text-xs text-gray-500">En espera</p>
                <p className="text-xl font-bold text-yellow-600">{stats?.enEspera ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg"><AlertCircle className="w-5 h-5 text-red-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Impagos</p>
                <p className="text-xl font-bold text-red-600">{stats?.impagos ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden text-sm">
          <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-center bg-gray-50/50">
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
            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value as any)} title="Estado"
              className="h-9 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="all">Todos los estados</option>
              <option value="en_espera">En espera</option>
              <option value="pagado">Pagado</option>
              <option value="impago">Impago</option>
            </select>
            {diasMora > 0 && (
              <span className="ml-auto text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full">
                ⚠ {diasMora} días de mora
              </span>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Fecha Pago</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schoolStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-400 py-8">No se encontraron alumnos con los filtros seleccionados.</TableCell>
                </TableRow>
              ) : (
                schoolStudents.map((student) => {
                  const montoFinal = student.estadoPago !== 'pagado' ? calcularMontoConRecargo(student.valor, now) : student.valor;
                  return (
                    <TableRow key={student.id} className={student.estadoPago === 'impago' ? 'bg-red-50/50' : ''}>
                      <TableCell className="font-medium text-gray-900">{student.apellido}, {student.nombre}</TableCell>
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
                      <TableCell className="text-center text-gray-500 text-xs">
                        {student.fechaPago ? student.fechaPago.split('-').reverse().join('/') : '-'}
                        {student.tipoPago && <span className="block text-gray-400">{student.tipoPago}</span>}
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
                            onClick={() => handleEditStudentInSchool(student)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteStudentInSchool(student)}>
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

  // ── VISTA LISTA DE ESCUELAS ──
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Escuelas</h1>
          <p className="text-gray-500 text-sm mt-1">Click en una escuela para ver sus alumnos y controlar pagos.</p>
        </div>
        <Button className="shrink-0" onClick={handleOpenNewSchoolModal}>
          <Plus className="w-5 h-5 mr-2" /> Nueva Escuela
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Alumnos Activos</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{totalAlumnos}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Monto Facturado Estimado (Mensual)</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">{formatCurrency(totalFacturado)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <span className="text-xl font-bold text-green-600">$</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden text-sm">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center bg-gray-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Buscar escuela por nombre o dirección..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Establecimiento</TableHead>
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
                  <p className="font-medium text-gray-900">{school.nombre}</p>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-gray-500 text-xs">
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{school.direccion}</div>
                    {school.telefono && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{school.telefono}</div>}
                  </div>
                </TableCell>
                <TableCell><Badge status="active">{school.nivel}</Badge></TableCell>
                <TableCell className="text-center font-medium">{school.totalAlumnos}</TableCell>
                <TableCell className="text-center font-medium text-green-600">{school.pagados}</TableCell>
                <TableCell className="text-center font-medium text-red-600">{school.impagos > 0 ? school.impagos : '-'}</TableCell>
                <TableCell className="text-right font-semibold text-gray-900">{formatCurrency(school.facturado)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary hover:bg-violet-50"
                      onClick={(e) => { e.stopPropagation(); handleEditSchool(school); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => { e.stopPropagation(); handleDeleteSchool(school); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell><ChevronRight className="w-4 h-4 text-gray-400" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
