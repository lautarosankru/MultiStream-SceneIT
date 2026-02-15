import { EventEmitter } from 'events';

// Global singleton to perserve state across hot reloads in dev (mostly)
// In production serverless, this won't work reliably without an external pub/sub (Redis).
// But for local dev and VPS (if running as a long-lived Node process), this is fine.

declare global {
    var kickStreamEmitter: EventEmitter | undefined;
}

export const streamEmitter = global.kickStreamEmitter || new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
    global.kickStreamEmitter = streamEmitter;
}

export const EVENTS = {
    CHAT_MESSAGE: 'chat.message.sent'
};
