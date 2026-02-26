import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSchoolStore } from '../../store/useSchoolStore';
import { useModalStore } from '../../store/useModalStore';

export default function SchoolForm() {
  const addSchool = useSchoolStore((state) => state.addSchool);
  const closeModal = useModalStore((state) => state.closeModal);

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    estado: 'Activa' as 'Activa' | 'Inactiva',
  });

  const [errors, setErrors] = useState<{ nombre?: string; direccion?: string }>({});

  const isFormValid = formData.nombre.trim() !== '' && formData.direccion.trim() !== '';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Soft validation (redundant check if button was somehow enabled)
    const newErrors: typeof errors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es obligatoria';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addSchool({
      nombre: formData.nombre.trim(),
      direccion: formData.direccion.trim(),
      telefono: formData.telefono.trim() || undefined,
      email: formData.email.trim() || undefined,
      estado: formData.estado,
    });

    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la Institución <span className="text-danger">*</span>
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
        {errors.nombre && <p className="mt-1 text-sm text-danger">{errors.nombre}</p>}
      </div>

      <div>
        <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
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
        {errors.direccion && <p className="mt-1 text-sm text-danger">{errors.direccion}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <Input
            id="telefono"
            placeholder="Ej: 4455-6677"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Ej: contacto@sanjose.edu.ar"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
          Estado
        </label>
        <select
          id="estado"
          title="Estado"
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={formData.estado}
          onChange={(e) => setFormData({ ...formData, estado: e.target.value as 'Activa' | 'Inactiva' })}
        >
          <option value="Activa">Activa</option>
          <option value="Inactiva">Inactiva</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
        <Button type="button" variant="outline" onClick={closeModal}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!isFormValid}>
          Guardar Escuela
        </Button>
      </div>
    </form>
  );
}
