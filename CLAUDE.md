# CLAUDE.md — Contexto del proyecto Royal Clover Slots

> Este archivo se carga automáticamente al inicio de cada sesión de Claude Code.
> Da el contexto necesario para trabajar sin re-explicar el proyecto.

---

## 🎰 Qué es este proyecto

**Royal Clover — Deluxe Slots**: un juego de tragamonedas (slot machine) creado
originalmente por Gibrann Abdala. Se está llevando de un prototipo monolítico a un
**producto profesional con cuentas de usuario**.

- **Idioma de la app y la comunicación:** español.
- **Estética:** casino de lujo (oro/negro, fuente Cinzel, gabinete con glow, tréboles).

---

## 📁 Estado actual del repositorio

```
casino game/
├─ CLAUDE.md                       ← este archivo (contexto del agente)
├─ PLAN-DE-TRABAJO.md              ← plan de acción completo por fases
└─ SLOT-GAME-ROYAL-GIBRANN/        ← PROTOTIPO ORIGINAL (no tocar sin aprobación)
   ├─ README.md
   ├─ test de simbolo de trebol.html   ← el juego entero (1 archivo, ~1.593 líneas)
   └─ trebol png.png                    ← imagen del scatter (720 KB, sin optimizar)
```

El prototipo es **un único HTML** con HTML + CSS + JS vanilla dentro de un IIFE.
Sin `package.json`, sin build, sin framework, sin backend, sin persistencia.
La reescritura moderna (proyecto `slot-royal/`) **aún no se ha creado**.

---

## ✅ Decisiones ya tomadas (por el usuario)

| Tema | Decisión |
|---|---|
| Objetivo | **Producto con cuentas** (usuarios, saldo persistente, ranking, giro server-side) |
| Migración | **Reescritura a React + TypeScript + Vite** |
| Prioridad | **Calidad visual / animaciones primero** |
| Estrategia | Frontend AAA ya; backend abstraído tras interfaz `gameApi` para enchufarlo luego |

**Stack acordado:** Vite · React 18 + TS (`strict`) · Tailwind · Radix/shadcn ·
Zustand · GSAP (mesa de juego) · Framer Motion (chrome UI) · Howler (audio) ·
Vitest · Supabase/Postgres (Fase 3) · Python/NumPy para Monte Carlo de RTP (offline).

---

## 🗺️ Plan de trabajo

El plan completo está en **[PLAN-DE-TRABAJO.md](PLAN-DE-TRABAJO.md)**. Resumen de fases:

- **Fase 0 — Cimientos:** scaffold Vite+React+TS, Tailwind, lint/tests, imagen→SVG self-hosted.
- **Fase 1 — Motor:** lógica pura tipada (`engine/`), sin DOM, con tests + RTP Monte Carlo.
- **Fase 2 — Visual ✨ (prioridad):** componentes, GSAP (anticipación, count-up, celebraciones), audio, accesibilidad, responsive.
- **Fase 3 — Backend:** cuentas, wallet transaccional (ledger), giro server-side, provably fair.
- **Fase 4 — Escala:** optimización, caché, observabilidad, CI/CD, escalado horizontal.

**Progreso:** ✅ Fase 0 · ✅ Fase 1 · ✅ Fase 2 · ⬜ Fase 3 · ⬜ Fase 4.

**Fase 2 completada:** UI completa en React consumiendo el motor. Store Zustand
(`src/state/gameStore.ts`) con lógica de negocio síncrona (startSpin/settleSpin) y el
TIMING orquestado por `components/Game.tsx`. Componentes: Marquee, Reels/Reel (giro GSAP
con anticipación en el último rodillo), Hud (count-up GSAP del premio), Controls,
MessageBar, Paytable, FreeSpinsBanner, WinCelebration (tiers big/mega/epic), modales
Radix (Settings/Reset). Audio sintetizado con Web Audio API (`src/audio/soundManager.ts`,
sin archivos). Accesibilidad: teclado (Espacio=girar), foco visible, `prefers-reduced-motion`,
aria-live. Estilos portados a `src/index.css` (capa de componentes). typecheck/lint/tests
(17)/build/dev ✅. Bundle: JS 108 KB gzip, CSS 6.4 KB gzip. Arranca con `npm run dev`.
Nota: se optó por GSAP + Web Audio synth en vez de Framer Motion + Howler (sin assets).

**Fase 1 completada:** motor puro tipado en `src/engine/` (types, rng inyectable con
mulberry32, symbols, paylines, paytable, difficulty, evaluate, engine, barrel index).
17 tests en verde (Vitest). Bugs corregidos: max(wild,símbolo), deriva de floats
(redondeo a entero en origen) y scatter fantasma (se limpian tréboles antes de forzar
premio). Monte Carlo (100k giros, juego base): RTP fácil≈158%, medio≈102%, difícil≈75%
→ confirma que el "algoritmo 1000" NO controla el RTP (rediseñar en Fase 3 desde un
RTP objetivo). API pública: `spin({bet,difficulty,isFreeSpin?,rng?})` → `SpinResult`.

**Fase 0 completada:** proyecto `slot-royal/` creado (Vite 8 + React 19 + TS 6 `strict` +
Tailwind v4 + Zustand 5 + Vitest 4 + Prettier + oxlint). Tokens de color del original en
`src/index.css` (`@theme`). Trébol como SVG self-hosted en `public/assets/img/trebol.svg`.
Estructura de carpetas por capas creada. `typecheck`, `lint`, `test`, `build` y `dev` ✅.
El nombre del stack real: React 19 (no 18) y TS 6, más nuevos que lo planificado.

---

## 🧠 Cómo está hecho el prototipo (referencia rápida)

- **Grid:** 5 rodillos × 3 filas · **9 líneas de pago** clásicas.
- **Créditos:** inicia en 50.000 · **Apuesta:** 500–1.500 (pasos de 100).
- **Símbolos:** low (números 0,2–9), mid (J,Q,K,A), high/wilds (orbes verde/azul/púrpura), scatter (🍀 trébol).
- **Free spins:** 3 tréboles=5 giros, 4=10, 5+=16; premios ×2 durante free spins.
- **"Algoritmo de 1000":** cada giro tira 1–1000 y **fuerza** resultado (bonus/win/nada) según dificultad (fácil/medio/difícil). No es RNG puro ni RTP controlado.
- Funciones clave en el HTML: `evaluateWins` (~L1170), `doSpin` (~L1452), `spinReels` (~L1332), `triggerWinTransferEffect` (~L1381).

## 🐞 Bugs conocidos a corregir (ver plan §10)

1. **Deriva de floats** en `triggerWinTransferEffect` (~L1404) → créditos decimales.
2. **No paga `max(wild, símbolo)`** en líneas mixtas (`evaluateWins` ~L1215).
3. **Scatter fantasma** en giros forzados (`buildForcedWinGrid` ~L1285).
4. **`Math.random`** no apto para dinero → RNG server / provably fair (Fase 3).
5. **Imagen del trébol servida desde GitHub raw** (~L974) → self-host (Fase 0).
6. **Falta `prefers-reduced-motion` y navegación por teclado** (Espacio=girar).

---

## ⚠️ Reglas de trabajo (importante)

1. **No modificar el prototipo original** (`SLOT-GAME-ROYAL-GIBRANN/`) sin aprobación explícita del usuario. Se conserva intacto como referencia.
2. **El usuario aprueba antes de implementar.** Explicar cada cambio antes de hacerlo.
3. **El motor de juego nunca toca el DOM** — capa pura y testeable.
4. **El cliente nunca es autoridad del saldo** — cuando exista backend, el servidor resuelve el giro.
5. **TypeScript estricto**, accesibilidad (WCAG AA) y `prefers-reduced-motion` como requisitos, no extras.
6. **Comunicación en español.**

---

## ▶️ Comandos (cuando exista el proyecto React)

_Aún no aplican; se rellenarán al crear `slot-royal/`._

```bash
# npm run dev     — servidor de desarrollo (Vite)
# npm run test    — tests (Vitest)
# npm run lint    — ESLint
# npm run build   — build de producción
```

Para probar el prototipo actual, abrir el HTML en el navegador:
`open "SLOT-GAME-ROYAL-GIBRANN/test de simbolo de trebol.html"`
