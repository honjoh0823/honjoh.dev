import http from "node:http";
import { exec } from "node:child_process";
import { appendFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3001;
const OPENCLAW_TIMEOUT = 60;
const ALLOWED_ORIGINS = [
    "https://honjoh.dev",
    "https://www.honjoh.dev",
];
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5;
const LOG_FILE = join(__dirname, "chat.log");

// --- Rate limiter (in-memory, per IP) ---
const rateLimitMap = new Map();

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return true;
    }
    if (now > entry.resetAt) {
        entry.count = 1;
        entry.resetAt = now + RATE_LIMIT_WINDOW;
        return true;
    }
    entry.count++;
    return entry.count <= RATE_LIMIT_MAX;
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap) {
        if (now > entry.resetAt + RATE_LIMIT_WINDOW) rateLimitMap.delete(ip);
    }
}, 300_000);

// --- Logging ---
async function logChat(sessionId, role, message, ip) {
    const entry = JSON.stringify({
        ts: new Date().toISOString(),
        sessionId,
        role,
        message: message.slice(0, 500),
        ip,
    });
    await appendFile(LOG_FILE, entry + "\n").catch(() => { });
}

// --- Session ID ---
function generateSessionId() {
    return `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// --- OpenClaw CLI call (native, no WSL wrapper) ---
function callOpenClaw(message, sessionId) {
    return new Promise((resolve, reject) => {
        const escaped = message.replace(/'/g, "'\\''");
        const cmd = `openclaw agent --local --agent public --session-id '${sessionId}' --message '${escaped}' --timeout ${OPENCLAW_TIMEOUT} 2>&1`;

        exec(cmd, { maxBuffer: 1024 * 1024 }, (error, stdout) => {
            // Strip ANSI escape codes
            const stripped = stdout.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
            // Remove OpenClaw CLI metadata lines
            const lines = stripped.split("\n").filter((line) => {
                const trimmed = line.trim();
                if (!trimmed) return false;
                if (trimmed.startsWith("[") && trimmed.includes("]") && !trimmed.startsWith("[!")) return false;
                if (trimmed.match(/^\d+ms$/)) return false;
                return true;
            });
            const output = lines.join("\n").trim();

            if (error && !output) {
                reject(new Error(`OpenClaw CLI error: ${error.message}`));
                return;
            }
            if (!output) {
                reject(new Error("Empty response from OpenClaw"));
                return;
            }
            resolve({ reply: output });
        });
    });
}

// --- HTTP Server ---
const server = http.createServer(async (req, res) => {
    const origin = req.headers.origin || "";
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
        || req.headers["cf-connecting-ip"]
        || req.socket.remoteAddress
        || "unknown";

    // CORS
    if (ALLOWED_ORIGINS.includes(origin) || process.env.DEV_MODE === "1") {
        res.setHeader("Access-Control-Allow-Origin", process.env.DEV_MODE === "1" ? "*" : origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === "POST" && req.url === "/api/chat") {
        // Rate limit
        if (!checkRateLimit(ip)) {
            res.writeHead(429, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Too many requests. Please wait a moment." }));
            return;
        }

        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
            try {
                const { message, sessionId } = JSON.parse(body);

                if (!message || typeof message !== "string") {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "message is required" }));
                    return;
                }

                if (message.length > 2000) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "message too long (max 2000)" }));
                    return;
                }

                const sid = sessionId || generateSessionId();

                console.log(`[chat] ip=${ip} session=${sid} msg="${message.slice(0, 50)}..."`);
                await logChat(sid, "user", message, ip);

                const result = await callOpenClaw(message, sid);

                await logChat(sid, "ai", result.reply, ip);

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ reply: result.reply, sessionId: sid }));
            } catch (err) {
                console.error("[chat] Error:", err.message);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Failed to get response from AI" }));
            }
        });
        return;
    }

    // Health check
    if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
        return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🦞 OpenClaw Chat Proxy (WSL2)`);
    console.log(`   Listening on 0.0.0.0:${PORT}`);
    console.log(`   POST /api/chat  { "message": "...", "sessionId": "..." }`);
    console.log(`   GET  /health`);
    console.log(`   Allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
    if (process.env.DEV_MODE === "1") console.log("   ⚠ DEV_MODE: CORS=*");
    console.log();
});
