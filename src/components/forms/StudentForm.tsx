import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
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

  const labelClass = 'block text-base font-semibold text-gray-800 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {globalError && (
        <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg text-base font-medium">{globalError}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className={labelClass}>Nombre <span className="text-danger">*</span></label>
          <Input id="nombre" placeholder="Ej: Juan" value={formData.nombre}
            onChange={(e) => { setFormData({ ...formData, nombre: e.target.value }); handleClearError('nombre'); }}
            error={!!errors.nombre} />
          {errors.nombre && <p className="mt-1 text-sm font-medium text-danger">{errors.nombre}</p>}
        </div>
        <div>
          <label htmlFor="apellido" className={labelClass}>Apellido <span className="text-danger">*</span></label>
          <Input id="apellido" placeholder="Ej: Pérez" value={formData.apellido}
            onChange={(e) => { setFormData({ ...formData, apellido: e.target.value }); handleClearError('apellido'); }}
            error={!!errors.apellido} />
          {errors.apellido && <p className="mt-1 text-sm font-medium text-danger">{errors.apellido}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dni" className={labelClass}>DNI <span className="text-danger">*</span></label>
          <Input id="dni" placeholder="Ej: 45123456" value={formData.dni}
            onChange={(e) => { setFormData({ ...formData, dni: e.target.value }); handleClearError('dni'); }}
            error={!!errors.dni} />
          {errors.dni && <p className="mt-1 text-sm font-medium text-danger">{errors.dni}</p>}
        </div>
        <div>
          <label htmlFor="escuela" className={labelClass}>Escuela <span className="text-danger">*</span></label>
          <Select id="escuela" error={!!errors.escuela}
            value={formData.escuelaId}
            onChange={(e) => { handleSchoolChange(Number(e.target.value)); handleClearError('escuela'); }}>
            {schools.length === 0 && <option value={0}>No hay escuelas disp.</option>}
            {schools.map((school) => (
              <option key={school.id} value={school.id}>{school.nombre}</option>
            ))}
          </Select>
          {errors.escuela && <p className="mt-1 text-sm font-medium text-danger">{errors.escuela}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="direccion" className={labelClass}>Dirección <span className="text-danger">*</span></label>
        <Input id="direccion" placeholder="Ej: Av. Mitre 1234" value={formData.direccion}
          onChange={(e) => { setFormData({ ...formData, direccion: e.target.value }); handleClearError('direccion'); }}
          error={!!errors.direccion} />
        {errors.direccion && <p className="mt-1 text-sm font-medium text-danger">{errors.direccion}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="nivel" className={labelClass}>Nivel</label>
          <Select id="nivel" value={formData.nivel}
            onChange={(e) => setFormData({ ...formData, nivel: e.target.value as Nivel })}>
            <option value="Jardín">Jardín</option>
            <option value="Primaria">Primaria</option>
            <option value="Secundaria">Secundaria</option>
            <option value="Escuela Unificada">Escuela Unificada</option>
          </Select>
        </div>
        <div>
          <label htmlFor="turno" className={labelClass}>Turno</label>
          <Select id="turno" value={formData.turno}
            onChange={(e) => setFormData({ ...formData, turno: e.target.value as Turno })}>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
          </Select>
        </div>
        <div>
          <label htmlFor="valor" className={labelClass}>Valor mensual ($) <span className="text-danger">*</span></label>
          <Input id="valor" type="number" min="1" placeholder="Ej: 25000" value={formData.valor}
            onChange={(e) => { setFormData({ ...formData, valor: e.target.value }); handleClearError('valor'); }}
            error={!!errors.valor} />
          {errors.valor && <p className="mt-1 text-sm font-medium text-danger">{errors.valor}</p>}
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
        <Button type="button" variant="outline" onClick={closeModal} className="w-full sm:w-auto">Cancelar</Button>
        <Button type="submit" disabled={!isFormValid} className="w-full sm:w-auto">
          {isEditing ? 'Guardar cambios' : 'Guardar alumno'}
        </Button>
      </div>
    </form>
  );
}
