import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useStudentStore } from '../../store/useStudentStore';
import { useModalStore } from '../../store/useModalStore';
import StudentForm from '../../components/forms/StudentForm';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(value);
}

function translatePaymentStatus(status: string) {
  switch (status) {
    case 'paid': return 'Pagado';
    case 'pending': return 'Pendiente';
    case 'overdue': return 'Vencido';
    default: return status;
  }
}

export default function Students() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPago, setFilterPago] = useState('all');
  const [filterTurno, setFilterTurno] = useState('all');

  const students = useStudentStore((state) => state.students);
  const openModal = useModalStore((state) => state.openModal);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchSearch =
        student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.dni.includes(searchTerm);

      const matchPago = filterPago === 'all' || student.estadoPago === filterPago;
      const matchTurno = filterTurno === 'all' || student.turno.toLowerCase() === filterTurno.toLowerCase();

      return matchSearch && matchPago && matchTurno;
    });
  }, [students, searchTerm, filterPago, filterTurno]);

  const handleOpenNewStudentModal = () => {
    openModal('Nuevo Alumno', <StudentForm />);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Alumnos</h1>
          <p className="text-gray-500 text-sm mt-1">Administra el listado, pagos y turnos de los alumnos.</p>
        </div>
        <Button className="shrink-0" onClick={handleOpenNewStudentModal}>
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Alumno
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden text-sm">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nombre o DNI..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 sm:flex w-full sm:w-auto gap-4">
            <select
              value={filterTurno}
              onChange={(e) => setFilterTurno(e.target.value)}
              title="Filtrar por Turno"
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex-1 sm:flex-none"
            >
              <option value="all">Todos los turnos</option>
              <option value="mañana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="doble">Doble</option>
            </select>
            <select
              value={filterPago}
              onChange={(e) => setFilterPago(e.target.value)}
              title="Filtrar por Pago"
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex-1 sm:flex-none"
            >
              <option value="all">Todos los pagos</option>
              <option value="paid">Pagados</option>
              <option value="pending">Pendientes</option>
              <option value="overdue">Vencidos</option>
            </select>
          </div>
        </div>

        <Table className="min-w-full whitespace-nowrap text-sm sm:text-base">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre y Apellido</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Escuela</TableHead>
              <TableHead>Turno</TableHead>
              <TableHead className="text-right">Valor Mensual</TableHead>
              <TableHead className="text-center">Estado Pago</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id} className={student.estado === 'inactive' ? 'opacity-50' : ''}>
                <TableCell className="font-medium text-gray-900">{student.nombre} {student.apellido}</TableCell>
                <TableCell>{student.dni}</TableCell>
                <TableCell>{student.escuela}</TableCell>
                <TableCell>{student.turno}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(student.valor)}</TableCell>
                <TableCell className="text-center">
                  <Badge status={student.estadoPago as any}>
                    {translatePaymentStatus(student.estadoPago)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary-hover">
                    Ver detalle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
