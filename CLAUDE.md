# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A luxury automotive dealership website for Hongqi vehicles in Kazakhstan. Built with React, TypeScript, Vite, and Tailwind CSS, featuring premium animations and multi-language support.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production (includes TypeScript compilation)
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Tech Stack & Key Libraries

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with extensive luxury design system
- **Routing**: React Router v6
- **Internationalization**: i18next (EN, RU, KZ languages; Russian is default)
- **Animation**:
  - GSAP with ScrollTrigger for advanced scroll animations
  - Lenis for smooth scroll behavior
  - Framer Motion for page transitions
- **UI Components**: Radix UI (Dialog, Select, Checkbox)
- **Icons**: Lucide React

## Architecture

### Application Structure

**App Entry Flow**: `main.tsx` → `App.tsx` → Router → Pages

**App.tsx** contains:
- Preloader with GSAP animations (shows percentage counter 0-100)
- CustomCursor component (desktop only, uses GSAP for smooth follow)
- Lenis smooth scroll initialization (synced with GSAP ScrollTrigger)
- AnimatedRoutes with Framer Motion page transitions

### Key Directories

- **src/pages/**: Page components (Home, Catalog, CarDetail, Contact, About, Brands, Service, TestDrive, Offers, Dealers)
- **src/components/**: Reusable components (Navigation, Footer, Hero, CarCard, CarCardPremium, ScrollReveal, ContactFormSection)
- **src/data/**:
  - `cars.ts`: Car inventory data (all Hongqi vehicles)
  - `siteImages.ts`: Centralized image URLs from cdn.hongqi.ru
- **src/types/**: TypeScript interfaces (`car.ts` exports Car and CarFilters)
- **src/i18n/**: i18next configuration and locale files (en.json, ru.json, kz.json)

### Design System

Tailwind configuration (`tailwind.config.js`) includes extensive luxury theme:

**Custom Colors**: `luxury-black`, `luxury-burgundy`, `luxury-cream`, etc.
**Custom Typography**: Responsive font sizes with clamp() - `hero`, `display`, `h1`, `h2`, `h3`, `body-lg`, `label`, `micro`
**Font Families**: Montserrat (display), Inter (sans), Space Grotesk (mono)
**Custom Animations**: `float`, `grain`, `marquee`, `reveal-up`, `scale-in`, `line-grow`
**Custom Easings**: `luxury`, `smooth`, `decelerate`, `accelerate`, `spring`

### Path Aliases

TypeScript baseUrl is set to project root with path mapping:
```typescript
"@/*": ["./src/*"]
```

## Important Patterns

### Smooth Scroll & Animations

- **Lenis** is initialized in App.tsx after preloader completes
- **GSAP ScrollTrigger** is synced with Lenis via `lenis.on('scroll', ScrollTrigger.update)`
- When creating scroll animations, always use ScrollTrigger's `onUpdate` or `scrub` properties
- Lenis cleanup is handled in useEffect return

### Internationalization

- Default language: Russian (`ru`)
- Access translations with `useTranslation()` hook from `react-i18next`
- Translation keys are nested objects in locale JSON files
- Language switching updates all text instantly (no page reload needed)

### Image Management

- All car images must come from `cdn.hongqi.ru` (official Hongqi CDN)
- Use `SITE_IMAGES` constants from `src/data/siteImages.ts` for site-wide images
- Car-specific images are in the `cars.ts` data array

### Custom Cursor

- Only displays on non-touch devices
- Uses two elements: outer ring (smooth follow) and inner dot (instant follow)
- Expands on hover over interactive elements (a, button, [data-cursor-hover])
- Re-binds after navigation to capture new interactive elements

## Code Style Conventions

- Functional components with hooks (no class components)
- TypeScript strict mode enabled
- No unused locals or parameters (enforced by tsconfig)
- Prefer named exports over default exports for components (except pages and App)
- Use `const` for animation timelines and refs
- GSAP timelines should include `onComplete` cleanup when needed

## Build Notes

- Production build runs TypeScript compilation first (`tsc`), then Vite build
- Vite handles code splitting automatically
- Tailwind purges unused styles in production
- All assets are hashed for cache busting
