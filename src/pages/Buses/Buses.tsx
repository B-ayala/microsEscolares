import { useState, useMemo } from 'react';
import { Plus, Search, Bus as BusIcon, Users, Trash2, ArrowLeft, Edit2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useBusStore } from '../../store/useBusStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useStudentStore } from '../../store/useStudentStore';
import { useModalStore } from '../../store/useModalStore';
import { openConfirmDelete } from '../../components/modal/confirm';
import { cn } from '../../components/ui/Button';
import type { Bus, Student, Turno } from '../../types';

type EstadoBus = 'Activo' | 'Inactivo' | 'En mantenimiento';

// ── BusForm ────────────────────────────────────────────────────────────────────

function BusForm({ bus }: { bus?: Bus }) {
  const addBus = useBusStore((s) => s.addBus);
  const editBus = useBusStore((s) => s.editBus);
  const schools = useSchoolStore((s) => s.schools);
  const closeModal = useModalStore((s) => s.closeModal);

  const [form, setForm] = useState({
    patente: bus?.patente ?? '',
    capacidad: String(bus?.capacidad ?? 45),
    conductor: bus?.conductor ?? '',
    celador: bus?.celador ?? '',
    turno: (bus?.turno ?? 'Mañana') as Turno,
    escuelasAsignadas: bus?.escuelasAsignadas ?? ([] as number[]),
    estado: (bus?.estado ?? 'Activo') as EstadoBus,
  });

  const toggleSchool = (id: number) =>
    setForm((prev) => ({
      ...prev,
      escuelasAsignadas: prev.escuelasAsignadas.includes(id)
        ? prev.escuelasAsignadas.filter((s) => s !== id)
        : [...prev.escuelasAsignadas, id],
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patente.trim() || !form.conductor.trim()) return;
    const data = {
      patente: form.patente.trim(),
      capacidad: Number(form.capacidad),
      conductor: form.conductor.trim(),
      celador: form.celador.trim(),
      turno: form.turno,
      escuelasAsignadas: form.escuelasAsignadas,
      estado: form.estado,
    };
    if (bus) {
      editBus(bus.id, data);
    } else {
      addBus(data);
    }
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="bus-patente" className="block text-base font-semibold text-gray-800 mb-1.5">Patente *</label>
          <Input id="bus-patente" value={form.patente} onChange={(e) => setForm({ ...form, patente: e.target.value })} placeholder="AB 123 CD" />
        </div>
        <div>
          <label htmlFor="bus-capacidad" className="block text-base font-semibold text-gray-800 mb-1.5">Capacidad</label>
          <Input id="bus-capacidad" type="number" min="1" max="100" value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="bus-conductor" className="block text-base font-semibold text-gray-800 mb-1.5">Conductor *</label>
          <Input id="bus-conductor" value={form.conductor} onChange={(e) => setForm({ ...form, conductor: e.target.value })} />
        </div>
        <div>
          <label htmlFor="bus-celador" className="block text-base font-semibold text-gray-800 mb-1.5">Celador</label>
          <Input id="bus-celador" value={form.celador} onChange={(e) => setForm({ ...form, celador: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="bus-turno" className="block text-base font-semibold text-gray-800 mb-1.5">Turno</label>
          <Select id="bus-turno" value={form.turno} onChange={(e) => setForm({ ...form, turno: e.target.value as Turno })}>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
          </Select>
        </div>
        <div>
          <label htmlFor="bus-estado" className="block text-base font-semibold text-gray-800 mb-1.5">Estado</label>
          <Select id="bus-estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoBus })}>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="En mantenimiento">En mantenimiento</option>
          </Select>
        </div>
      </div>
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">Escuelas Asignadas</label>
        <div className="flex flex-wrap gap-2">
          {schools.map((s) => {
            const selected = form.escuelasAsignadas.includes(s.id);
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => toggleSchool(s.id)}
                className={cn(
                  'min-h-[44px] px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
                  selected
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                )}
              >
                {s.nombre}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
        <Button variant="outline" type="button" onClick={closeModal} className="w-full sm:w-auto">Cancelar</Button>
        <Button type="submit" disabled={!form.patente.trim() || !form.conductor.trim()} className="w-full sm:w-auto">
          {bus ? 'Guardar cambios' : 'Registrar Colectivo'}
        </Button>
      </div>
    </form>
  );
}

// ── Seat diagram helpers ───────────────────────────────────────────────────────

/**
 * Builds seat rows for the bus diagram.
 * Regular rows: 4 seats (2 left + 2 right of aisle).
 * When ≤5 seats remain after filling regular rows, they become the back row.
 */
function buildSeatRows(capacity: number): (number | null)[][] {
  const rows: (number | null)[][] = [];
  let remaining = capacity;
  let seatNum = 1;

  while (remaining > 0) {
    if (remaining <= 5 && remaining > 4) {
      // Back row: up to 5 seats across
      rows.push(Array.from({ length: remaining }, (_, i) => seatNum + i));
      break;
    }
    const count = Math.min(4, remaining);
    // Pad to 4 slots with null for partial last row
    const row: (number | null)[] = [null, null, null, null];
    for (let i = 0; i < count; i++) row[i] = seatNum + i;
    rows.push(row);
    seatNum += count;
    remaining -= count;
  }
  return rows;
}

function SeatBox({ seatNum, student }: { seatNum: number | null; student?: Student }) {
  if (seatNum === null) return <div className="w-8 h-8 shrink-0" />;
  const occupied = !!student;
  const label = occupied
    ? `Asiento ${seatNum}: ${student!.apellido}, ${student!.nombre}`
    : `Asiento ${seatNum} libre`;
  return (
    <div
      title={label}
      aria-label={label}
      className={cn(
        'w-8 h-8 shrink-0 rounded-md border-2 flex items-center justify-center text-[10px] font-bold select-none transition-colors',
        occupied
          ? 'bg-primary border-violet-700 text-white'
          : 'bg-white border-gray-300 text-gray-400'
      )}
    >
      {seatNum}
    </div>
  );
}

function BusDiagram({ bus, assignedStudents }: { bus: Bus; assignedStudents: Student[] }) {
  const rows = buildSeatRows(bus.capacidad);

  const seatMap = useMemo(() => {
    const map = new Map<number, Student>();
    assignedStudents.forEach((s, i) => map.set(i + 1, s));
    return map;
  }, [assignedStudents]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Bus shell */}
      <div className="inline-flex flex-col items-center bg-gray-50 border-2 border-gray-300 rounded-[28px] px-6 py-5 gap-1.5">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Frente</span>

        {/* Driver seat row */}
        <div className="flex items-center gap-1 mb-2">
          <div
            className="w-8 h-8 shrink-0 rounded-md border-2 bg-blue-100 border-blue-400 flex items-center justify-center text-[10px] font-bold text-blue-700"
            title="Conductor"
            aria-label="Asiento del conductor"
          >
            C
          </div>
          <div className="w-6 shrink-0" />
          <div className="w-8 h-8 shrink-0" />
          <div className="w-8 h-8 shrink-0" />
        </div>

        <div className="w-full h-px bg-gray-200 mb-1" />

        {/* Seat rows */}
        {rows.map((row, ri) => {
          // Back row (5 seats): render across full width without aisle
          if (row.length === 5) {
            return (
              <div key={ri} className="flex items-center gap-1">
                {row.map((sn, si) => (
                  <SeatBox key={sn ?? `null-${ri}-${si}`} seatNum={sn} student={sn ? seatMap.get(sn) : undefined} />
                ))}
              </div>
            );
          }
          // Regular row: 2 seats | aisle | 2 seats
          return (
            <div key={ri} className="flex items-center gap-1">
              <SeatBox seatNum={row[0]} student={row[0] ? seatMap.get(row[0]) : undefined} />
              <SeatBox seatNum={row[1]} student={row[1] ? seatMap.get(row[1]) : undefined} />
              <div className="w-6 shrink-0" />
              <SeatBox seatNum={row[2]} student={row[2] ? seatMap.get(row[2]) : undefined} />
              <SeatBox seatNum={row[3]} student={row[3] ? seatMap.get(row[3]) : undefined} />
            </div>
          );
        })}

        <div className="w-full h-px bg-gray-200 mt-1 mb-1" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Atrás</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-primary border-2 border-violet-700 shrink-0" />
          Ocupado
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-white border-2 border-gray-300 shrink-0" />
          Libre
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-400 shrink-0" />
          Conductor
        </div>
      </div>
    </div>
  );
}

// ── BusDetail ─────────────────────────────────────────────────────────────────

function BusDetail({ bus, onBack }: { bus: Bus; onBack: () => void }) {
  const students = useStudentStore((s) => s.students);
  const schools = useSchoolStore((s) => s.schools);
  const openModal = useModalStore((s) => s.openModal);
  const deleteBus = useBusStore((s) => s.deleteBus);

  const assignedStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          s.estado === 'active' &&
          bus.escuelasAsignadas.includes(s.escuelaId) &&
          s.turno === bus.turno
      ),
    [students, bus]
  );

  const schoolNames = bus.escuelasAsignadas
    .map((id) => schools.find((s) => s.id === id)?.nombre ?? `#${id}`)
    .join(', ');

  const occupied = assignedStudents.length;
  const free = Math.max(0, bus.capacidad - occupied);
  const occupancy = bus.capacidad > 0 ? Math.round((occupied / bus.capacidad) * 100) : 0;

  const handleDelete = () => {
    openConfirmDelete({
      title: 'Eliminar Colectivo',
      message: (
        <>
          ¿Querés eliminar el colectivo <strong>{bus.patente}</strong> conducido por{' '}
          <strong>{bus.conductor}</strong>?
        </>
      ),
      onConfirm: () => {
        onBack();
        deleteBus(bus.id);
      },
    });
  };

  const ocupancyColor =
    occupancy > 90 ? 'text-red-700' : occupancy > 70 ? 'text-yellow-700' : 'text-gray-900';
  const ocupancyBg =
    occupancy > 90 ? 'bg-red-50' : occupancy > 70 ? 'bg-yellow-50' : 'bg-gray-50';
  const ocupancyIcon =
    occupancy > 90 ? 'text-red-700' : occupancy > 70 ? 'text-yellow-700' : 'text-gray-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="outline" size="md" onClick={onBack} className="w-full sm:w-auto shrink-0">
          <ArrowLeft className="w-5 h-5 mr-2" /> Volver al listado
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-gray-900 font-mono">{bus.patente}</h1>
            {renderEstadoBadge(bus.estado as EstadoBus)}
          </div>
          <p className="text-gray-600 text-base mt-0.5">
            Turno {bus.turno}
            {schoolNames ? ` · ${schoolNames}` : ''}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={() => openModal('Editar Colectivo', <BusForm bus={bus} />)}
            className="w-full sm:w-auto"
          >
            <Edit2 className="w-4 h-4 mr-2" /> Editar
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={handleDelete}
            className="w-full sm:w-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl shrink-0">
              <BusIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Capacidad</p>
              <p className="text-2xl font-bold text-gray-900">{bus.capacidad}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-violet-50 rounded-xl shrink-0">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ocupados</p>
              <p className="text-2xl font-bold text-gray-900">{occupied}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl shrink-0">
              <Users className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Libres</p>
              <p className="text-2xl font-bold text-gray-900">{free}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={cn('p-2.5 rounded-xl shrink-0', ocupancyBg)}>
              <BusIcon className={cn('w-6 h-6', ocupancyIcon)} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ocupación</p>
              <p className={cn('text-2xl font-bold', ocupancyColor)}>{occupancy}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main layout: diagram + info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Seat diagram */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de asientos</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex justify-center overflow-auto">
            <BusDiagram bus={bus} assignedStudents={assignedStudents} />
          </CardContent>
        </Card>

        {/* Right column: bus info + student list */}
        <div className="space-y-4">
          {/* Bus data */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del colectivo</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-600">Conductor</dt>
                  <dd className="text-base font-semibold text-gray-900 mt-0.5">{bus.conductor}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Celador</dt>
                  <dd className="text-base font-semibold text-gray-900 mt-0.5">{bus.celador || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Turno</dt>
                  <dd className="text-base font-semibold text-gray-900 mt-0.5">{bus.turno}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">Estado</dt>
                  <dd className="mt-0.5">{renderEstadoBadge(bus.estado as EstadoBus)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-600">Escuelas asignadas</dt>
                  <dd className="text-base font-semibold text-gray-900 mt-0.5">{schoolNames || '—'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Student list */}
          <Card>
            <CardHeader>
              <CardTitle>
                Alumnos asignados{' '}
                <span className="text-base font-normal text-gray-500">({occupied})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {assignedStudents.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-base px-5">
                  No hay alumnos activos asignados a este colectivo.
                </p>
              ) : (
                <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                  {assignedStudents.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-900 truncate">
                          {s.apellido}, {s.nombre}
                        </p>
                        <p className="text-sm text-gray-600 truncate">{s.escuela}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Shared helper ──────────────────────────────────────────────────────────────

function renderEstadoBadge(estado: EstadoBus) {
  if (estado === 'Activo') return <Badge status="active">Activo</Badge>;
  if (estado === 'Inactivo') return <Badge status="inactive">Inactivo</Badge>;
  return <Badge status="en_espera">Mantenimiento</Badge>;
}

// ── Main Buses page ───────────────────────────────────────────────────────────

export default function Buses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);

  const buses = useBusStore((s) => s.buses);
  const deleteBus = useBusStore((s) => s.deleteBus);
  const schools = useSchoolStore((s) => s.schools);
  const students = useStudentStore((s) => s.students);
  const openModal = useModalStore((s) => s.openModal);

  const filteredBuses = useMemo(
    () =>
      buses.filter(
        (b) =>
          b.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.conductor.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [buses, searchTerm]
  );

  // Early return AFTER all hooks
  if (selectedBusId !== null) {
    const bus = buses.find((b) => b.id === selectedBusId);
    if (bus) {
      return <BusDetail bus={bus} onBack={() => setSelectedBusId(null)} />;
    }
    setSelectedBusId(null);
  }

  const totalActivos = buses.filter((b) => b.estado === 'Activo').length;
  const totalCapacidad = buses
    .filter((b) => b.estado === 'Activo')
    .reduce((acc, b) => acc + b.capacidad, 0);
  const totalAlumnos = students.filter((s) => s.estado === 'active').length;

  const getSchoolNames = (ids: number[]) =>
    ids.map((id) => schools.find((s) => s.id === id)?.nombre ?? `#${id}`).join(', ');

  const getStudentCount = (bus: Bus) =>
    students.filter(
      (s) =>
        s.estado === 'active' &&
        bus.escuelasAsignadas.includes(s.escuelaId) &&
        s.turno === bus.turno
    ).length;

  const handleDelete = (e: React.MouseEvent, bus: Bus) => {
    e.stopPropagation();
    openConfirmDelete({
      title: 'Eliminar Colectivo',
      message: (
        <>
          ¿Querés eliminar el colectivo <strong>{bus.patente}</strong> conducido por{' '}
          <strong>{bus.conductor}</strong>?
        </>
      ),
      onConfirm: () => deleteBus(bus.id),
    });
  };

  const occupancyClass = (occupancy: number) =>
    occupancy > 90
      ? 'text-red-700 font-bold'
      : occupancy > 70
      ? 'text-yellow-700 font-bold'
      : 'text-gray-800';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="hidden md:block text-3xl font-bold text-gray-900">Gestión de Colectivos</h1>
          <p className="text-gray-600 text-base mt-1">
            Administración de unidades, conductores, celadores y rutas.
          </p>
        </div>
        <Button
          size="lg"
          className="w-full sm:w-auto shrink-0"
          onClick={() => openModal('Nuevo Colectivo', <BusForm />)}
        >
          <Plus className="w-5 h-5 mr-2" /> Nuevo Colectivo
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <BusIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Colectivos activos</p>
              <p className="text-3xl font-bold text-gray-900">{totalActivos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <Users className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Capacidad total</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalCapacidad}{' '}
                <span className="text-base font-medium text-gray-600">asientos</span>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Users className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Alumnos a transportar</p>
              <p className="text-3xl font-bold text-gray-900">{totalAlumnos}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listado */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5"
              aria-hidden="true"
            />
            <Input
              placeholder="Buscar por patente o conductor..."
              className="pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar colectivo"
            />
          </div>
        </div>

        {/* Vista Mobile */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredBuses.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-base">
              No se encontraron colectivos.
            </p>
          ) : (
            filteredBuses.map((bus) => {
              const studentCount = getStudentCount(bus);
              const occupancy =
                bus.capacidad > 0 ? Math.round((studentCount / bus.capacidad) * 100) : 0;
              return (
                <div
                  key={bus.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver detalle de colectivo ${bus.patente}`}
                  onClick={() => setSelectedBusId(bus.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedBusId(bus.id)}
                  className={cn(
                    'p-5 cursor-pointer hover:bg-gray-50/80 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40',
                    bus.estado !== 'Activo' && 'opacity-70'
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-mono text-xl font-bold text-gray-900">{bus.patente}</p>
                      <p className="text-base text-gray-700 mt-0.5">Turno {bus.turno}</p>
                    </div>
                    {renderEstadoBadge(bus.estado as EstadoBus)}
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-base">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Conductor</dt>
                      <dd className="text-gray-900 font-medium">{bus.conductor}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Celador</dt>
                      <dd className="text-gray-900">{bus.celador || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Ocupación</dt>
                      <dd className={occupancyClass(occupancy)}>
                        {studentCount} / {bus.capacidad}{' '}
                        <span className="text-sm text-gray-600">({occupancy}%)</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Escuelas</dt>
                      <dd className="text-gray-800">{bus.escuelasAsignadas.length}</dd>
                    </div>
                  </dl>

                  {bus.escuelasAsignadas.length > 0 && (
                    <p className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Asignadas:</span>{' '}
                      {getSchoolNames(bus.escuelasAsignadas)}
                    </p>
                  )}

                  <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300"
                      onClick={(e) => handleDelete(e, bus)}
                    >
                      <Trash2 className="w-5 h-5 mr-2" /> Eliminar colectivo
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Vista Desktop */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patente</TableHead>
                <TableHead>Conductor</TableHead>
                <TableHead>Celador</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead className="text-center">Capacidad</TableHead>
                <TableHead className="text-center">Alumnos</TableHead>
                <TableHead>Escuelas</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-10 text-base">
                    No se encontraron colectivos.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBuses.map((bus) => {
                  const studentCount = getStudentCount(bus);
                  const occupancy =
                    bus.capacidad > 0
                      ? Math.round((studentCount / bus.capacidad) * 100)
                      : 0;
                  return (
                    <TableRow
                      key={bus.id}
                      className={cn(
                        'cursor-pointer hover:bg-primary/5 transition-colors',
                        bus.estado !== 'Activo' && 'opacity-60'
                      )}
                      onClick={() => setSelectedBusId(bus.id)}
                    >
                      <TableCell className="font-mono font-bold text-gray-900">
                        {bus.patente}
                      </TableCell>
                      <TableCell className="font-medium">{bus.conductor}</TableCell>
                      <TableCell>{bus.celador || '—'}</TableCell>
                      <TableCell>{bus.turno}</TableCell>
                      <TableCell className="text-center">{bus.capacidad}</TableCell>
                      <TableCell className="text-center">
                        <span className={occupancyClass(occupancy)}>{studentCount}</span>
                        <span className="text-sm text-gray-600 ml-1">({occupancy}%)</span>
                      </TableCell>
                      <TableCell
                        className="text-sm text-gray-700 max-w-[220px] truncate"
                        title={getSchoolNames(bus.escuelasAsignadas)}
                      >
                        {getSchoolNames(bus.escuelasAsignadas) || '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderEstadoBadge(bus.estado as EstadoBus)}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300"
                          onClick={(e) => handleDelete(e, bus)}
                        >
                          <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
                        </Button>
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
