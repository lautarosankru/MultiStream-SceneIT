# Referencia de API 📡

Documentación de los endpoints de la API interna para la autenticación y lógica de servidor.

## Autenticación (Kick)

### 1. Iniciar Flujo OAuth
Redirige al usuario a la página de autorización de Kick.

- **URL:** `/api/auth/kick`
- **Método:** `GET`
- **Parámetros:** Ninguno
- **Respuesta:** Redirección 302 a `id.kick.com`

---

### 2. Callback OAuth
Maneja el retorno de Kick tras la autorización del usuario. Intercambia el código temporal por tokens.

- **URL:** `/api/auth/kick/callback`
- **Método:** `GET`
- **Query Params:**
  - `code` (string, requerido): Código de autorización temporal.
  - `state` (string, requerido): Token CSRF para validación.
  - `error` (string, opcional): Mensaje de error si la auth falló.

**Comportamiento Exitoso:**
1. Valida `state` contra cookie `kick_auth_state`.
2. Intercambia `code` por `access_token` y `refresh_token`.
3. Obtiene información del usuario (`/api/v1/users`).
4. Establece cookies seguras `HttpOnly`.
5. Redirige a `/`.

**Respuestas de Error:**
- Redirección a `/?error=invalid_state` si el CSRF falla.
- Redirección a `/?error=token_exchange_failed` si el código es inválido.

## Notas de Seguridad

- Los tokens de acceso (`access_token`) y actualización (`refresh_token`) se almacenan **exclusivamente** en cookies `HttpOnly` y `Secure` (en producción).
- El cliente (browser) **no tiene acceso directo** a estos tokens vía JavaScript para prevenir ataques XSS.
