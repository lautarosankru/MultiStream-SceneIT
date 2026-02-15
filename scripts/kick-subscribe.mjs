import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
// Try loading .env.local first
try {
    const envLocalPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
        const envLocal = fs.readFileSync(envLocalPath, 'utf8');
        const envConfig = dotenv.parse(envLocal);
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
    }
} catch (e) {
    console.warn("Could not load .env.local", e);
}

const CLIENT_ID = process.env.KICK_CLIENT_ID;
const CLIENT_SECRET = process.env.KICK_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

// NOTE: For local dev, this MUST be an ngrok URL. 
// For production, it must be the real domain.
// Ensure we don't have double slashes
const baseUrl = APP_URL?.replace(/\/$/, '');
const WEBHOOK_URL = `${baseUrl}/api/webhooks/kick`;

async function getAppToken() {
    console.log("Getting App Token...");
    const res = await fetch('https://id.kick.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        })
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed to get token: ${txt}`);
    }

    const data = await res.json();
    console.log("Got Token!");
    return data.access_token;
}

async function subscribeToChat(token, channelId) {
    console.log(`Subscribing to chat.message.sent for channel ${channelId} -> ${WEBHOOK_URL}`);

    const res = await fetch('https://api.kick.com/public/v1/events/subscriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            event: 'chat.message.sent',
            method: 'webhook',
            webhook_url: WEBHOOK_URL,
            broadcaster_user_id: channelId
        })
    });

    if (!res.ok) {
        const txt = await res.text();
        console.error(`Subscription Failed: ${res.status} ${txt}`);
        return;
    }

    console.log("Subscription Successful!");
}

async function main() {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error("Missing credentials in .env.local");
        process.exit(1);
    }

    if (!APP_URL) {
        console.error("Missing NEXT_PUBLIC_APP_URL or APP_URL");
        process.exit(1);
    }

    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log("Usage: node scripts/kick-subscribe.mjs <channel_slug>");
        process.exit(1);
    }

    const slug = args[0];

    try {
        const token = await getAppToken();

        console.log(`Fetching info for ${slug}...`);

        // The V1 endpoint is technically /channels/{slug} or /channels?slug={slug} depending on docs version quirks.
        // Let's try the one we implemented in the route: /public/v1/channels?slug=${slug}

        const chanRes2 = await fetch(`https://api.kick.com/public/v1/channels?slug=${slug}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!chanRes2.ok) throw new Error("Failed to fetch channel info");

        const chanData = await chanRes2.json();
        const user = chanData.data[0];
        const userId = user?.broadcaster_user_id;

        if (!userId) {
            console.error("Could not find user ID for slug", slug);
            console.log("Data:", JSON.stringify(chanData, null, 2));
            return;
        }

        console.log(`Found User ID: ${userId}`);

        await subscribeToChat(token, userId);

    } catch (e) {
        console.error(e);
    }
}

main();
