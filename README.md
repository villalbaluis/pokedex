# Pokédex

A Pokédex web application built with **Angular 20**, powered by the [PokéAPI](https://pokeapi.co/). This project was built as a hands-on learning exercise to explore modern Angular: standalone components, signals, zoneless change detection, functional interceptors, Reactive Forms, and a Strategy-pattern-based caching layer — while following the current official Angular style guide (feature-based organization, no type-based folders at the app root).

## Features

- **Browse Pokémon** — a searchable, paginated grid of Pokémon (national dex, ~1300 entries), each card showing its sprite, name, and types.
- **Browse by region** — filter the grid by region (Kanto, Johto, Hoenn, ...), backed by the PokéAPI's region → pokedex → species chain.
- **Search** — instant client-side filtering by name, built with Reactive Forms (`FormControl`) bridged into signals via `toSignal()`.
- **Favorites** — mark/unmark any Pokémon as a favorite; persisted to `localStorage` and filterable from the home page.
- **Pokémon detail page** — species category and Pokédex flavor text (in Spanish, with English fallback), gender ratio, abilities (with hidden-ability indicator), height/weight/base experience, base stats with a computed total, **calculated type weaknesses** (combining multiple types' damage multipliers), and its **evolution chain** with per-stage evolution levels. Includes previous/next navigation between adjacent Pokédex numbers.
- **Global loading indicator** — a top progress bar driven by an HTTP interceptor that tracks in-flight requests app-wide.
- **Offline-friendly caching** — nearly every PokéAPI response (list pages, Pokémon details, species, types, evolution chains, region data) is cached client-side, so repeat visits are instant and don't re-hit the network.

## Tech stack

- **Angular 20** — standalone components only (no `NgModule`), lazy-loaded routes (`loadComponent`), [component input binding](https://angular.dev) for route params (`withComponentInputBinding()`).
- **Zoneless change detection** (`provideZonelessChangeDetection()`) — no Zone.js in the bundle; reactivity is driven entirely by **signals**, `computed()`, and `effect()`.
- **RxJS** — `HttpClient` observables composed with `switchMap`, `forkJoin`, `map`, `tap`, `catchError`, and bridged to signals with `toSignal()` where needed.
- **Reactive Forms** (`FormControl` + `ReactiveFormsModule`) for the search input.
- **Functional HTTP interceptors** — one rewrites relative API calls to the PokéAPI base URL, another drives the global loading indicator.
- **IndexedDB** (via the [`idb`](https://github.com/jakearchibald/idb) wrapper) as the default cache backend, behind a custom **Strategy pattern** (see below).
- **[Vitest](https://vitest.dev)** as the unit test runner (migrated from the now-deprecated Karma/Jasmine setup).
- **SCSS** for styling, no UI component library — everything is hand-built.

## Architecture notes

This project deliberately follows a few conventions worth calling out, since they came from explicit design discussions during development:

- **Feature-based folders, not type-based folders.** Per the [official Angular style guide](https://angular.dev/style-guide), the app is organized around features (`pokemon/`), not around file types (no global `components/`, `services/` folders at the app root). Within the `pokemon/` feature, `models/`, `services/`, `favorites/`, and `utils/` subfolders group related files — a deliberate exception made for a single large feature, not the app-wide default.
- **`core/`** holds app-wide singleton infrastructure: HTTP interceptors, the loading service, and the storage strategy abstraction. **`layout/`** holds persistent UI chrome (navbar, footer, loading indicator) mounted once in the root component, outside the router outlet. **`shared/`** holds small utilities reused across the feature (currently just the Pokémon type-color mapping).
- **Storage as a Strategy pattern.** A `StorageStrategy` interface (`get`/`set`/`remove`/`clear`) is implemented by four interchangeable backends — in-memory, `sessionStorage`, `localStorage`, and IndexedDB — and injected via two separate `InjectionToken`s: `CACHE_STRATEGY` (API response caching, bound to IndexedDB) and `FAVORITES_STORAGE` (user favorites, bound to `localStorage`). Swapping a backend, or scoping a different one to part of the app via Angular's hierarchical injectors, requires no changes to the services that consume it.
- **Cache-aside with dual-key writes.** `PokemonService` and `RegionService` check the cache before every HTTP call and populate it after. Pokémon details and species are cached under **both** their numeric id and their name (`pokemon:detail:25` and `pokemon:detail:pikachu`), since the app can be navigated by either — this avoids redundant fetches regardless of which identifier was used first.
- **`effect()` vs. `ngOnInit()`.** Components fetch data in `ngOnInit()` when their input can never change during the component's lifetime (e.g. `PokemonCard`'s `name`), and in a constructor `effect()` when it can (e.g. `PokemonDetail`'s `id`, which changes in place when using the prev/next navigation on the same route).

## Project structure

```
src/app/
├── core/                        # App-wide singleton infrastructure
│   ├── enums/                   # Shared constant enums (e.g. IndexedDB store names)
│   ├── interceptors/            # PokéAPI base URL rewriting
│   ├── loading/                 # LoadingService + its HTTP interceptor
│   └── storage/                 # StorageStrategy interface + its 4 implementations
├── layout/                      # Persistent UI chrome (not routed)
│   ├── navbar/
│   ├── footer/
│   └── loading-indicator/
├── pokemon/                     # The single feature in this app
│   ├── models/                  # Pokémon, region, and shared API resource shapes
│   ├── services/                # PokemonService, RegionService
│   ├── favorites/               # FavoritesService
│   ├── utils/                   # Pure functions: weakness calculation, evolution chain flattening
│   ├── home/                    # Home page (grid, search, region nav, pagination)
│   │   ├── pokemon-card/
│   │   └── region-nav/
│   └── pokemon-detail/          # Pokémon detail page
├── shared/                      # Reused across the feature (color-by-type mapping)
├── app.ts / app.html            # Root component (navbar + loading bar + router-outlet + footer)
├── app.config.ts                # Providers: router, HTTP client + interceptors, storage strategies
└── app.routes.ts                # Lazy-loaded routes
```

## Getting started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Install

```bash
npm install
```

### Run the development server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The app reloads automatically on source changes.

### Build for production

```bash
npm run build
```

Build artifacts are written to `dist/pokedex/`.

### Run unit tests

```bash
npm test
```

Runs the suite once via [Vitest](https://vitest.dev) (the CLI defaults to watch mode in an interactive terminal, and to a single run otherwise). Test files live alongside the code they test (`*.spec.ts`). Note: Angular's `@angular/build:unit-test` builder is still marked experimental by the CLI at the time of writing, though Vitest itself is the officially recommended replacement for the deprecated Karma runner.

## Data source

All Pokémon data is fetched live from the free, public [PokéAPI](https://pokeapi.co/) — no API key required, no backend of this project's own. Please consider that PokéAPI is a shared community resource when developing against it locally (this app caches aggressively for exactly that reason).

## Known simplifications

A few deliberate scope decisions were made to keep the project focused as a learning exercise, documented here rather than hidden:

- **Region → Pokédex mapping** uses only the *first* Pokédex listed for a region, ignoring alternate regional Pokédex variants.
- **Evolution chains** always follow the *first* branch at each stage, so Pokémon with branching evolutions (e.g. Eevee) only show one path.
- **Species/form name mismatches** (e.g. Pokémon whose default form's API resource name differs from its species name, such as Wormadam) are handled gracefully with a "not available" state rather than resolved via the full species → default variety lookup.
- **Previous/next navigation** on the detail page is purely arithmetic on the Pokédex number; it doesn't fetch the neighboring Pokémon's name in advance, so the nav links show only the number.

## Credits

- Data: [PokéAPI](https://pokeapi.co/)
- Built by [Luis Villalba](https://github.com/villalbaluis) — [LinkedIn](https://www.linkedin.com/in/villalbaluiz/)
