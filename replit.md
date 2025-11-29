# FırsatHaritası - Location-Based Deals Discovery Application

## Overview

FırsatHaritası is a mobile-first web application that helps users discover nearby stores, restaurants, and events with discounts and special offers. The application provides an iOS-native inspired experience with interactive maps, AI-powered recommendations, and gamification features. Users can explore deals in the Kocaeli/İzmit region, filter by categories and discount rates, and navigate to stores of interest.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **React 19** with TypeScript for type-safe component development
- **Vite** as the build tool and development server
- **Tailwind CSS** with custom design tokens for styling
- **shadcn/ui** component library (New York variant) for UI primitives

**Design System:**
- Mobile-first responsive design targeting touch interactions
- iOS-native aesthetic with glassmorphism effects (backdrop-blur)
- Dark/light mode theming using CSS custom properties
- Rounded corners (rounded-3xl) and smooth transitions throughout
- Z-index layering: Map (base) → Control buttons (middle) → Detail panels (top)

**Key UI Patterns:**
- Bottom sheet drawers (using Vaul library) for modals and detail views
- Floating navigation bar with glassmorphism
- Draggable panels that support summary and full-screen modes
- Carousel-based content exploration
- Animated state transitions using Framer Motion

**Routing:**
- Uses Wouter for lightweight client-side routing
- Single-page application with minimal route structure

**State Management:**
- React Query (@tanstack/react-query) for server state management
- Local React state for UI interactions
- No global state management library - component-level state suffices for current scope

### Backend Architecture

**Server Framework:**
- **Express.js** running on Node.js
- HTTP server with custom logging middleware
- RESTful API design pattern

**API Structure:**
- `GET /api/stores` - Fetch all stores with optional filtering (categories, minDiscount)
- `GET /api/stores/:id` - Fetch individual store details
- Support for query parameters: categories (array), minDiscount (number)

**Data Layer:**
- **Drizzle ORM** for type-safe database operations
- PostgreSQL dialect with prepared statements
- Schema-first approach with Zod validation

**Database Schema:**
- `users` table: Basic user authentication structure (id, username, password)
- `stores` table: Complete store information including:
  - Geographic coordinates (latitude/longitude as decimals)
  - Discount rates, categories, and ratings
  - Sponsorship flags and loyalty scores
  - Optional opening dates for "coming soon" stores
  - Timestamps for record creation

**Development Workflow:**
- Separate dev servers for client (Vite on port 5000) and API
- Vite middleware mode in development for HMR
- Custom build script using esbuild for server bundling
- Allowlist-based dependency bundling for faster cold starts

### Map Integration

**Leaflet.js Implementation:**
- Interactive map with custom tile layers (CartoDB Dark Matter/Voyager)
- Custom HTML-based markers (divIcon) replacing default pins
- Teardrop-shaped pins with category-specific Lucide icons
- User location marker with animated radar pulse effect
- Sponsored stores feature glow effects
- MapContainer with controlled flying animations for smooth navigation

**Performance Optimizations:**
- Increased keepBuffer to reduce re-renders during map movement
- Memoized marker generation
- Conditional rendering based on visibility

### AI Integration

**Google Gemini API:**
- Chatbot assistant for personalized store recommendations
- System prompt constrains responses to available store data
- Mock implementation with fallback responses in current codebase
- Designed to suggest stores based on natural language queries

**Integration Point:**
- `AiAssistantModal` component handles chat interface
- Stores passed as context to AI for relevant suggestions
- Streaming or single-response pattern (implementation ready)

### External Dependencies

**Core Libraries:**
- `@neondatabase/serverless` - Neon PostgreSQL serverless driver with WebSocket support
- `drizzle-orm` - Type-safe ORM for database operations
- `drizzle-kit` - Migration and schema management tool
- `express` - Web server framework
- `ws` - WebSocket library for Neon database connections

**Frontend UI:**
- `@radix-ui/*` - Comprehensive set of accessible UI primitives (accordion, dialog, dropdown, popover, etc.)
- `leaflet` + `@types/leaflet` - Interactive mapping library
- `react-leaflet` - React bindings for Leaflet
- `lucide-react` - Icon library for consistent iconography
- `framer-motion` - Animation library for smooth transitions
- `vaul` - Bottom drawer/sheet component library
- `embla-carousel-react` - Touch-friendly carousel
- `react-hook-form` + `@hookform/resolvers` - Form state management
- `zod` - Schema validation

**Development Tools:**
- `@replit/vite-plugin-*` - Replit-specific development plugins (cartographer, dev banner, runtime error modal)
- `tailwindcss` + `@tailwindcss/vite` - Utility-first CSS framework
- `typescript` - Type checking and compilation
- `tsx` - TypeScript execution for Node.js scripts

**API Integration:**
- `@google/genai` - Google Gemini AI SDK for chatbot functionality
- Future-ready for additional AI features

**Database:**
- PostgreSQL (expected via Neon serverless platform)
- Connection via `DATABASE_URL` environment variable
- Schema migrations managed through Drizzle Kit

**Build Process:**
- Vite for client-side bundling with code splitting
- esbuild for server-side bundling with selective dependency inclusion
- Custom build script consolidating client and server builds
- Static file serving in production mode

**Meta & SEO:**
- Custom Vite plugin for OpenGraph image URL injection
- Automatic Replit deployment domain detection
- Social media card support (Twitter, OpenGraph)