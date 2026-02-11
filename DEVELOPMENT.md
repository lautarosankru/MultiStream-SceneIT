# Guía de Desarrollo 🛠️

¡Bienvenido al equipo de **MultiStream-SceneIT**! Sigue estos pasos para configurar tu entorno local y contribuir al proyecto.

## 📋 Prerrequisitos

- **Node.js:** v18.17.0 o superior (Recomendado v20 LTS).
- **Gestor de Paquetes:** `npm`, `pnpm` o `bun`.
- **Git:** Para control de versiones.

## 🚀 Configuración del Entorno

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/lautarosankru/MultiStream-SceneIT.git
   cd MultiStream-SceneIT
   ```

2.  **Variables de Entorno:**
    Copia el archivo de ejemplo (si existe) o crea un `.env.local` en la raíz del proyecto:

    ```bash
    # Kick Auth
    KICK_CLIENT_ID=tu_client_id_kick
    KICK_CLIENT_SECRET=tu_client_secret_kick
    
    # App URL
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```

3.  **Instalar dependencias:**

    ```bash
    npm install
    ```

## 💻 Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo en `http://localhost:3000`. |
| `npm run build` | Compila la aplicación para producción. |
| `npm run start` | Inicia el servidor de producción (requiere `build` previo). |
| `npm run lint` | Ejecuta ESLint para verificar calidad de código. |

## 📐 Estándares de Código

- **Commits:** Usamos [Conventional Commits](https://www.conventionalcommits.org/).
  - `feat`: Nuevas características.
  - `fix`: Corrección de bugs.
  - `docs`: Cambios en documentación.
  - `style`: Formateo, espacios, etc (sin cambios de lógica).
  - `refactor`: Refactorización de código.
  
- **Estilos:**
  - Usamos **Tailwind CSS** para estilado.
  - Sigue la convención de ordenamiento de clases de Tailwind (plugin `prettier-plugin-tailwindcss` recomendado).

- **Estructura de Componentes:**
  - Componentes pequeños y reutilizables en `components/ui`.
  - Componentes de lógica de negocio en `components/[feature]`.
  - Evita prop drilling excesivo; usa `useSceneStore` para estado global compartido.

## 🧪 Testing

Actualmente el proyecto no cuenta con una suite de tests automatizada exhaustiva. Se recomienda probar manualmente los flujos críticos:
1. Autenticación con Kick.
2. Añadir/Eliminar streams.
3. Guardado y carga de layout (persistencia).
