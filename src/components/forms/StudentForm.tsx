import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useStudentStore } from '../../store/useStudentStore';
import { useModalStore } from '../../store/useModalStore';
import { fechaVencimientoActual } from '../../utils/payments';
import type { Turno, Nivel, EstadoPago, Student } from '../../types';

interface StudentFormProps {
  student?: Student;
}

export default function StudentForm({ student }: StudentFormProps) {
  const { schools } = useSchoolStore();
  const addStudent = useStudentStore((state) => state.addStudent);
  const editStudent = useStudentStore((state) => state.editStudent);
  const closeModal = useModalStore((state) => state.closeModal);

  const isEditing = !!student;
  const firstSchool = schools[0];
  const [formData, setFormData] = useState({
    nombre: student?.nombre ?? '',
    apellido: student?.apellido ?? '',
    dni: student?.dni ?? '',
    escuelaId: student?.escuelaId ?? firstSchool?.id ?? 0,
    escuela: student?.escuela ?? firstSchool?.nombre ?? '',
    nivel: (student?.nivel ?? firstSchool?.nivel ?? 'Primaria') as Nivel,
    turno: (student?.turno ?? 'Mañana') as Turno,
    valor: student ? String(student.valor) : '',
    direccion: student?.direccion ?? '',
    estado: (student?.estado ?? 'active') as 'active' | 'inactive',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [globalError, setGlobalError] = useState('');

  const isFormValid =
    formData.nombre.trim() !== '' &&
    formData.apellido.trim() !== '' &&
    formData.dni.trim() !== '' &&
    formData.direccion.trim() !== '' &&
    Number(formData.valor) > 0;

  const handleSchoolChange = (schoolId: number) => {
    const school = schools.find((s) => s.id === schoolId);
    if (school) {
      setFormData({ ...formData, escuelaId: school.id, escuela: school.nombre, nivel: school.nivel });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setGlobalError('');

    const newErrors: { [key: string]: string } = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'Requerido';
    if (!formData.dni.trim()) newErrors.dni = 'Requerido';
    if (!formData.direccion.trim()) newErrors.direccion = 'Requerido';
    if (!formData.valor || Number(formData.valor) <= 0) newErrors.valor = 'Debe ser mayor a 0';
    if (!formData.escuelaId) newErrors.escuela = 'Debe seleccionar una escuela';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditing) {
      editStudent(student!.id, {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        dni: formData.dni.trim(),
        escuelaId: formData.escuelaId,
        escuela: formData.escuela,
        nivel: formData.nivel,
        turno: formData.turno,
        valor: Number(formData.valor),
        direccion: formData.direccion.trim(),
        estado: formData.estado,
      });
      closeModal();
      return;
    }

    const venc = fechaVencimientoActual();
    const now = new Date();
    const estadoPago: EstadoPago = now.getDate() <= 10 ? 'en_espera' : 'impago';

    const result = addStudent({
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      dni: formData.dni.trim(),
      escuelaId: formData.escuelaId,
      escuela: formData.escuela,
      nivel: formData.nivel,
      turno: formData.turno,
      valor: Number(formData.valor),
      estadoPago,
      fechaVencimiento: venc,
      fechaPago: null,
      tipoPago: null,
      direccion: formData.direccion.trim(),
      estado: formData.estado,
    });

    if (result.success) {
      closeModal();
    } else {
      setGlobalError(result.error || 'Error al guardar el alumno');
    }
  };

  const handleClearError = (field: string) => {
    if (errors[field]) setErrors({ ...errors, [field]: undefined } as any);
    if (globalError) setGlobalError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {globalError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{globalError}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-danger">*</span></label>
          <Input id="nombre" placeholder="Ej: Juan" value={formData.nombre}
            onChange={(e) => { setFormData({ ...formData, nombre: e.target.value }); handleClearError('nombre'); }}
            error={!!errors.nombre} />
          {errors.nombre && <p className="mt-1 text-sm text-danger">{errors.nombre}</p>}
        </div>
        <div>
          <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">Apellido <span className="text-danger">*</span></label>
          <Input id="apellido" placeholder="Ej: Pérez" value={formData.apellido}
            onChange={(e) => { setFormData({ ...formData, apellido: e.target.value }); handleClearError('apellido'); }}
            error={!!errors.apellido} />
          {errors.apellido && <p className="mt-1 text-sm text-danger">{errors.apellido}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">DNI <span className="text-danger">*</span></label>
          <Input id="dni" placeholder="Ej: 45123456" value={formData.dni}
            onChange={(e) => { setFormData({ ...formData, dni: e.target.value }); handleClearError('dni'); }}
            error={!!errors.dni} />
          {errors.dni && <p className="mt-1 text-sm text-danger">{errors.dni}</p>}
        </div>
        <div>
          <label htmlFor="escuela" className="block text-sm font-medium text-gray-700 mb-1">Escuela <span className="text-danger">*</span></label>
          <select id="escuela" title="Seleccionar Escuela"
            className={`flex h-10 w-full rounded-md border ${errors.escuela ? 'border-danger' : 'border-gray-300'} bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary`}
            value={formData.escuelaId}
            onChange={(e) => { handleSchoolChange(Number(e.target.value)); handleClearError('escuela'); }}>
            {schools.length === 0 && <option value={0}>No hay escuelas disp.</option>}
            {schools.map((school) => (
              <option key={school.id} value={school.id}>{school.nombre}</option>
            ))}
          </select>
          {errors.escuela && <p className="mt-1 text-sm text-danger">{errors.escuela}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección <span className="text-danger">*</span></label>
        <Input id="direccion" placeholder="Ej: Av. Mitre 1234" value={formData.direccion}
          onChange={(e) => { setFormData({ ...formData, direccion: e.target.value }); handleClearError('direccion'); }}
          error={!!errors.direccion} />
        {errors.direccion && <p className="mt-1 text-sm text-danger">{errors.direccion}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
          <select id="nivel" title="Nivel"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.nivel}
            onChange={(e) => setFormData({ ...formData, nivel: e.target.value as Nivel })}>
            <option value="Jardín">Jardín</option>
            <option value="Primaria">Primaria</option>
            <option value="Secundaria">Secundaria</option>
            <option value="Escuela Unificada">Escuela Unificada</option>
          </select>
        </div>
        <div>
          <label htmlFor="turno" className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
          <select id="turno" title="Turno"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.turno}
            onChange={(e) => setFormData({ ...formData, turno: e.target.value as Turno })}>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
          </select>
        </div>
        <div>
          <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">Valor Mensual ($) <span className="text-danger">*</span></label>
          <Input id="valor" type="number" min="1" placeholder="Ej: 25000" value={formData.valor}
            onChange={(e) => { setFormData({ ...formData, valor: e.target.value }); handleClearError('valor'); }}
            error={!!errors.valor} />
          {errors.valor && <p className="mt-1 text-sm text-danger">{errors.valor}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
        <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
        <Button type="submit" disabled={!isFormValid}>{isEditing ? 'Guardar Cambios' : 'Guardar Alumno'}</Button>
      </div>
    </form>
  );
}
