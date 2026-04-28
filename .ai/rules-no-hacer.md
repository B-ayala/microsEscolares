# Reglas globales — NO HACER

Reglas obligatorias para cualquier código generado o modificado en MicrosMiguel. Su incumplimiento introduce regresiones de UX, performance, accesibilidad o consistencia con el resto del proyecto.

---

## ❌ Arquitectura y patrones

- **NO** crear rutas dedicadas para formularios (`/students/new`, `/schools/:id/edit`). Los forms van **siempre en modal** vía `useModalStore.openModal(titulo, <Form />)`.
- **NO** agregar libs de UI externas (MUI, shadcn-cli, Chakra, Radix puro). Los primitivos están en `src/components/ui/`.
- **NO** duplicar lógica de pagos, recargos o mora. Toda esa lógica vive en `src/utils/payments.ts`.
- **NO** crear stores nuevos para UI efímera. Hay un único store de UI: `useModalStore`. Usá `useState` local para el resto.
- **NO** mutar arrays del store desde el componente. Toda mutación va por una acción del store.
- **NO** agregar persistencia (localStorage, IndexedDB, backend) sin que el usuario lo pida explícitamente. El proyecto es in-memory.
- **NO** introducir un router distinto. Es `HashRouter` (decisión vigente del proyecto, heredada de GH Pages; en Vercel sería técnicamente posible BrowserRouter pero el cambio requiere acuerdo explícito).

---

## ❌ Estilos

- **NO** usar CSS Modules, styled-components, Emotion ni `@emotion/styled`.
- **NO** escribir CSS plano si el caso se resuelve con utilities de Tailwind o un componente de `ui/`.
- **NO** hardcodear colores hex (`text-[#7c3aed]`). Usar tokens del tema (`text-primary`).
- **NO** usar `clsx()` o `twMerge()` sueltos. Siempre el helper `cn()` de `components/ui/Button.tsx`.
- **NO** mezclar inline `style={{...}}` con clases salvo valores dinámicos calculados (ej: props de Recharts).
- **NO** introducir overrides globales nuevos en `index.css` si la solución se puede resolver con utilities locales.

---

## ❌ Accesibilidad (CRÍTICO — usuario ~70 años)

- **NO** usar `text-xs` para contenido leíble por el usuario. Mínimo `text-sm` (14 px), preferido `text-base` (16 px).
- **NO** crear botones / links / chips con menos de **44×44 px** de área táctil.
- **NO** usar `text-gray-400` ni `text-gray-500` para info relevante sobre fondos claros (contraste insuficiente).
- **NO** usar opacidades < 80% para texto sobre fondos oscuros (sidebar). Nada de `text-violet-200/70`.
- **NO** dejar `outline: none` sin un foco visible alternativo (usar `focus-visible:ring-4`).
- **NO** crear `<button>` solo con icono sin `aria-label`.
- **NO** omitir `<label htmlFor>` en inputs de formulario.
- **NO** dejar acciones destructivas (`delete*`) ejecutándose con un click directo. Usar SIEMPRE `openConfirmDelete` de `src/components/modal/confirm.tsx`.
- **NO** dejar tablas en mobile sin alternativa de vista (card por fila bajo `md:hidden`, tabla bajo `hidden md:block`). El scroll horizontal es inaceptable.
- **NO** usar `<select>` nativo crudo. Usar el primitivo `<Select>` de `src/components/ui/Select.tsx` (mismo tamaño y tipografía que `Input`).
- **NO** convertir `<div>` en interactivo sin `role="button"`, `tabIndex={0}` y `onKeyDown` con `Enter`.
- **NO** usar elementos sin semántica correcta para tablas (`<div>` en lugar de `<table>`).
- **NO** ocultar contenido importante a lectores de pantalla.

---

## ❌ Performance

- **NO** destructurar el store entero (`const { ... } = useStore()`). Selector específico siempre.
- **NO** ejecutar filtros/sorts costosos en el render sin `useMemo`.
- **NO** importar librerías completas si solo usás una función (ej: `import _ from 'lodash'`).
- **NO** lazy-load del LCP (KPI cards del dashboard, primera tabla visible).
- **NO** animar propiedades que afectan layout (`top`, `left`, `width`, `height`). Usar `transform` y `opacity`.
- **NO** romper `<ResponsiveContainer>` de Recharts con tamaños fijos en px.

---

## ❌ Layout (CLS)

- **NO** renderizar `<img>` sin `width` y `height` explícitos.
- **NO** insertar contenido above-the-fold después del primer render que cause shift.
- **NO** cargar fuentes sin `font-display: swap` o equivalente.

---

## ❌ TypeScript

- **NO** usar `any`. Si TS no infiere, escribí el tipo o usá `unknown` + narrowing.
- **NO** duplicar tipos del dominio. Toda interfaz va en `src/types/index.ts`.
- **NO** usar `enum`. Literal unions: `type Turno = 'Mañana' | 'Tarde'`.

---

## ❌ Scope y alcance

- **NO** agregar features que el usuario no pidió.
- **NO** refactorizar archivos no relacionados con el cambio.
- **NO** "limpiar" código de paso (formateo, renombres). Eso es otro PR.
- **NO** crear documentación markdown salvo pedido explícito.
- **NO** agregar comentarios que expliquen QUÉ hace el código. Solo PORQUÉ no obvio.
- **NO** dejar `console.log`, `TODO` sin contexto, ni código comentado.

---

## ❌ Modales

- **NO** abrir un modal sobre otro (no hay pila de modales). Cerrar el primero antes.
- **NO** usar el modal global para tooltips, popovers, dropdowns o snackbars.
- **NO** olvidar cerrar el modal (`closeModal()`) al éxito del form.

---

## ❌ Routing

- **NO** usar `BrowserRouter` sin pedido explícito. Es `HashRouter` (ver Arquitectura).
- **NO** crear links sin `<NavLink>` o `<Link>` (sin `<a href>` para navegación interna).
- **NO** dejar query params huérfanos. Si los leés y aplicás un filtro, limpialos con `setSearchParams({}, { replace: true })`.

---

## ❌ Datos / Stores

- **NO** generar IDs con `Math.random()`, `Date.now()` ni `crypto.randomUUID()`. Es `Math.max(...ids, 0) + 1`.
- **NO** asumir que un store está poblado. Defendé contra arrays vacíos.
- **NO** romper el contrato de borrado en cascada (ej: `deleteEmployee` debe borrar también sus payments).

---

## 🎯 Objetivos no negociables

Todo código generado debe:

- ✅ Mantener consistencia visual con el resto del proyecto (Tailwind + tokens + componentes UI).
- ✅ Seguir el patrón de modales para forms y confirmaciones.
- ✅ Centralizar lógica de dominio en `utils/`.
- ✅ Validar en los límites (forms, query params).
- ✅ Cumplir WCAG AA mínimo.
- ✅ Funcionar igual en desktop y mobile (breakpoint `md`).
- ✅ Ser la **mínima solución que resuelve el problema**.

Si una propuesta rompe alguna de estas reglas, debe ser rechazada o reformulada.
