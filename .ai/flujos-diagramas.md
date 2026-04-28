# Flujos del sistema — MicrosMiguel

Documento funcional. Describe qué cubre el sistema, cómo se comporta en cada escenario y qué casos contempla. No documenta implementación.

MicrosMiguel es una herramienta interna de gestión para una empresa de **transporte escolar**. No tiene autenticación ni backend: toda la información se administra desde la SPA, en memoria, con datos seed cargados al inicio.

---

## 1. NAVEGACIÓN GENERAL

La aplicación se organiza en seis secciones principales accesibles desde la barra lateral:

1. **Dashboard** — vista general con KPIs financieros, alertas y gráficos.
2. **Escuelas** — alta y administración de instituciones.
3. **Alumnos** — listado completo con filtros y control de pagos individual.
4. **Pagos** — tablero focalizado en cobranzas del mes actual.
5. **Colectivos** — flota de unidades, conductores, celadores y rutas.
6. **Control de Gastos** — egresos del negocio (combustible, salarios, etc.).
7. **Pagos Empleados** — nómina de conductores y celadores.

En desktop la barra lateral está siempre visible. En mobile aparece como drawer accesible desde un botón hamburguesa en el header.

Un asistente flotante (chatbot mock) está disponible en todas las pantallas; aún no procesa consultas reales.

---

## 2. GESTIÓN DE ESCUELAS

La sección presenta la lista de instituciones con KPIs (total alumnos activos, monto facturado estimado mensual). Cada fila resume contacto, nivel, cantidad de alumnos, pagados, impagos y facturación.

### Casos contemplados

- **Alta** mediante modal con campos: nombre, dirección, teléfono opcional, email opcional, nivel (Jardín/Primaria/Secundaria/Escuela Unificada), estado (Activa/Inactiva).
- **Edición** desde la fila correspondiente, abriendo el mismo modal precargado.
- **Eliminación** con confirmación. Si la escuela tiene alumnos activos asociados, se informa la cantidad antes de proceder.
- **Búsqueda** por nombre o dirección.
- **Vista detalle**: al hacer click sobre la fila, se entra a una vista por escuela con KPIs propios (alumnos / pagados / en espera / impagos), filtros (turno, nivel, estado de pago) y la lista de sus alumnos con acciones de cobro inline.

---

## 3. GESTIÓN DE ALUMNOS

Listado completo de alumnos activos con filtros avanzados, KPIs por estado y control individual de pagos.

### Funcionalidades cubiertas

1. KPIs en tiempo real: activos, pagados, en espera, impagos, vencidos con mora.
2. Filtros: búsqueda por nombre o DNI, escuela, turno, nivel, estado de pago, toggle "ver solo impagos".
3. Ordenamiento por apellido, escuela, estado de pago o días de mora.
4. Acciones por fila: marcar como pagado (Efectivo / Mercado Pago), revertir un pago, editar, eliminar.
5. Alta y edición vía modal con validación de campos obligatorios y unicidad de DNI.

### Casos contemplados

- **Banner contextual** cuando se llega desde una alerta del Dashboard (`?filterPago=impago` o `?filterPago=vencido_con_mora`). Indica el filtro aplicado y permite removerlo. El query param se limpia del URL una vez interpretado.
- **DNI duplicado**: el alta se rechaza con mensaje de error visible en el formulario.
- **Revertir un pago**: vuelve al alumno al estado correcto según el día actual del mes (en espera si ≤10, impago si >10) y limpia fecha y tipo de pago.
- **Filas en mora**: se resaltan visualmente con fondo rojo claro.
- **Cambio de escuela en el form**: autocompleta el nivel desde la escuela elegida.

---

## 4. CICLO DE COBRANZAS Y RECARGOS

El cobro de cada alumno tiene una cadencia mensual. La fecha de vencimiento es siempre el **día 10** del mes en curso.

### Reglas de negocio

| Día del mes | Estado automático (si no pagó) | Recargo aplicado | Mora           |
|-------------|---------------------------------|------------------|----------------|
| 1 al 10     | En espera                       | 0%               | 0 días         |
| 11 al 20    | Impago                          | +10%             | día − 10       |
| 21 en adel. | Impago                          | +20%             | día − 10       |

El monto final se calcula multiplicando el monto base por (1 + recargo) y redondeando.

### Casos contemplados

- Alta de alumno **antes del día 10**: estado inicial `en_espera`.
- Alta **después del día 10**: estado inicial `impago`.
- Pago con **Efectivo** o **Mercado Pago**: se registra fecha de pago = día actual y se guarda el método.
- **Reversión** de un pago: el sistema recalcula el estado según la regla de fechas.
- **Mes nuevo**: el sistema reevalúa estados (la acción `actualizarEstadosPago` cambia `en_espera → impago` para los activos cuando el día supera el 10).

---

## 5. CONTROL DE PAGOS

Pantalla focalizada en cobranzas del mes en curso. Muestra recaudación, pagos en espera, impagos y monto total pendiente con recargos aplicados.

### Casos contemplados

- **Banner de alerta** si hay impagos, indicando cantidad y monto pendiente acumulado.
- **Filtros**: por alumno o escuela (búsqueda), escuela específica, estado de pago.
- **Acciones inline** idénticas a Alumnos: marcar pagado (Efectivo / MP), revertir.
- **Header dinámico**: muestra etiqueta del mes actual y, si hay mora, los días acumulados y el porcentaje de recargo vigente.

---

## 6. DASHBOARD

Resumen ejecutivo con KPIs, alertas accionables, gráficos y comparativas.

### Casos contemplados

- **Cuatro KPIs principales**: alumnos activos, total recaudado del mes, total adeudado (con recargos), balance mensual (ingresos − gastos).
- **Alertas**:
  - **Naranja** cuando hay impagos pero todavía no hay días de mora (caso teórico transición de mes). Click navega a Alumnos filtrados por impagos.
  - **Roja** cuando hay impagos con mora activa. Click navega a Alumnos filtrados por "vencido con mora".
- **Gráfico Ingresos vs Adeudado** (línea, 3 meses).
- **Gráfico Alumnos por Escuela** (barra horizontal, omite escuelas vacías).
- **Recomendaciones inteligentes** (componente `SmartRecommendations`): genera insights automáticos a partir de los datos cargados (ver §7).

---

## 7. RECOMENDACIONES INTELIGENTES

El sistema analiza el estado actual de escuelas y alumnos para detectar situaciones que requieren atención y las muestra como tarjetas priorizadas (info / warning / critical).

### Casos contemplados

- **Baja matrícula**: escuelas con menos del 40% del promedio de alumnos por escuela.
- **Alto nivel de morosidad por escuela**: 30% o más de alumnos no pagados (warning) o más del 50% (critical).
- **Cobros críticos vencidos**: cantidad total de impagos y monto adeudado con recargo (critical).
- **Pagos en espera**: si hay más de tres alumnos en período de gracia (informativo).
- **Mayor recaudación estimada**: escuela con más facturación esperada del mes (informativo).
- **Estado vacío**: si no hay insights, se muestra mensaje positivo "Todo funciona correctamente este mes".

---

## 8. GESTIÓN DE COLECTIVOS

Administración de la flota: unidades, conductores, celadores, turnos y escuelas asignadas.

### Funcionalidades cubiertas

1. Listado con KPIs (colectivos activos, capacidad total, alumnos a transportar).
2. Búsqueda por patente o conductor.
3. Alta de colectivo en modal con asignación de escuelas mediante chips toggleables.
4. Eliminación directa desde la fila.

### Casos contemplados

- **Cálculo automático de ocupación**: alumnos activos cuyas escuelas estén en `escuelasAsignadas` y compartan turno con la unidad. Se muestra como porcentaje con código de color (>90% rojo, >70% amarillo).
- **Estados de unidad**: Activo, Inactivo, En mantenimiento. Las inactivas/mantenimiento se ven con opacidad reducida.
- **Sin patente o conductor**: el form no permite enviar.

---

## 9. CONTROL DE GASTOS

Registro de egresos del negocio: salarios, combustible, mantenimiento, seguros, otros.

### Funcionalidades cubiertas

1. KPIs: ingresos recaudados, egresos del mes, balance mensual, ingresos esperados.
2. Gráfico comparativo mensual (barras): ingresos vs egresos.
3. Filtros: búsqueda libre, tipo de gasto.
4. Alta de gasto en modal con descripción, tipo y monto. La fecha y el mes se asignan automáticamente al día actual.
5. Eliminación directa desde la fila.

### Casos contemplados

- El balance se muestra en verde si es positivo, rojo si es negativo.
- Los gastos sin coincidencias por filtros muestran estado vacío explícito.
- Footer de tabla suma el total filtrado.

---

## 10. PAGOS DE EMPLEADOS

Nómina mensual de conductores y celadores con registro de pagos por mes.

### Funcionalidades cubiertas

1. KPIs: cantidad de empleados (split por rol), nómina total mensual, pagados (monto/cantidad), pendientes (monto/cantidad).
2. Filtros: búsqueda, rol (Conductor/Celador), estado del pago (pagado/pendiente).
3. Alta de empleado en modal con nombre, apellido, rol y salario.
4. Acción "Pagar" por fila: registra el pago del mes en curso.
5. Acción "Revertir": deshace el pago manteniendo el registro histórico marcado como pendiente.

### Casos contemplados

- Si el empleado todavía no tiene un registro de pago para el mes actual, "Pagar" lo crea.
- Si ya existe el registro pero está pendiente, "Pagar" lo actualiza.
- Eliminar un empleado borra también todos sus registros de pago asociados.
- Filas con pago pendiente se resaltan con fondo amarillo claro.

---

## 11. ASISTENTE VIRTUAL (CHATBOT MOCK)

Widget flotante presente en toda la aplicación. Aún no integra IA ni backend.

### Casos contemplados

- Aparece como FAB violeta en la esquina inferior derecha.
- A los 3 segundos sin interacción muestra un tooltip "Pss... ¿Necesitás ayuda?".
- Al abrir, muestra una conversación con mensaje inicial de bienvenida.
- Cualquier mensaje del usuario recibe una respuesta canned simulando que el bot todavía no procesa solicitudes reales.
- El estado del chat es local al componente y se reinicia al recargar.

---

## 12. CASOS GLOBALES Y CONSISTENCIA

- **Sin persistencia**: al recargar el navegador, todos los datos vuelven a los seeds iniciales. Es esperado en esta etapa.
- **Sin auth**: cualquier usuario que abra la URL accede al sistema completo.
- **Modales como única vía** para crear, editar o confirmar borrado. Nunca hay rutas dedicadas para esos flujos.
- **Confirmaciones destructivas** siempre con dos botones (Cancelar / Acción en rojo) y mensaje claro del impacto.
- **Mensajes de error** son comprensibles, sin tecnicismos innecesarios. Ejemplo: "Ya existe un alumno registrado con ese DNI."
- **Mobile-first**: todos los listados y formularios funcionan en pantallas chicas. Tablas con scroll horizontal cuando hace falta.

---

## 13. RESUMEN DE COBERTURA

### Operativa diaria

1. Alta y edición de escuelas.
2. Alta, edición y baja de alumnos con validación de DNI.
3. Registro y reversión de pagos individuales.
4. Cálculo automático de recargos y mora según el día del mes.
5. Vista financiera del mes (recaudado, adeudado, balance).
6. Gestión de flota con asignación de escuelas y turnos.
7. Control de egresos y comparativa ingresos/egresos.
8. Nómina mensual con seguimiento de pagos por empleado.

### Análisis y alertas

1. KPIs por sección, recalculados en tiempo real.
2. Alertas en Dashboard que llevan a vistas filtradas con un click.
3. Recomendaciones automáticas según estado de morosidad y matrícula.
4. Gráficos de ingresos vs egresos y distribución por escuela.

### UX consistente

1. Patrón de modal único para forms y confirmaciones.
2. Estilos centralizados en Tailwind + tokens del tema + componentes UI propios.
3. Navegación consistente entre desktop (sidebar) y mobile (drawer).
4. Filtros y búsquedas con feedback inmediato.
