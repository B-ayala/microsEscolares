# Arquitectura — MicrosMiguel

> Snapshot técnico del proyecto. Mantener actualizado cuando cambie la estructura, el stack o los patrones core.

---

## Tipo de proyecto

- **SPA frontend-only**, sin backend ni autenticación.
- Datos en memoria (Zustand) con seeds que se cargan en cada refresh.
- Distribución estática vía Vercel (preset Vite).

---

## Diagrama de capas

```
┌──────────────────────────────────────────────────────────────┐
│                       Browser (SPA)                           │
│                                                               │
│  HashRouter ──► Layout (Sidebar + Outlet + Modal + Chatbot)   │
│      │                                                        │
│      └──► Pages (Dashboard, Schools, Students, Payments,      │
│                  Buses, Expenses, EmployeePayments)           │
│                       │                                       │
│                       ├──► UI primitives (components/ui)      │
│                       ├──► Forms en modales (components/forms)│
│                       ├──► Stores Zustand (store/)            │
│                       └──► Utils dominio (utils/payments,     │
│                                            utils/analytics)   │
└──────────────────────────────────────────────────────────────┘
```

---

## Stack runtime

- **React 19** (`StrictMode` activo).
- **TypeScript ~5.9** con `tsc -b` antes del build.
- **Vite 7** (`base: '/'`).
- **Tailwind CSS v4** vía `@tailwindcss/vite`.
- **Zustand 5** sin middleware de persistencia.
- **react-router-dom 7** con `HashRouter`.
- **Recharts 3** + `<ResponsiveContainer>`.
- **lucide-react** para todos los iconos.
- **clsx + tailwind-merge** combinados en helper `cn()`.

---

## Convenciones de código

| Tema                   | Regla                                                                |
|------------------------|----------------------------------------------------------------------|
| Tipos del dominio      | Una sola fuente: `src/types/index.ts`                                |
| Stores                 | Uno por dominio, en `src/store/use<Dominio>Store.ts`                 |
| IDs                    | `Math.max(...ids, 0) + 1` (no UUID, no timestamp)                    |
| Selectores Zustand     | Específicos por propiedad. Nunca destructurar el store entero        |
| Forms                  | Siempre en modal vía `useModalStore.openModal(titulo, <Form />)`     |
| Confirmaciones         | Modal con dos botones: Cancelar (outline) / Acción (rojo)            |
| Estilos                | Tailwind utilities → tokens `@theme` → `cn()` → CSS plano (último)   |
| Idioma de la UI        | Español (es-AR)                                                      |
| Moneda                 | ARS, formateada con `formatCurrency()`                               |
| Fechas internas        | `YYYY-MM-DD`                                                         |
| Fechas mostradas       | `DD/MM/YYYY` vía `formatDate()`                                      |

---

## Capas y responsabilidades

### `src/types/index.ts`
Único contenedor de tipos del dominio. Cualquier nueva entidad se declara acá.

Tipos clave: `School`, `Student`, `PaymentRecord`, `Bus`, `Expense`, `Employee`, `EmployeePayment`. Tipos auxiliares: `Turno`, `Nivel`, `EstadoPago`, `FilterEstado`, `TipoPago`, `EstadoEscuela`, `TipoGasto`, `RolEmpleado`, `SortField`, `SortDirection`.

### `src/utils/`
- **`payments.ts`**: cálculo de vencimiento (día 10), recargo (0/10/20%), mora, formateadores (`formatCurrency`, `formatDate`, `mesActualKey`, `mesActualLabel`, `nombreMes`, `recargoLabel`, `colorEstadoPago`).
- **`analytics.ts`**: `generateInsights(schools, students)` para el Dashboard.

**Toda lógica de negocio nueva relacionada con pagos / mora va acá**, nunca duplicada en componentes.

### `src/store/`
Un store por dominio. Cada uno expone: array de datos, acciones CRUD, acciones de dominio adicionales (`marcarPagado`, `desmarcarPago`, `actualizarEstadosPago`, `registrarPago`, `revertirPago`, etc.).

`useModalStore` es el único store de UI: maneja `isOpen`, `title`, `content (ReactNode)`, con `openModal()` y `closeModal()`.

### `src/components/ui/`
Primitivos reutilizables. **No** dependen del dominio.

- `Button` — variantes: primary, secondary, outline, ghost, danger; sizes: sm (40 px), md (44 px), lg (52 px).
- `Input` — prop `error` cambia bordes a danger. Alto 48 px, `text-base`.
- `Select` — wrapper de `<select>` nativo con chevron custom. Mismo alto/tipografía que `Input`. Usar SIEMPRE en lugar de `<select>` crudo.
- `Badge` — status semántico (en_espera, pagado, impago, active, inactive, paid, pending, overdue).
- `Card` + `CardHeader` + `CardTitle` (text-xl) + `CardContent`.
- `Table` + `TableHeader` + `TableBody` + `TableRow` + `TableHead` (uppercase, semibold) + `TableCell`.

### `src/components/forms/`
Forms reutilizables en >1 página: `StudentForm.tsx`, `SchoolForm.tsx`. Forms que solo se usan en una página viven inline (`BusForm`, `ExpenseForm`, `EmployeeForm`).

### `src/components/Layout/`
- `Layout.tsx` — shell con sidebar, drawer mobile, `<Outlet/>`, `<GlobalModal/>`, `<ChatbotWidget/>`.
- `Sidebar.tsx` — navegación con array `navigation`.
- `ChatbotWidget.tsx` — FAB + tooltip + ventana de chat con respuestas mock.

### `src/components/modal/GlobalModal.tsx`
Render del modal global controlado por `useModalStore`. Backdrop con blur. Panel mobile-first:
- Mobile: bottom-sheet (`items-end`, ancho completo, `rounded-t-2xl`, slide-in desde abajo).
- Desktop (`sm`+): card centrado (`max-w-lg`, `rounded-xl`, fade+scale).
- Altura tope `max-h-[92dvh] sm:max-h-[calc(100vh-4rem)]` con scroll interno (`overflow-y-auto overscroll-contain` + `min-h-0`) para que forms largos no corten los botones de acción.
- Header sticky (`shrink-0`) con título + botón X 44×44.
- Animaciones definidas en `index.css` (`modal-panel-enter`), respetan `prefers-reduced-motion`.

### `src/components/modal/confirm.tsx`
Helper `openConfirmDelete({ title, message, warning?, confirmLabel?, onConfirm })` — único punto de entrada para cualquier confirmación destructiva. Maneja icono de alerta, mensaje "no se puede deshacer", y botones (Cancelar outline / Confirmar danger) con stack mobile-first. **Cualquier acción `delete*` debe pasar por acá.**

### `src/pages/`
Una carpeta por sección. Cada página de listado sigue el patrón:
1. Header (título + acción primaria).
2. KPI cards en grid responsive.
3. (Opcional) banner de alerta contextual.
4. Tabla con filtros en barra superior.

---

## Routing

```
HashRouter
├── /                   → Navigate to /dashboard
├── /dashboard          → Dashboard (KPIs + alertas + gráficos + insights)
├── /schools            → Schools (lista | detalle según selectedSchoolId)
├── /students           → Students (acepta ?filterPago=impago | vencido_con_mora)
├── /payments           → Payments
├── /buses              → Buses
├── /expenses           → Expenses
└── /employee-payments  → EmployeePayments
```

**No** hay rutas para forms o detalles que no sean Schools (que tiene vista lista/detalle en el mismo componente).

---

## Reglas de negocio centrales

| Concepto              | Regla                                                                        |
|-----------------------|------------------------------------------------------------------------------|
| Vencimiento           | Día 10 de cada mes                                                           |
| Recargo día 1–10      | 0%                                                                           |
| Recargo día 11–20     | +10%                                                                         |
| Recargo día 21+       | +20%                                                                         |
| Estado automático     | día ≤10 → `en_espera` · día >10 → `impago`                                   |
| Mora                  | `dia - 10` cuando `dia > 10`, sino 0                                         |
| DNI alumno            | Único — `addStudent` valida y devuelve `{ success, error? }`                 |
| Borrado en cascada    | `deleteEmployee` borra también sus payments                                  |

---

## Deploy

- **Vercel** con preset Vite. Build command `npm run build`, output `dist`, install `npm install`.
- `vercel.json` define un rewrite `/:path*` → `/index.html` (defensivo: el routing real es client-side con `HashRouter`, pero el rewrite cubre cualquier path pegado directo).
- Base path: `/` (configurado en `vite.config.ts`).
- Auto-deploy: cada push a `main` dispara un Production Deployment; las demás ramas / PRs generan Preview Deployments.
- Sin variables de entorno (proyecto in-memory, sin secrets).

---

## Cosas que NO hay (intencionalmente)

- Backend / API.
- Base de datos / persistencia.
- Autenticación / autorización.
- Tests automatizados.
- Code splitting por ruta (proyecto chico).
- i18n (idioma único: es-AR).
- Theming dinámico (un solo tema fijo).
- PWA / offline.

Si alguna de estas se vuelve necesaria, agregar en una iteración explícita y documentar acá.
