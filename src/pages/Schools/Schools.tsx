import { useState } from 'react';
import { Plus, Search, MapPin, Phone, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useModalStore } from '../../store/useModalStore';
import SchoolForm from '../../components/forms/SchoolForm';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(value);
}

export default function Schools() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const schools = useSchoolStore((state) => state.schools);
  const openModal = useModalStore((state) => state.openModal);

  const totalAlumnos = schools.reduce((acc, school) => acc + school.alumnos, 0);
  const totalFacturado = schools.reduce((acc, school) => acc + school.facturado, 0);

  const handleOpenNewSchoolModal = () => {
    openModal('Registrar Nueva Escuela', <SchoolForm />);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Escuelas</h1>
          <p className="text-gray-500 text-sm mt-1">Administración de establecimientos, métricas y facturación.</p>
        </div>
        <Button className="shrink-0" onClick={handleOpenNewSchoolModal}>
          <Plus className="w-5 h-5 mr-2" />
          Nueva Escuela
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Alumnos (Todas las escuelas)</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalAlumnos}</p>
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
                <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(totalFacturado)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <span className="text-xl font-bold text-green-600">$</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden text-sm">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar escuela por nombre o dirección..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Establecimiento</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="text-right">Alumnos Asignados</TableHead>
              <TableHead className="text-right">Facturado (Mes)</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.map((school) => (
              <TableRow key={school.id}>
                <TableCell>
                  <p className="font-medium text-gray-900">{school.nombre}</p>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-gray-500 text-xs">
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {school.direccion}
                    </div>
                    {school.telefono && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {school.telefono}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{school.alumnos}</TableCell>
                <TableCell className="text-right font-semibold text-gray-900">{formatCurrency(school.facturado)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary">
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-danger">
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
