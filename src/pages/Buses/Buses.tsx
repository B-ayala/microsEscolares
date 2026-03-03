import { useState } from 'react';
import { Plus, Search, Bus as BusIcon, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useBusStore } from '../../store/useBusStore';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useStudentStore } from '../../store/useStudentStore';
import { useModalStore } from '../../store/useModalStore';
import type { Turno } from '../../types';

function BusForm() {
  const addBus = useBusStore((state) => state.addBus);
  const schools = useSchoolStore((state) => state.schools);
  const closeModal = useModalStore((state) => state.closeModal);
  const [form, setForm] = useState({
    patente: '', capacidad: '45', conductor: '', celador: '', turno: 'Mañana' as Turno,
    escuelasAsignadas: [] as number[], estado: 'Activo' as 'Activo' | 'Inactivo' | 'En mantenimiento',
  });

  const toggleSchool = (id: number) => {
    setForm((prev) => ({
      ...prev,
      escuelasAsignadas: prev.escuelasAsignadas.includes(id)
        ? prev.escuelasAsignadas.filter((s) => s !== id)
        : [...prev.escuelasAsignadas, id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patente.trim() || !form.conductor.trim()) return;
    addBus({
      patente: form.patente.trim(),
      capacidad: Number(form.capacidad),
      conductor: form.conductor.trim(),
      celador: form.celador.trim(),
      turno: form.turno,
      escuelasAsignadas: form.escuelasAsignadas,
      estado: form.estado,
    });
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patente *</label>
          <Input value={form.patente} onChange={(e) => setForm({ ...form, patente: e.target.value })} placeholder="AB 123 CD" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
          <Input type="number" value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Conductor *</label>
          <Input value={form.conductor} onChange={(e) => setForm({ ...form, conductor: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Celador</label>
          <Input value={form.celador} onChange={(e) => setForm({ ...form, celador: e.target.value })} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
          <select value={form.turno} onChange={(e) => setForm({ ...form, turno: e.target.value as Turno })}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as any })}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="En mantenimiento">En mantenimiento</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Escuelas Asignadas</label>
        <div className="flex flex-wrap gap-2">
          {schools.map((s) => (
            <button type="button" key={s.id} onClick={() => toggleSchool(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.escuelasAsignadas.includes(s.id) ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
              {s.nombre}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" type="button" onClick={closeModal}>Cancelar</Button>
        <Button type="submit" disabled={!form.patente.trim() || !form.conductor.trim()}>Registrar Colectivo</Button>
      </div>
    </form>
  );
}

export default function Buses() {
  const [searchTerm, setSearchTerm] = useState('');
  const buses = useBusStore((state) => state.buses);
  const deleteBus = useBusStore((state) => state.deleteBus);
  const schools = useSchoolStore((state) => state.schools);
  const students = useStudentStore((state) => state.students);
  const openModal = useModalStore((state) => state.openModal);

  const filteredBuses = buses.filter((b) =>
    b.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.conductor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalActivos = buses.filter((b) => b.estado === 'Activo').length;
  const totalCapacidad = buses.filter((b) => b.estado === 'Activo').reduce((acc, b) => acc + b.capacidad, 0);
  const totalAlumnos = students.filter((s) => s.estado === 'active').length;

  const getSchoolNames = (ids: number[]) =>
    ids.map((id) => schools.find((s) => s.id === id)?.nombre ?? `#${id}`).join(', ');

  const getStudentCount = (bus: typeof buses[0]) => {
    return students.filter(
      (s) => s.estado === 'active' && bus.escuelasAsignadas.includes(s.escuelaId) && s.turno === bus.turno
    ).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Colectivos</h1>
          <p className="text-gray-500 text-sm mt-1">Administración de unidades, conductores, celadores y rutas.</p>
        </div>
        <Button className="shrink-0" onClick={() => openModal('Nuevo Colectivo', <BusForm />)}>
          <Plus className="w-5 h-5 mr-2" /> Nuevo Colectivo
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><BusIcon className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-xs text-gray-500">Colectivos Activos</p>
              <p className="text-xl font-bold">{totalActivos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><Users className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Capacidad Total</p>
              <p className="text-xl font-bold">{totalCapacidad} asientos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><Users className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Alumnos a Transportar</p>
              <p className="text-xl font-bold">{totalAlumnos}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden text-sm">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-center bg-gray-50/50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Buscar por patente o conductor..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

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
            {filteredBuses.map((bus) => {
              const studentCount = getStudentCount(bus);
              const occupancy = bus.capacidad > 0 ? Math.round((studentCount / bus.capacidad) * 100) : 0;
              return (
                <TableRow key={bus.id} className={bus.estado !== 'Activo' ? 'opacity-60' : ''}>
                  <TableCell className="font-mono font-bold text-gray-900">{bus.patente}</TableCell>
                  <TableCell>{bus.conductor}</TableCell>
                  <TableCell>{bus.celador || '-'}</TableCell>
                  <TableCell>{bus.turno}</TableCell>
                  <TableCell className="text-center">{bus.capacidad}</TableCell>
                  <TableCell className="text-center">
                    <span className={occupancy > 90 ? 'text-red-600 font-bold' : occupancy > 70 ? 'text-yellow-600 font-medium' : ''}>{studentCount}</span>
                    <span className="text-xs text-gray-400 ml-1">({occupancy}%)</span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600 max-w-[200px] truncate">{getSchoolNames(bus.escuelasAsignadas)}</TableCell>
                  <TableCell className="text-center">
                    {bus.estado === 'Activo' && <Badge status="active">Activo</Badge>}
                    {bus.estado === 'Inactivo' && <Badge status="inactive">Inactivo</Badge>}
                    {bus.estado === 'En mantenimiento' && <Badge status="en_espera">Mantenimiento</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600" onClick={() => deleteBus(bus.id)}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
