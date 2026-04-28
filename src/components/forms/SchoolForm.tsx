import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useModalStore } from '../../store/useModalStore';
import type { Nivel, School } from '../../types';

interface SchoolFormProps {
  school?: School;
}

export default function SchoolForm({ school }: SchoolFormProps) {
  const addSchool = useSchoolStore((state) => state.addSchool);
  const editSchool = useSchoolStore((state) => state.editSchool);
  const closeModal = useModalStore((state) => state.closeModal);

  const isEditing = !!school;

  const [formData, setFormData] = useState({
    nombre: school?.nombre ?? '',
    direccion: school?.direccion ?? '',
    telefono: school?.telefono ?? '',
    email: school?.email ?? '',
    nivel: (school?.nivel ?? 'Primaria') as Nivel,
    estado: (school?.estado ?? 'Activa') as 'Activa' | 'Inactiva',
  });

  const [errors, setErrors] = useState<{ nombre?: string; direccion?: string }>({});

  const isFormValid = formData.nombre.trim() !== '' && formData.direccion.trim() !== '';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es obligatoria';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditing) {
      editSchool(school!.id, {
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim(),
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim() || undefined,
        nivel: formData.nivel,
        estado: formData.estado,
      });
    } else {
      addSchool({
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim(),
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim() || undefined,
        nivel: formData.nivel,
        estado: formData.estado,
      });
    }

    closeModal();
  };

  const labelClass = 'block text-base font-semibold text-gray-800 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="nombre" className={labelClass}>
          Nombre de la institución <span className="text-danger">*</span>
        </label>
        <Input
          id="nombre"
          placeholder="Ej: Colegio San José"
          value={formData.nombre}
          onChange={(e) => {
            setFormData({ ...formData, nombre: e.target.value });
            if (errors.nombre) setErrors({ ...errors, nombre: undefined });
          }}
          error={!!errors.nombre}
        />
        {errors.nombre && <p className="mt-1 text-sm font-medium text-danger">{errors.nombre}</p>}
      </div>

      <div>
        <label htmlFor="direccion" className={labelClass}>
          Dirección <span className="text-danger">*</span>
        </label>
        <Input
          id="direccion"
          placeholder="Ej: Av. Mitre 1234"
          value={formData.direccion}
          onChange={(e) => {
            setFormData({ ...formData, direccion: e.target.value });
            if (errors.direccion) setErrors({ ...errors, direccion: undefined });
          }}
          error={!!errors.direccion}
        />
        {errors.direccion && <p className="mt-1 text-sm font-medium text-danger">{errors.direccion}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="telefono" className={labelClass}>Teléfono</label>
          <Input
            id="telefono"
            placeholder="Ej: 4455-6677"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <Input
            id="email"
            type="email"
            placeholder="Ej: contacto@sanjose.edu.ar"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <label htmlFor="estado" className={labelClass}>Estado</label>
          <Select id="estado" value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'Activa' | 'Inactiva' })}>
            <option value="Activa">Activa</option>
            <option value="Inactiva">Inactiva</option>
          </Select>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
        <Button type="button" variant="outline" onClick={closeModal} className="w-full sm:w-auto">
          Cancelar
        </Button>
        <Button type="submit" disabled={!isFormValid} className="w-full sm:w-auto">
          {isEditing ? 'Guardar cambios' : 'Guardar escuela'}
        </Button>
      </div>
    </form>
  );
}
