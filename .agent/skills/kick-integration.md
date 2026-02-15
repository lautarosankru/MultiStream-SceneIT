---
name: Kick Integration
description: Comprehensive guide and reference for integrating with the Kick.com API.
---

# Kick API Integration Guide

## 1. Overview
- **Identity/OAuth Server:** `https://id.kick.com`
- **API Base URL:** `https://api.kick.com`
- **Documentation Version:** Public API v1

## 2. Authentication (OAuth 2.1)
Kick uses OAuth 2.1. All API requests must be authenticated.

### Endpoints
- **Authorize:** `GET https://id.kick.com/oauth/authorize`
- **Token:** `POST https://id.kick.com/oauth/token`
- **Revoke:** `POST https://id.kick.com/oauth/revoke`
- **Introspect:** `POST https://id.kick.com/oauth/introspect`

### Token Types
1.  **Client Credentials (App Token)**
    - Used for server-to-server communication to access public data (e.g., getting channel info).
    - **Grant Type:** `client_credentials`
    - **Requires:** `client_id`, `client_secret`, `scope`.

2.  **Authorization Code (User Token)**
    - Used to act on behalf of a user (e.g., sending chat messages).
    - **Grant Type:** `authorization_code`
    - **Requires:** PKCE (Proof Key for Code Exchange).

## 3. Scopes
| Scope | Description |
| :--- | :--- |
| `user:read` | View user information. |
| `channel:read` | View channel information. |
| `channel:write` | Update channel metadata. |
| `chat:write` | Send chat messages. |
| `moderation:ban` | Ban/Unban users. |
| `events:subscribe` | Subscribe to events. |

## 4. Key Endpoints

### Channels
- **Get Channel:** `GET /public/v1/channels/{slug}`
  - Headers: `Authorization: Bearer <token>`
- **Update Channel:** `PATCH /public/v1/channels`

### Users
- **Get User:** `GET /public/v1/users/{id}` (or `me` if ID omitted)

### Chat
- **Send Message:** `POST /public/v1/chat`
  - Body: `{ "broadcaster_user_id": 123, "content": "..." }`

### Livestreams
- **Get Info:** `GET /public/v1/livestreams/{slug}`

## 5. Implementation Notes
- Always handle token expiration and refreshing (if using user tokens).
- App tokens are short-lived? Check response `expires_in`.
- Data is wrapped in `{ "data": ... }`.
