# Arquitectura del Sistema 🏗️

Este documento describe la arquitectura técnica de **MultiStream-SceneIT**.

## 🧩 Visión General

MultiStream-SceneIT es una aplicación **Modular Monolith** construida sobre [Next.js](https://nextjs.org/), aprovechando el **App Router** para unificar frontend y lógica de backend (API Routes).

### Diagrama de Alto Nivel

```mermaid
graph TD
    User[Usuario] -->|Navegador| Client[Cliente Next.js]
    
    subgraph "Frontend Layer"
        Client -->|Gestión de Estado| Store[Zustand Store]
        Client -->|Layout & Drag/Drop| Grid[React Grid Layout]
        Store -->|Persistencia| LocalStorage[Browser Storage]
    end

    subgraph "Backend Layer (Next.js API)"
        Client -->|Auth Request| AuthAPI[/api/auth/kick]
        AuthAPI -->|OAuth2| Kick[Kick.com ID]
        Kick -->|Callback| CallbackAPI[/api/auth/kick/callback]
        CallbackAPI -->|Set Cookie| BrowserCookie[HttpOnly Cookie]
    end

    subgraph "Integraciones Externas"
        Client -->|Embed Iframe| KickEmbed[Kick Stream/Chat]
        Client -->|Embed Iframe| TwitchEmbed[Twitch Stream/Chat]
        Client -->|Embed Iframe| YTEmbed[YouTube Stream/Chat]
    end
```

## 📐 Decisiones de Diseño (ADR)

### 1. Next.js App Router
Adoptamos el App Router para aprovechar los **React Server Components (RSC)** donde sea posible, aunque la naturaleza interactiva del dashboard (drag & drop) requiere un uso intensivo de **Client Components**. La estructura de rutas simplifica la creación de APIs.

### 2. Gestión de Estado: Zustand
Elegimos **Zustand** sobre Redux o Context API por:
- **Simplicidad:** API minimalista y sin boilerplate.
- **Performance:** Renderizado selectivo sin necesidad de selectores complejos.
- **Persistencia:** Middleware `persist` nativo para guardar layouts en `localStorage` sin esfuerzo.

### 3. Sistema de Layout: React Grid Layout
Para la funcionalidad core de "drag & drop" y redimensionamiento de ventanas, `react-grid-layout` es el estándar de la industria en React. Permite layouts responsivos y serializables (JSON) que guardamos en el store.

### 4. Estilos: Tailwind CSS v4 + Radix UI
- **Tailwind** permite iterar rápidamente en el diseño sin salir del HTML.
- **Radix UI** provee primitivas accesibles (Dialogs, Popovers, Sliders) sin estilos, permitiendo personalización total con Tailwind.

## 📂 Estructura del Proyecto

```bash
/
├── app/                  # Next.js App Router (Páginas y API)
│   ├── api/              # Endpoints de Backend
│   ├── layout.tsx        # Layout Raíz
│   └── page.tsx          # Página principal (Dashboard)
├── components/           # Componentes de UI
│   ├── grid/             # Componentes del Grid (SceneGrid, Items)
│   ├── stream/           # Reproductores y controles de video
│   ├── chat/             # Componentes de Chat
│   └── ui/               # Componentes base (Botones, Inputs, etc.)
├── lib/                  # Utilidades y Lógica de Negocio
│   ├── kick-auth.ts      # Lógica de OAuth con Kick
│   └── utils.ts          # Helpers generales
├── store/                # Gestión de Estado Global
│   └── useSceneStore.ts  # Store principal de escenas
└── public/               # Assets estáticos
```

## 🔄 Flujos de Datos Principales

1.  **Carga Inicial:**
    - El cliente hidrata el `useSceneStore` desde `localStorage`.
    - `SceneGrid` renderiza los items basados en el layout guardado.

2.  **Autenticación Kick:**
    - Usuario hace clic en "Conectar Kick".
    - Redirección a `https://id.kick.com/oauth/authorize`.
    - Retorno a `/api/auth/kick/callback` con `code`.
    - Servidor intercambia `code` por `access_token` y establece cookie segura.

3.  **Adición de Stream:**
    - Usuario pega URL.
    - `utils/parseStreamUrl` detecta plataforma (Kick/Twitch/YT).
    - Se añade item al store con layout por defecto.
    - `SceneGrid` actualiza y renderiza el nuevo embed.
