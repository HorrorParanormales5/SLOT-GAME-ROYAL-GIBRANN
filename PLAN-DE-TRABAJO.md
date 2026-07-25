# 🎰 Royal Clover Slots — Plan de Trabajo

> Documento de planificación. Basado en el análisis técnico del prototipo original
> (`SLOT-GAME-ROYAL-GIBRANN/test de simbolo de trebol.html`).
> **Estado:** propuesta pendiente de aprobación. No se ha modificado el juego original.

---

## 0. Contexto y decisiones tomadas

| Decisión | Elección |
|---|---|
| Objetivo del producto | **Producto con cuentas** (usuarios, saldo persistente, ranking, resolución server-side) |
| Enfoque de migración | **Reescritura a React + TypeScript + Vite** |
| Prioridad inicial | **Calidad visual / animaciones** |
| Punto de partida | Prototipo monolítico HTML (1 archivo, 1.593 líneas, vanilla JS/CSS) |

**Estrategia global:** construir el frontend de calidad AAA cuanto antes, dejando el
backend **abstraído tras una interfaz de servicio** (`gameApi`), de modo que se pueda
enchufar el servidor real más tarde sin reescribir la UI. El HTML original se conserva
intacto como referencia funcional y de diseño.

---

## 1. Visión y objetivos

**Visión:** convertir el prototipo en un slot de calidad profesional, con experiencia
visual y sonora comparable a plataformas de casino online modernas, arquitectura limpia
y tipada, y una base preparada para cuentas de usuario e integridad server-side.

**Objetivos medibles (definición de éxito):**

1. Motor de juego **puro, tipado y cubierto por tests** (RTP verificable por Monte Carlo).
2. UI en **React componentizada**, accesible (WCAG AA) y responsive real (móvil→desktop).
3. Animaciones AAA (GSAP): anticipación en reels, count-up de premios, celebraciones por tier.
4. **Audio** integrado y assets optimizados/self-hosted.
5. Backend con **cuentas + wallet transaccional** y resolución de giro server-side.
6. **Cero regresiones** de comportamiento respecto al prototipo (paridad validada).

---

## 2. Principios rectores

- **Separación de capas:** `engine` (reglas puras) · `state` (store) · `ui` (React) · `services` (I/O).
- **El motor no toca el DOM.** Determinista y testeable de forma aislada.
- **El cliente nunca es autoridad del saldo.** Cuando exista backend, el servidor resuelve.
- **Tipado estricto** (`strict: true`). Nada de dinero sin tipos.
- **Accesibilidad y `prefers-reduced-motion` como requisito, no como extra.**
- **Incremental y verificable:** cada fase termina con algo ejecutable y probado.

---

## 3. Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Build/Dev | **Vite** | Arranque instantáneo, HMR, DX excelente |
| UI | **React 18 + TypeScript** | Ecosistema, componentes, tipado |
| Estilos | **Tailwind CSS** | Velocidad, consistencia, responsive trivial |
| Componentes accesibles | **Radix UI / shadcn** | Modales, sliders, dialogs accesibles (settings, reset, paytable) |
| Estado | **Zustand** | Store simple, sin boilerplate, ideal para estado de juego |
| Animación (mesa) | **GSAP** | Timelines complejas: reels, wins, celebraciones, sync con audio |
| Animación (chrome UI) | **Framer Motion** | Declarativo para modales/HUD (`AnimatePresence`) |
| Audio | **Howler.js** | Gestión de sprites de sonido, pooling, mute |
| Tests | **Vitest + Testing Library** | Unit del motor + componentes |
| Game math (offline) | **Python (NumPy/pandas)** | Simulación Monte Carlo de RTP/volatilidad |
| Backend (Fase 3) | **Supabase (Postgres) → Next API** | Auth, wallet ledger, historial, ranking, RLS |
| Observabilidad | **Sentry + OpenTelemetry** | Errores y métricas en producción |

---

## 4. Arquitectura objetivo (estructura de carpetas)

```
slot-royal/
├─ public/
│  └─ assets/
│     ├─ img/trebol.svg           # trébol optimizado, self-hosted
│     └─ audio/                   # spin, win, coin, bonus...
├─ src/
│  ├─ engine/                     # ── CAPA MOTOR (pura, sin DOM) ──
│  │  ├─ symbols.ts               # catálogo de símbolos + pesos
│  │  ├─ paylines.ts              # 9 líneas de pago
│  │  ├─ paytable.ts              # tablas de pago
│  │  ├─ difficulty.ts            # config de dificultad ("algoritmo 1000")
│  │  ├─ rng.ts                   # abstracción de aleatoriedad (inyectable)
│  │  ├─ engine.ts                # spin(bet, difficulty) → SpinResult
│  │  ├─ evaluate.ts              # evaluación de líneas + scatter + wilds
│  │  ├─ types.ts                 # tipos compartidos
│  │  └─ __tests__/
│  │     ├─ engine.test.ts        # paridad + casos borde
│  │     └─ rtp.montecarlo.test.ts
│  ├─ state/                      # ── CAPA ESTADO ──
│  │  └─ gameStore.ts             # Zustand: créditos, apuesta, free spins...
│  ├─ services/                   # ── CAPA I/O ──
│  │  └─ gameApi.ts               # interfaz; impl. local hoy, servidor mañana
│  ├─ components/                 # ── CAPA UI ──
│  │  ├─ Cabinet.tsx
│  │  ├─ Reels/ (Reel, Cell, SpinLayer)
│  │  ├─ HUD.tsx
│  │  ├─ Controls.tsx  (BetControl, SpinButton)
│  │  ├─ Paytable.tsx
│  │  ├─ FreeSpinsBanner.tsx
│  │  ├─ WinCelebration.tsx
│  │  └─ modals/ (SettingsModal, ResetModal)
│  ├─ animations/                 # timelines GSAP reutilizables
│  │  ├─ reelSpin.ts
│  │  ├─ winCountUp.ts
│  │  └─ celebration.ts
│  ├─ audio/
│  │  └─ soundManager.ts          # Howler wrapper
│  ├─ hooks/
│  ├─ styles/ (tailwind + tema casino)
│  ├─ App.tsx
│  └─ main.tsx
├─ tools/                         # ── PYTHON (game math offline) ──
│  └─ montecarlo_rtp.py
├─ tests/e2e/                     # Playwright (Fase posterior)
├─ vite.config.ts
├─ tailwind.config.ts
├─ tsconfig.json
└─ package.json
```

---

## 5. Fases, sprints y tareas

> Estimaciones en escala relativa (S=pequeño, M=medio, L=grande). Riesgo: 🟢 bajo · 🟡 medio · 🔴 alto.

### FASE 0 — Preparación (medio día)
| # | Tarea | Entregable | Esf. | Riesgo |
|---|---|---|---|---|
| 0.1 | Scaffold Vite + React + TS (`strict`) | Proyecto arranca en `localhost` | S | 🟢 |
| 0.2 | Tailwind + tema (variables de color del original) | Tokens de diseño configurados | S | 🟢 |
| 0.3 | ESLint + Prettier + Vitest + estructura de carpetas | Linting y tests corriendo | S | 🟢 |
| 0.4 | Extraer imagen del trébol a SVG/AVIF self-hosted | `public/assets/img/trebol.svg` | S | 🟢 |

**Criterio de aceptación:** `npm run dev`, `npm run lint`, `npm run test` funcionan.

---

### FASE 1 — Motor de juego (núcleo tipado y probado)
| # | Tarea | Entregable | Esf. | Riesgo |
|---|---|---|---|---|
| 1.1 | Portar símbolos, paylines, paytable, dificultad a TS | Módulos `engine/*` tipados | M | 🟢 |
| 1.2 | `rng.ts` inyectable (para tests deterministas y futuro server RNG) | RNG abstracto | S | 🟢 |
| 1.3 | `evaluate.ts`: líneas + wilds + scatter | Evaluación pura | M | 🟡 |
| 1.4 | **Fix bug** wild-vs-símbolo: pagar `max(línea símbolo, línea wilds)` | Pago correcto | M | 🟡 |
| 1.5 | **Fix bug** deriva de floats en acumulador/transferencia | Enteros consistentes | S | 🟢 |
| 1.6 | **Fix bug** scatter fantasma en giros forzados | Limpieza de CLOVER en forced win | S | 🟢 |
| 1.7 | `engine.spin()` orquestando todo | API pública del motor | M | 🟡 |
| 1.8 | Tests de paridad + casos borde (Vitest) | Suite verde | M | 🟡 |
| 1.9 | Monte Carlo de RTP (JS y/o Python) | Reporte de RTP/volatilidad | M | 🟡 |

**Criterio de aceptación:** el motor produce los mismos resultados que el prototipo para
semillas dadas, con los bugs corregidos, y el RTP queda documentado.

---

### FASE 2 — UI + Calidad visual ✨ (tu prioridad)
| # | Tarea | Entregable | Esf. | Riesgo |
|---|---|---|---|---|
| 2.1 | `gameStore` (Zustand) conectado al motor | Estado reactivo | M | 🟢 |
| 2.2 | Componentes base: Cabinet, Reels, HUD, Controls | UI funcional equivalente al original | L | 🟡 |
| 2.3 | Modales con Radix/shadcn (Settings, Reset) accesibles | Modales a11y | M | 🟢 |
| 2.4 | Paytable componentizada + colores desde tokens | Consistencia visual | S | 🟢 |
| 2.5 | **GSAP:** animación de reels con **anticipación** (frenado escalonado) | Reels con suspense | L | 🟡 |
| 2.6 | **GSAP:** **count-up** del premio + resaltado de líneas | Premio animado | M | 🟢 |
| 2.7 | **Celebraciones por tier** (big/mega/epic win) con overlay | Momentos "wow" | L | 🟡 |
| 2.8 | Efecto de transferencia de free spins reescrito como timeline | Animación limpia | M | 🟢 |
| 2.9 | **Audio** (Howler): spin loop, near-miss, win, coin cascade, bonus | Inmersión sonora | M | 🟡 |
| 2.10 | Accesibilidad: teclado (Espacio=girar), foco, `prefers-reduced-motion`, contraste WCAG | Cumple AA | M | 🟢 |
| 2.11 | Responsive real (móvil→tablet→desktop) | Layout adaptativo | M | 🟡 |
| 2.12 | Pulido: microinteracciones, hovers, autoplay/turbo (opcional) | Detalle AAA | M | 🟢 |

**Criterio de aceptación:** juego jugable de principio a fin, visualmente superior al
original, accesible, responsive, con audio y sin regresiones de reglas.

---

### FASE 3 — Backend, cuentas e integridad
| # | Tarea | Entregable | Esf. | Riesgo |
|---|---|---|---|---|
| 3.1 | Supabase: proyecto, Auth, esquema (users, wallet_ledger, spins, config) | DB + auth | L | 🟡 |
| 3.2 | **Wallet como ledger transaccional** (no un campo `balance`) | Saldo auditable | L | 🔴 |
| 3.3 | Resolución de giro **server-side** + `gameApi` real | Anti-trampa | L | 🔴 |
| 3.4 | *Provably fair* (semilla servidor/cliente + verificación) | Confianza | L | 🔴 |
| 3.5 | Historial de giros + estadísticas de usuario | Retención | M | 🟢 |
| 3.6 | Leaderboard / ranking | Competitividad | M | 🟢 |
| 3.7 | RLS, rate-limiting, validación de entrada | Seguridad | M | 🟡 |

**Criterio de aceptación:** un usuario puede registrarse, jugar con saldo persistente que
solo el servidor modifica, y ver su historial/ranking.

---

### FASE 4 — Producción, escalabilidad y calidad
| # | Tarea | Entregable | Esf. | Riesgo |
|---|---|---|---|---|
| 4.1 | Optimización de assets (AVIF/WebP, sprites de audio, code-splitting) | Bundle ligero | M | 🟢 |
| 4.2 | Caché (Redis) para sesión/saldo caliente + CDN | Rendimiento a escala | M | 🟡 |
| 4.3 | Observabilidad: Sentry + OpenTelemetry + alertas de RTP anómalo | Operación | M | 🟢 |
| 4.4 | CI/CD (lint, test, build, deploy) | Automatización | M | 🟢 |
| 4.5 | Tests E2E (Playwright) | Cobertura de flujos | M | 🟡 |
| 4.6 | Juego responsable: límites, i18n | Cumplimiento/alcance | M | 🟢 |
| 4.7 | Escalado horizontal (contenedores, réplicas de lectura, PgBouncer) | Miles de usuarios | L | 🟡 |

---

## 6. Hitos (milestones)

| Hito | Contenido | Resultado visible |
|---|---|---|
| **M1 — Cimientos** | Fase 0 + Fase 1 | Motor tipado y probado, RTP conocido |
| **M2 — Juego AAA** | Fase 2 completa | Slot jugable, bonito, con audio y accesible (aún sin cuentas) |
| **M3 — Producto** | Fase 3 | Cuentas, saldo persistente, resolución server-side |
| **M4 — Escala** | Fase 4 | Listo para producción y crecimiento |

---

## 7. Dependencias entre tareas

- Fase 1 **bloquea** Fase 2 (la UI consume el motor).
- 2.1 (store) **bloquea** 2.2–2.12.
- 2.5 (GSAP reels) **bloquea** 2.6 y 2.7.
- Fase 3 depende de `gameApi` definido en Fase 2 (misma interfaz, otra implementación).
- 3.2 (ledger) **bloquea** 3.3 (giro server-side).

---

## 8. Estrategia de pruebas

| Nivel | Herramienta | Qué cubre |
|---|---|---|
| Unit (motor) | Vitest | Evaluación de líneas, wilds, scatter, dificultad, fixes de bugs |
| Simulación | Vitest / Python | RTP, volatilidad, distribución de premios (Monte Carlo) |
| Componentes | Testing Library | HUD, controles, modales, estados deshabilitados |
| E2E | Playwright | Flujo completo: apostar → girar → ganar → free spins → transferir |
| Accesibilidad | axe / Lighthouse | WCAG AA, foco, contraste, reduced-motion |

**Definición de "Hecho" (DoD) por tarea:** compila con `strict`, pasa lint, tiene tests
donde aplica, cumple accesibilidad si es UI, y no introduce regresión de reglas.

---

## 9. Registro de riesgos

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| Paridad de comportamiento rota al portar el motor | Media | Alto | Tests de paridad con semillas fijas antes de tocar UI |
| RTP descontrolado (el "algoritmo 1000" no define retorno) | Alta | Alto | Monte Carlo + rediseño desde RTP objetivo (p. ej. 96%) |
| Integridad: cliente manipulable | Alta (hoy) | Crítico | Resolución server-side en Fase 3; nunca confiar en el cliente |
| Complejidad de GSAP + audio + estado | Media | Medio | Animaciones aisladas en `animations/`, timelines declarativas |
| Alcance del backend se dispara | Media | Alto | Interfaz `gameApi` desde el día 1; backend enchufable, no bloqueante |
| Assets pesados (imagen 720 KB) | Baja | Medio | SVG/AVIF self-hosted en Fase 0 |

---

## 10. Corrección de bugs conocidos (del análisis)

| Bug | Ubicación original | Fix (Fase) |
|---|---|---|
| Deriva de punto flotante en créditos | `triggerWinTransferEffect` (~L1404) | 1.5 |
| No paga `max(wild, símbolo)` en líneas mixtas | `evaluateWins` (~L1215) | 1.4 |
| Scatter fantasma en giros forzados | `buildForcedWinGrid` (~L1285) | 1.6 |
| `Math.random` no apto para dinero | global | 3.4 (RNG server / provably fair) |
| Imagen dependiente de GitHub raw | `makeSymEl` (~L974) | 0.4 |
| Sin `prefers-reduced-motion` / teclado | CSS/JS global | 2.10 |

---

## 11. Métricas / KPIs de calidad

- **Cobertura de tests del motor:** ≥ 90%.
- **RTP simulado** documentado y dentro de rango objetivo.
- **Lighthouse:** Performance ≥ 90, Accessibility ≥ 95.
- **Bundle inicial:** presupuesto definido (p. ej. < 250 KB gzip sin GSAP/Pixi diferidos).
- **Cero** `any` implícitos; `strict` activo.
- **Regresiones de reglas:** 0.

---

## 12. Orden de ejecución recomendado

1. **Fase 0** (cimientos) → algo que arranca.
2. **Fase 1** (motor + tests) → corazón fiable.
3. **Fase 2** (UI + visual + audio) → el "wow", tu prioridad.
4. **Fase 3** (backend + cuentas) → producto real.
5. **Fase 4** (escala + producción) → crecimiento.

> El HTML original permanece intacto durante todo el proceso como referencia.

---

*Documento de planificación — pendiente de aprobación para iniciar la Fase 0.*
