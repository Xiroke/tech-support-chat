require("dotenv").config();

const WebSocket = require("ws");
const Redis = require("ioredis");

const WS_PORT = process.env.WS_PORT || 6001;

// ─── Redis ────────────────────────────────────────────────────────────────────

const redisSub = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB) || 0,
});

redisSub.on("connect", () => log("Redis connected"));
redisSub.on("error", (err) => log("Redis error: " + err.message));

// ─── Хранилище клиентов ───────────────────────────────────────────────────────

// chatClients: Map<chatId, Set<WebSocket>>
const chatClients = new Map();

// adminSockets: Set<WebSocket>
const adminSockets = new Set();

// socketMeta: Map<WebSocket, { role, chatId? }>
const socketMeta = new Map();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg) {
    console.log(`[${new Date().toISOString()}] ${msg}`);
}

function send(ws, payload) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(payload));
    }
}

// ─── Регистрация / отключение ─────────────────────────────────────────────────

function joinChat(ws, chatId) {
    const key = String(chatId);

    if (!chatClients.has(key)) {
        chatClients.set(key, new Set());
    }

    chatClients.get(key).add(ws);
    socketMeta.set(ws, { role: "user", chatId: key });
    log(`Client joined chat ${key}`);
}

function joinAdmin(ws) {
    adminSockets.add(ws);
    socketMeta.set(ws, { role: "admin" });
    log("Admin connected");
}

function disconnect(ws) {
    const meta = socketMeta.get(ws);
    if (!meta) return;
    socketMeta.delete(ws);

    if (meta.role === "admin") {
        adminSockets.delete(ws);
        log("Admin disconnected");
        return;
    }

    const { chatId } = meta;
    const sockets = chatClients.get(chatId);
    if (sockets) {
        sockets.delete(ws);
        if (sockets.size === 0) {
            chatClients.delete(chatId);
        }
    }
}

// Подписываемся на все каналы, начинающиеся с "chat:"
redisSub.psubscribe("*chat:*", (err) => {
    if (err) log("Redis psubscribe error: " + err.message);
    else log("Subscribed to pattern *chat:*");
});

// Слушаем события через pmessage
redisSub.on("pmessage", (pattern, channel, raw) => {
    try {
        const payload = JSON.parse(raw);
        const chatId = payload.chat_id;
        if (!chatId) return log(`Redis message missing chat_id on ${channel}`);

        log(`Redis → ${channel} [${payload.type}]`);
        broadcastToChat(String(chatId), payload);
    } catch (err) {
        log("Failed to parse Redis message: " + err.message);
    }
});
// ─── Рассылка ─────────────────────────────────────────────────────────────────

function broadcastToChat(chatId, payload) {
    const sockets = chatClients.get(String(chatId));
    if (sockets) {
        for (const ws of sockets) send(ws, payload);
    }
    for (const ws of adminSockets) send(ws, payload);
}

// ─── WebSocket сервер ─────────────────────────────────────────────────────────

const wss = new WebSocket.Server({ port: WS_PORT });

wss.on("listening", () => log(`WebSocket server on port ${WS_PORT}`));

wss.on("connection", (ws) => {
    // Клиент должен первым делом прислать join
    ws.once("message", (raw) => {
        let msg;
        try { msg = JSON.parse(raw); } catch { return ws.close(); }

        if (msg.type !== "join") return ws.close();

        if (msg.role === "admin") {
            joinAdmin(ws);
        } else if (msg.chat_id) {
            joinChat(ws, msg.chat_id);
        } else {
            return ws.close();
        }

        send(ws, { type: "joined" });

        ws.on("message", (raw) => {
            try {
                const m = JSON.parse(raw);
                if (m.type === "ping") send(ws, { type: "pong" });
            } catch {}
        });
    });

    ws.on("close", () => disconnect(ws));
    ws.on("error", () => disconnect(ws));
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────

function shutdown() {
    wss.close(() => { redisSub.quit(); process.exit(0); });
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);