import http from "node:http";
import { exec } from "node:child_process";
import { readFileSync } from "node:fs";

// Load .env
try {
    const env = readFileSync(".env", "utf-8");
    for (const line of env.split("\n")) {
        const [key, ...vals] = line.split("=");
        if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
    }
} catch { }

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const PORT = 3002;
const OPENCLAW_TIMEOUT = 60; // seconds

/**
 * Local development proxy server for OpenClaw chat.
 * Calls `openclaw agent` CLI in WSL and returns the response.
 *
 * POST /api/chat   — chat with AI (no data sent externally)
 * POST /api/notify — user-initiated: send conversation to admin via Telegram
 */

function generateSessionId() {
    return `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function callOpenClaw(message, sessionId) {
    return new Promise((resolve, reject) => {
        // Escape message for shell (handle single quotes)
        const escaped = message.replace(/'/g, "'\\''");
        const cmd = `wsl -e bash -c "openclaw agent --local --agent public --session-id '${sessionId}' --message '${escaped}' --timeout ${OPENCLAW_TIMEOUT} 2>&1"`;

        exec(cmd, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
            // Strip ANSI escape codes
            const stripped = stdout.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
            // Remove OpenClaw CLI metadata lines (e.g. [agents/auth-profiles], timings)
            const lines = stripped.split("\n").filter((line) => {
                const trimmed = line.trim();
                if (!trimmed) return false;
                // Skip internal metadata lines
                if (trimmed.startsWith("[") && trimmed.includes("]") && !trimmed.startsWith("[!")) return false;
                if (trimmed.match(/^\d+ms$/)) return false;
                return true;
            });
            const output = lines.join("\n").trim();

            if (error && !output) {
                reject(new Error(`OpenClaw CLI error: ${stderr || error.message}`));
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

/**
 * Send a conversation log to Telegram. Returns a promise.
 */
async function sendToTelegram(text) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        throw new Error("Telegram credentials not configured");
    }

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: Number(TELEGRAM_CHAT_ID),
            text: text.slice(0, 4096),
        }),
    });

    if (!res.ok) {
        throw new Error(`Telegram API error: ${res.status}`);
    }
}

const server = http.createServer(async (req, res) => {
    // CORS headers for local dev
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === "POST" && req.url === "/api/chat") {
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

                // Limit message length
                if (message.length > 2000) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "message too long (max 2000)" }));
                    return;
                }

                const sid = sessionId || generateSessionId();

                console.log(`[chat] session=${sid} message="${message.slice(0, 50)}..."`);

                const result = await callOpenClaw(message, sid);

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                    JSON.stringify({
                        reply: result.reply,
                        sessionId: sid,
                    })
                );
            } catch (err) {
                console.error("[chat] Error:", err.message);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(
                    JSON.stringify({
                        error: "Failed to get response from AI",
                    })
                );
            }
        });
        return;
    }

    // POST /api/notify — user-initiated conversation send
    if (req.method === "POST" && req.url === "/api/notify") {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
            try {
                const { messages } = JSON.parse(body);

                if (!Array.isArray(messages) || messages.length === 0) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "messages array is required" }));
                    return;
                }

                // Format conversation for Telegram
                const lines = messages.map((m) => {
                    const icon = m.role === "user" ? "👤" : "🤖";
                    return `${icon} ${m.role}:\n${m.text}`;
                });
                const text = `💬 honjoh.dev — user sent conversation\n\n${lines.join("\n\n")}`;

                await sendToTelegram(text);

                console.log(`[notify] Conversation sent to Telegram (${messages.length} messages)`);

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ ok: true }));
            } catch (err) {
                console.error("[notify] Error:", err.message);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Failed to send notification" }));
            }
        });
        return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
    console.log(`\n🦞 OpenClaw Chat Proxy running at http://localhost:${PORT}`);
    console.log(`   POST /api/chat  { "message": "...", "sessionId": "..." }\n`);
});
