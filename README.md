# MultiStream-SceneIT 🎬

**Tu centro de comando para streaming profesional.**

MultiStream-SceneIT es una plataforma de gestión de escenas y dashboards para streamers, permitiendo visualizar y organizar múltiples fuentes de video (Kick, Twitch, YouTube) y chats en un layout totalmente personalizable.

## 🚀 Propuesta de Valor

- **Multi-Plataforma:** Integra streams de Kick, Twitch y YouTube en una sola pantalla.
- **Layouts Flexibles:** Sistema de grilla (Drag & Drop) para organizar tu espacio de trabajo.
- **Modo Cine/Edición:** Alterna entre configurar tu setup y disfrutar del contenido sin distracciones.
- **Integración Nativa con Kick:** Autenticación OAuth y soporte para chat y stream.
- **Persistencia Local:** Tu configuración se guarda automáticamente en tu navegador.

## 🛠 Tech Stack

- **Frontend:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/)
- **Estado:** [Zustand](https://github.com/pmndrs/zustand) (con persistencia local)
- **Grid System:** `react-grid-layout`
- **Iconos:** Lucide React

## ⚡ Quick Start

### Prerrequisitos

- Node.js 18+
- npm, pnpm o bun

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/lautarosankru/MultiStream-SceneIT.git
    cd MultiStream-SceneIT
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    # o
    pnpm install
    ```

3.  **Configura las variables de entorno:**
    Crea un archivo `.env.local` basado en el ejemplo:
    ```bash
    KICK_CLIENT_ID=tu_client_id
    KICK_CLIENT_SECRET=tu_client_secret
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```

4.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

Visita [http://localhost:3000](http://localhost:3000) para empezar.

## 📚 Documentación

Para profundizar en la arquitectura y desarrollo:

- [Arquitectura del Sistema](./ARCHITECTURE.md)
- [Referencia de API](./API_REFERENCE.md)
- [Guía de Desarrollo](./DEVELOPMENT.md)
