# Claude — Instrucciones del proyecto MicrosMiguel

> Este archivo se carga automáticamente en cada sesión. Es la primera fuente de verdad para entender cómo trabajar en este repo.

---

## REGLA CERO — La carpeta `.ai/` es tu manual

Antes de proponer cualquier cambio, leer ó modificar código, **debés consultar la carpeta [.ai/](.ai/)**. Ahí están todas las decisiones, convenciones y reglas del proyecto. Nunca actúes basándote solo en lo que ves en el código sin antes alinear con `.ai/`.

### Archivos que tenés que tener presentes

| Archivo                                                          | Para qué                                                                                  |
|------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| [.ai/config.json](.ai/config.json)                               | Stack, deploy, design tokens, patrones UX, locale.                                        |
| [.ai/personality.md](.ai/personality.md)                         | Quién sos al trabajar acá: senior frontend orientado a SPA interna.                       |
| [.ai/skills/react.md](.ai/skills/react.md)                       | Skill principal: estructura, routing, estilos, modales, stores, accesibilidad, checklist. |
| [.ai/rules-no-hacer.md](.ai/rules-no-hacer.md)                   | Reglas duras (NO HACER) por categoría. Lo que rompa esto se rechaza.                      |
| [.ai/flujos-diagramas.md](.ai/flujos-diagramas.md)               | Flujos funcionales: cobranzas, recargos, mora, casos contemplados.                        |
| [.ai/memory/architecture.md](.ai/memory/architecture.md)         | Snapshot técnico: capas, responsabilidades, reglas de negocio centrales.                  |

### Cómo usarla en cada turno

1. **Antes de proponer**: revisá los archivos de `.ai/` que tocan el área del cambio (estilos → `skills/react.md` §4 + `rules-no-hacer.md`; modales → `personality.md` + `skills/react.md` §5; etc.).
2. **Mientras implementás**: si el código del proyecto contradice algo de `.ai/`, prevalece `.ai/`. Si la contradicción es real (no un descuido), mencionalo al usuario antes de seguir.
3. **Después de implementar**: si el cambio modificó **flujos, lógica de negocio, patrones, convenciones, dependencias o decisiones arquitectónicas**, **actualizá el archivo correspondiente en `.ai/`** en el mismo turno. La doc no se queda desactualizada.

---

## Cuándo TENÉS que actualizar `.ai/`

Sin pedírtelo el usuario, actualizá `.ai/` cuando un cambio implique:

| Cambio                                                                | Archivo a actualizar                                                              |
|-----------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| Nueva ruta, nuevo store, nuevo dominio                                | `memory/architecture.md` + `skills/react.md` §2 §3                                |
| Cambio en reglas de pagos / mora / recargos / vencimiento             | `flujos-diagramas.md` §4 + `memory/architecture.md` (tabla reglas) + `personality.md` |
| Nuevo patrón UX (que se va a repetir en >1 lugar)                     | `skills/react.md` (sección correspondiente o nueva)                               |
| Nueva regla "no hacer"                                                | `rules-no-hacer.md`                                                               |
| Cambio de stack (lib agregada/quitada/actualizada major)              | `config.json` + `skills/react.md` §1 + `memory/architecture.md`                   |
| Cambio de deploy (basePath, branch, fallback)                         | `config.json` + `memory/architecture.md`                                          |
| Tokens del tema modificados (colores, radio, fuente)                  | `config.json` + `skills/react.md` §4.2                                            |
| Nuevo flujo funcional (sección, asistente, alertas)                   | `flujos-diagramas.md` (sección nueva) + actualizar §13 resumen                    |

### Cuándo NO actualizar `.ai/`

- Bug fix puntual sin cambio de patrón.
- Cambios de copy en UI.
- Refactors internos que no cambian contratos.
- Ajustes de estilos puntuales que ya respetan las convenciones.

---

## Flujo de trabajo en cada prompt

```
┌─────────────────────────────────────────────────────────┐
│ 1. Leer el prompt del usuario                           │
│ 2. Identificar área(s) afectadas                        │
│ 3. Consultar archivos relevantes de .ai/                │
│ 4. Verificar contra el código actual                    │
│ 5. Proponer / implementar respetando .ai/               │
│ 6. ¿Cambió algo de los puntos de la tabla "TENÉS que    │
│    actualizar .ai/"? → Sí: editar el archivo .ai/       │
│ 7. Reportar al usuario qué cambió en código y en .ai/   │
└─────────────────────────────────────────────────────────┘
```

---

## Atajos importantes (lo más usado)

- **Modal-first**: forms y confirmaciones siempre con `useModalStore.openModal(titulo, <Form />)`. Nunca rutas tipo `/students/new`. Detalle: `.ai/skills/react.md` §5.
- **Estilos en orden**: Tailwind utilities → tokens `@theme` → helper `cn()` → componentes `ui/` → CSS plano (último recurso). Detalle: `.ai/skills/react.md` §4.
- **Reglas de pagos** (vencimiento día 10, recargos 0/10/20%, mora) viven en `src/utils/payments.ts`. **Nunca duplicar**. Detalle: `.ai/skills/react.md` §7.
- **Routing**: `HashRouter` obligatorio (GH Pages). Detalle: `.ai/skills/react.md` §3.
- **Selectores Zustand específicos**, no destructurar el store.
- **IDs**: `Math.max(...ids, 0) + 1`. No UUID, no timestamp.

---

## Dominio en una línea

MicrosMiguel gestiona transporte escolar: escuelas, alumnos, pagos mensuales con recargos por mora, colectivos, gastos y nómina. SPA in-memory, sin auth, sin backend, deploy a GitHub Pages.
