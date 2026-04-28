# Skill: React + TypeScript — MicrosMiguel (Frontend SPA)

> Skill principal del agente. Define stack, estructura, convenciones y patrones para trabajar sobre MicrosMiguel.

---

## 1. Stack

| Capa            | Herramienta                            | Versión / Notas                           |
|-----------------|----------------------------------------|-------------------------------------------|
| Build           | Vite + `@vitejs/plugin-react`          | 7.x · `base: '/microsEscolares/'`         |
| Lenguaje        | TypeScript estricto                    | ~5.9                                      |
| UI              | React                                  | 19.x · `StrictMode`                       |
| Estilos         | Tailwind CSS v4 (`@tailwindcss/vite`)  | tokens en `@theme` dentro de `index.css`  |
| Estado global   | Zustand                                | 5.x · un store por dominio                |
| Routing         | react-router-dom                       | 7.x con **`HashRouter`** (GH Pages)       |
| Gráficos        | Recharts                               | 3.x                                       |
| Iconos          | lucide-react                           | última                                    |
| Utilidades      | clsx + tailwind-merge                  | combinadas en `cn()`                      |
| Deploy          | gh-pages                               | branch `gh-pages` · fallback 404.html     |

**Sin** backend, **sin** auth, **sin** persistencia. Todo en memoria (Zustand recarga seeds en cada refresh).

---

## 2. Estructura de carpetas

```
src/
├── App.tsx, main.tsx
├── index.css                # @import tailwind + @theme + utilities
├── routes/AppRouter.tsx     # HashRouter + Layout + Routes
├── types/index.ts           # única fuente de verdad de tipos del dominio
├── utils/
│   ├── payments.ts          # fechas, recargos, mora, formatos
│   └── analytics.ts         # generador de Insights del dashboard
├── store/                   # un Zustand store por dominio
│   ├── useSchoolStore.ts
│   ├── useStudentStore.ts
│   ├── useBusStore.ts
│   ├── useExpenseStore.ts
│   ├── useEmployeePaymentStore.ts
│   └── useModalStore.ts     # único store de UI (modal global)
├── components/
│   ├── Layout/              # Layout.tsx, Sidebar.tsx, ChatbotWidget.tsx
│   ├── modal/GlobalModal.tsx
│   ├── ui/                  # primitivos: Button, Input, Badge, Card, Table
│   └── forms/               # forms reutilizables (Student, School)
└── pages/
    ├── Dashboard/           # con subcarpeta components/ para SmartRecommendations
    ├── Schools/             # vista lista + vista detalle en el mismo archivo
    ├── Students/
    ├── Payments/
    ├── Buses/               # incluye BusForm inline
    ├── Expenses/            # incluye ExpenseForm inline
    └── EmployeePayments/    # incluye EmployeeForm inline
```

**Regla:** un form que se reusa en >1 página vive en `components/forms/`. Si solo se usa en una, vive inline en esa página.

---

## 3. Routing

```ts
// src/routes/AppRouter.tsx
<HashRouter>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="schools" element={<Schools />} />
      <Route path="students" element={<Students />} />     {/* acepta ?filterPago=... */}
      <Route path="payments" element={<Payments />} />
      <Route path="buses" element={<Buses />} />
      <Route path="expenses" element={<Expenses />} />
      <Route path="employee-payments" element={<EmployeePayments />} />
    </Route>
  </Routes>
</HashRouter>
```

- **`HashRouter` es obligatorio** (GH Pages no tiene rewrite server-side).
- **No hay rutas para forms** (`/students/new`, `/students/:id/edit` están prohibidos). Forms van en modal.
- Comunicación cross-página vía **query params** (`?filterPago=impago`). El consumidor lee con `useSearchParams`, aplica el filtro y limpia el URL con `setSearchParams({}, { replace: true })`.

---

## 4. Convenciones de estilos (orden estricto de prioridad)

### 4.1 Utilities de Tailwind (primera opción, siempre)
```tsx
<div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
```

### 4.2 Tokens del tema antes que valores hardcodeados
- ✅ `text-primary`, `bg-danger`, `text-success`, `shadow-soft`
- ❌ `text-[#7c3aed]`, `bg-[#dc2626]`

Tokens definidos en [src/index.css](src/index.css):
```css
@theme {
  --color-primary: #7c3aed;
  --color-primary-hover: #8b5cf6;
  --color-success: #16a34a;
  --color-warning: #eab308;
  --color-danger: #dc2626;
  --font-sans: 'Inter', system-ui, sans-serif;
  --radius-sm: 8px;
  --radius-md: 12px;
}
```

### 4.3 Componentes propios de `src/components/ui` antes que reinventar
- `<Button variant="primary|secondary|outline|ghost|danger" size="sm|md|lg">` — `md` = 44 px alto + `text-base` (default), `lg` = 52 px + `text-lg` para CTAs primarios.
- `<Input error={boolean}>` — alto 48 px, `text-base`. Para iconos dentro, usar `pl-12` y posicionar el icono con `left-4`.
- `<Select error={boolean}>` — wrapper alrededor de `<select>` nativo con chevron custom (`ChevronDown` lucide), mismo alto y tipografía que `Input`. Usarlo SIEMPRE en lugar de `<select>` crudo.
- `<Badge status="en_espera|pagado|impago|active|inactive">` — `text-sm`, padding generoso.
- `<Card>`, `<CardHeader>`, `<CardTitle>` (text-xl), `<CardContent>`.
- `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>` (uppercase, text-sm semibold), `<TableCell>` (text-base).
- `<PageLoader>` — loader centrado con icono de micro animado y texto "Cargando...". **No se usa por página**: lo dispara `Layout.tsx` ante un cambio de `location.pathname` y lo renderiza en lugar del `<Outlet />` durante ~450 ms. Patrón en §16.

### 4.4 Helper `cn()` para clases condicionales
```ts
import { cn } from '../components/ui/Button';

className={cn(
  'flex items-center px-4 py-2',
  isActive && 'bg-primary text-white',
  className,
)}
```
**Nunca** uses `clsx()` o `twMerge()` sueltos. Siempre `cn()`.

### 4.5 CSS plano (último recurso)
Solo si Tailwind + componentes UI **no alcanzan**. Reglas:
- Archivo `Componente.css` colindante.
- Clases en **kebab-case con prefijo** del componente (`student-row-overdue`, no `.row.overdue`).
- Mobile-first: `@media (min-width: 640px)` y `@media (min-width: 1024px)`.
- **Prohibido**: CSS Modules, styled-components, Emotion, inline `style={{...}}` (salvo valores dinámicos calculados, ej. props a Recharts).

---

## 5. Patrón de Modal (PRIORITARIO)

**Toda creación, edición y confirmación destructiva pasa por modal.** No se crean rutas dedicadas.

### 5.1 API del store
```ts
const openModal = useModalStore((s) => s.openModal);
const closeModal = useModalStore((s) => s.closeModal);

openModal('Nuevo Alumno', <StudentForm />);
openModal('Editar Alumno', <StudentForm student={student} />);
```

### 5.2 Confirmación de borrado (patrón canónico)

Usar **siempre** `openConfirmDelete` de `src/components/modal/confirm.tsx`. No replicar el JSX a mano:

```tsx
import { openConfirmDelete } from '../../components/modal/confirm';

openConfirmDelete({
  title: 'Eliminar Alumno',
  message: <>¿Querés eliminar al alumno <strong>{apellido}, {nombre}</strong>?</>,
  warning: alumnosCount > 0
    ? <>Esta escuela tiene <strong>{alumnosCount} alumno(s) activo(s)</strong>.</>
    : undefined,
  onConfirm: () => deleteStudent(id),
});
```

El helper se ocupa del icono de alerta, el mensaje "no se puede deshacer", el botón de cancelar (outline) y el de confirmar (variant `danger`), apilados verticalmente en mobile y horizontales en desktop. **Cualquier acción destructiva (`delete*`) debe pasar por este helper** — es violación de la regla disparar `delete*` directo desde la fila.

### 5.3 Forms en modal (estructura)
- Cada form recibe la entidad opcional como prop (`student?: Student` → modo edit si está presente).
- Inicializa `formData` con valores de la entidad o defaults.
- Botón submit: `disabled` si `!isFormValid` (validación client-side trivial).
- Errores por campo (`errors[field]`) + error global (`globalError`) para casos como DNI duplicado.
- Cierra con `closeModal()` al éxito.

---

## 6. Stores Zustand (un dominio = un store)

### Convención
```ts
interface FooState {
  foos: Foo[];
  addFoo: (data: Omit<Foo, 'id'>) => void;     // o devolver { success, error? }
  editFoo: (id: number, data: Partial<Omit<Foo, 'id'>>) => void;
  deleteFoo: (id: number) => void;
  // ...acciones de dominio adicionales
}

export const useFooStore = create<FooState>((set, get) => ({
  foos: initialSeed,
  addFoo: (data) => set((s) => ({
    foos: [...s.foos, { ...data, id: Math.max(...s.foos.map(f => f.id), 0) + 1 }],
  })),
  // ...
}));
```

### Reglas
- IDs autoincrementales con `Math.max(...ids, 0) + 1`.
- Validaciones de unicidad (DNI, etc.) **dentro del store** que devuelva `{ success, error? }`. La UI muestra el error.
- Borrado en cascada explícito (ej: `deleteEmployee` también borra sus `payments`).
- **No persistencia**. Si en el futuro se agrega, usar middleware `persist` solo en stores específicos.

### Selectores
Acceder con selector específico, no destructurar el store entero:
```ts
// ✅
const students = useStudentStore((s) => s.students);
const marcarPagado = useStudentStore((s) => s.marcarPagado);

// ❌ — re-render por cualquier cambio del store
const { students, marcarPagado } = useStudentStore();
```

---

## 7. Reglas de negocio (utils/payments.ts) — NUNCA duplicar

```ts
// Vencimiento: día 10 de cada mes
fechaVencimientoActual()                 // "YYYY-MM-10"
generarFechaVencimiento(year, month)     // string

// Estado automático
calcularEstadoPago(student, now?)        // 'en_espera' | 'pagado' | 'impago'

// Recargos por día del mes
calcularRecargo(now?)                    // 0 | 0.10 | 0.20
calcularMontoConRecargo(monto, now?)     // number redondeado
recargoLabel(now?)                       // 'Sin recargo' | '+10% recargo' | '+20% recargo'

// Mora
calcularDiasMora(now?)                   // 0 si día ≤ 10, sino dia - 10

// Formatos
formatCurrency(value)                    // "$25.000" (es-AR)
formatDate(yyyymmdd)                     // "DD/MM/YYYY"
mesActualKey()                           // "2026-04"
mesActualLabel()                         // "Abril 2026"
nombreMes(monthIndex)                    // "Abril"
colorEstadoPago(estado)                  // 'yellow' | 'green' | 'red'
```

| Día del mes | Estado (si no pagó) | Recargo | Mora       |
|-------------|---------------------|---------|------------|
| 1–10        | `en_espera`         | 0%      | 0 días     |
| 11–20       | `impago`            | +10%    | día − 10   |
| 21–fin      | `impago`            | +20%    | día − 10   |

---

## 8. Tablas + Filtros + KPIs (patrón canónico de página de listado)

Cada página de listado sigue **la misma estructura**:

```tsx
<div className="space-y-6">
  {/* 1. Header con título + acción primaria */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h1 className="hidden md:block text-3xl font-bold text-gray-900">Gestión de X</h1>
      <p className="text-gray-600 text-base mt-1">Subtítulo descriptivo.</p>
    </div>
    <Button size="lg" className="w-full sm:w-auto shrink-0" onClick={() => openModal('Nuevo X', <XForm />)}>
      <Plus className="w-5 h-5 mr-2" /> Nuevo X
    </Button>
  </div>

  {/* 2. KPI Cards (grid 2/4 cols responsive) */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2.5 bg-{color}-50 rounded-xl"><Icon className="w-6 h-6 text-{color}-700" /></div>
        <div>
          <p className="text-sm font-medium text-gray-600">Etiqueta</p>
          <p className="text-2xl font-bold text-gray-900">{valor}</p>
        </div>
      </CardContent>
    </Card>
  </div>

  {/* 3. Banner de alerta opcional */}

  {/* 4. Filtros + listado dual mobile/desktop */}
  <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-3">
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
        <Input placeholder="..." className="pl-12" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-N gap-3">
        <Select>...</Select>
      </div>
    </div>

    {/* Vista Mobile — tarjeta por fila */}
    <div className="md:hidden divide-y divide-gray-200">
      {items.map((item) => <div key={item.id} className="p-5">...</div>)}
    </div>

    {/* Vista Desktop — tabla */}
    <div className="hidden md:block">
      <Table>...</Table>
    </div>
  </div>
</div>
```

**Vista mobile (card por fila) — obligatoria:**
- Estructura típica: header (nombre + Badge de estado) → `<dl>` con campos clave → bloque destacado (monto/total) → acciones full-width o `grid grid-cols-2`.
- Acciones primarias (Pagar Efectivo / MP / Registrar pago) van con texto explícito + icono, NO solo icono.
- Editar/Eliminar van como `Button variant="outline" size="md"` apilados.
- Padding generoso: `p-5`.
- Estados críticos resaltan toda la card: `bg-red-50/50` (impago) o `bg-yellow-50/30` (pendiente).

**Vista desktop (tabla):**
- Mantener acciones compactas con `Button variant="outline|ghost" size="sm"` y label corto.
- Sort en columnas: ícono `ArrowUpDown`, click cambia campo, re-click invierte dirección.
- Filtros aplican con `useMemo` sobre el array del store.

**Header mobile:** la página oculta el `<h1>` con `hidden md:block` porque el `Layout.tsx` ya muestra el título de sección en el header mobile (mapa `SECTION_TITLES`).

---

## 9. Sidebar y navegación

- Fondo: `bg-[linear-gradient(90deg,rgb(0,0,0)_0%,rgb(90,85,214)_100%)]`.
- Items activos: `bg-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]`.
- Items inactivos: `text-violet-200/70 hover:bg-white/10 hover:text-white`.
- Mobile: drawer fijo con backdrop `bg-black/50`, header con hamburguesa, cierra al click en link.
- Item nuevo en sidebar = agregar al array `navigation` en `Sidebar.tsx`.

---

## 10. Accesibilidad (no negociable — usuario de ~70 años)

### Tamaños mínimos (calibrados en los primitivos)

| Elemento                        | Mínimo                                |
|---------------------------------|---------------------------------------|
| Texto leíble                    | 16 px (`text-base`)                   |
| Labels / captions / badges      | 14 px (`text-sm`). **Nunca `text-xs`** para contenido relevante. |
| Tap target (botón / link / X)   | 44×44 px (`min-h-[44px] min-w-[44px]`) |
| Botón `md`                      | 44 px de alto, `text-base`            |
| Botón `lg`                      | 52 px de alto, `text-lg`              |
| Input                           | 48 px de alto, `text-base`            |
| Item de Sidebar                 | 48 px de alto, `text-base`            |
| Título de Card / modal          | `text-xl`                             |

### Contraste

- Texto principal sobre blanco: `text-gray-800` o `text-gray-900`.
- Texto secundario sobre blanco: `text-gray-600` o `text-gray-700`. Nunca `text-gray-400/500` para info relevante.
- Sobre el sidebar oscuro: `text-violet-50` (inactivo) / `text-white` (activo). No usar opacidades < 80% para texto.
- Badges: usar variante 800/900 para el texto y borde 300+ para que se distinga.

### Foco

- `focus-visible:ring-4` con tinte de marca (`ring-primary/40`, `ring-danger/40`, `ring-white/40` en sidebar). Nunca `outline: none` sin reemplazo visible.

### Reglas semánticas

- Botones con icono solo → `aria-label` (no `title` solo).
- Forms con `<label htmlFor>` apuntando a `id` del input.
- Banners clickeables: `role="button"`, `tabIndex={0}`, `onKeyDown` con `Enter`.
- Modal: `aria-hidden` en backdrop.
- Tablas: encabezados `<th>` semánticos vía `<TableHead>`.

### Mobile-first

- Toda lista debe tener vista de tarjeta por fila en `< md` (no scroll horizontal en mobile).
- Mobile header siempre con título de sección visible.
- Forms en modal: `grid-cols-1` en mobile, `sm:grid-cols-2` desde 640 px.

---

## 11. Performance

- Selectores específicos de Zustand (ver §6).
- `useMemo` solo en cálculos costosos sobre arrays grandes (filtros + sort de listas).
- No `lazy import` por ruta hasta que el bundle lo justifique (el proyecto es chico).
- Recharts: `<ResponsiveContainer>` siempre, nunca tamaños fijos px.
- No animar `width/height/top/left`: usar `transform` y `opacity`.

---

## 12. Patrones de datos (mock-only)

- Lectura: directa del store con selector.
- Escritura: acción del store. Nunca mutar el array desde el componente.
- Cálculos derivados (KPIs, totales, filtrados) → `useMemo` en la página.
- Si una métrica se necesita en >1 página, va a `utils/analytics.ts`.

---

## 13. Convenciones TypeScript

- Tipos del dominio en `src/types/index.ts` (única fuente).
- `Omit<T, 'id'>` para inputs de creación, `Partial<Omit<T, 'id'>>` para updates.
- `import type` para tipos puros (mejora tree-shaking).
- Sin `any`. Si TS no infiere, escribí el tipo explícito o usá `unknown` + narrowing.
- Enums string como literal unions: `type Turno = 'Mañana' | 'Tarde'` (no `enum`).

---

## 14. Build y deploy

```bash
npm run dev        # vite dev server (5173)
npm run build      # tsc -b && vite build
npm run preview    # preview de dist/
npm run lint       # eslint
npm run deploy     # build + copia 404.html + push gh-pages
```

- `vite.config.ts` tiene `base: '/microsEscolares/'`. **No tocar** salvo cambio de repo.
- El script `deploy` copia `dist/index.html` a `dist/404.html` para el fallback SPA.

---

## 15. Checklist antes de proponer un cambio

- [ ] Leí el archivo afectado completo, no solo el fragmento.
- [ ] Reviso si ya existe un componente UI / util / store que cubra la necesidad.
- [ ] Si el cambio agrega un form o confirmación → va en modal, no en ruta.
- [ ] Si el cambio agrega estilos → usé Tailwind utilities + tokens del tema.
- [ ] Si toco lógica de pagos / mora / recargos → uso funciones de `utils/payments.ts`.
- [ ] Validaciones en límites del sistema (form inputs, query params).
- [ ] Sin comentarios que expliquen el QUÉ, solo el PORQUÉ no obvio.
- [ ] Sin features fuera de scope.

---

## 16. Loader de página (PageLoader) — global, vive en Layout

El loader de navegación es **global**: una sola implementación en `Layout.tsx` cubre las 7 páginas del sidebar. **No se duplica código por página.**

### 16.1 Cómo funciona

```tsx
// src/components/Layout/Layout.tsx
const location = useLocation();

// 1) Carga inicial — full screen (cubre sidebar y main)
const [isInitialLoad, setIsInitialLoad] = useState(true);
useEffect(() => {
  const t = setTimeout(() => setIsInitialLoad(false), 900);
  return () => clearTimeout(t);
}, []);

// 2) Navegación entre páginas — solo en el área del Outlet
const [isNavigating, setIsNavigating] = useState(true);
useEffect(() => {
  setIsNavigating(true);
  const t = setTimeout(() => setIsNavigating(false), 450);
  return () => clearTimeout(t);
}, [location.pathname]);

if (isInitialLoad) return <PageLoader fullScreen />;

// ...
<main>
  {isNavigating ? <PageLoader /> : <Outlet />}
</main>
```

- `<PageLoader label?="Cargando..." fullScreen?: boolean />` — icono `Bus` animado (`bus-roll` keyframe en `index.css`), `role="status"`, `aria-live="polite"`.
  - **Default (`fullScreen={false}`)**: centrado vertical con `min-h-[60vh]` dentro del área del `<Outlet />`. Lo dispara la navegación entre páginas del sidebar.
  - **`fullScreen`**: `fixed inset-0 z-[100] min-h-screen bg-gray-50`. Cubre toda la pantalla (incluye sidebar). Se usa **solo** en el primer mount de `Layout`, antes de pintar el front.
- Flujo: en el primer mount se muestra el loader full-screen ~900 ms; después se renderiza el layout completo y el `isNavigating` ya está apagado, así que la primera página se ve directo. En cambios posteriores de `location.pathname` solo aparece el loader del área principal por 450 ms.

### 16.2 Reglas

- **Las páginas NO deben importar ni invocar `PageLoader`** — lo maneja `Layout`. Si una página agrega su propio loader es duplicación y debe rechazarse.
- No mover el loader a un wrapper por `<Route>` ni a un store global: el `useEffect` sobre `location.pathname` (+ el `useEffect` de mount para `isInitialLoad`) en `Layout` es suficiente.
- No usar `PageLoader` para estados de carga puntuales (submit de form, fetch de un dato). Es solo para transiciones de navegación o el primer mount.
- `fullScreen` es exclusivo del initial load. **No usarlo** para navegación entre páginas (taparía el sidebar y rompería la sensación de SPA).
- Si en el futuro alguna página necesita un tiempo de carga distinto al global, primero discutirlo: lo más probable es que sea un anti-patrón.

### 16.3 Animación

Definida en `src/index.css` como token de tema (`--animate-bus-roll`) y `@keyframes bus-roll`. Usa `motion-safe:` en el componente para respetar `prefers-reduced-motion`.
