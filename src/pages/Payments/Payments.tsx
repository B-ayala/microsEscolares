import { useState } from 'react';
import { Search, Filter, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

const mockPayments = [
  { id: 101, alumno: 'Juan Pérez', escuela: 'Colegio San José', mes: 'Marzo 2026', monto: 25000, estado: 'paid', fechaPago: '05/03/2026' },
  { id: 102, alumno: 'María López', escuela: 'Liceo N°1', mes: 'Marzo 2026', monto: 25000, estado: 'pending', fechaPago: '-' },
  { id: 103, alumno: 'Carlos Ruiz', escuela: 'Instituto Técnico', mes: 'Febrero 2026', monto: 40000, estado: 'overdue', fechaPago: '-' },
  { id: 104, alumno: 'Ana Gómez', escuela: 'Colegio San José', mes: 'Marzo 2026', monto: 25000, estado: 'paid', fechaPago: '02/03/2026' },
  { id: 105, alumno: 'Carlos Ruiz', escuela: 'Instituto Técnico', mes: 'Enero 2026', monto: 40000, estado: 'paid', fechaPago: '10/01/2026' },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(value);
}

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Pagos</h1>
          <p className="text-gray-500 text-sm mt-1">Registra cobros mensuales, historial y vencimientos de alumnos.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <History className="w-4 h-4 mr-2" />
            Reporte Mensual
          </Button>
          <Button>Registrar Cobro</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden text-sm">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por alumno o escuela..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              Mes actual (Mar 2026)
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Estado
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha Ref.</TableHead>
              <TableHead>Alumno</TableHead>
              <TableHead>Escuela</TableHead>
              <TableHead className="text-right">Monto a Cobrar</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones Rápidas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <p className="font-medium text-gray-900">{payment.mes}</p>
                  {payment.estado === 'paid' && (
                    <p className="text-xs text-gray-500 mt-0.5">Pagado el {payment.fechaPago}</p>
                  )}
                </TableCell>
                <TableCell className="font-medium">{payment.alumno}</TableCell>
                <TableCell className="text-gray-600">{payment.escuela}</TableCell>
                <TableCell className="text-right font-medium text-gray-900">
                  {formatCurrency(payment.monto)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge status={payment.estado as any}>
                    {payment.estado === 'paid' && 'Pagado'}
                    {payment.estado === 'pending' && 'Pendiente'}
                    {payment.estado === 'overdue' && 'Vencido'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {payment.estado !== 'paid' ? (
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Marcar Pagado
                      </Button>
                      <Button variant="ghost" size="sm" className="text-danger hover:text-red-700 hover:bg-red-50">
                        <AlertCircle className="w-4 h-4 mr-1.5" />
                        Vencer
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="text-gray-500">
                      Ver Recibo
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
