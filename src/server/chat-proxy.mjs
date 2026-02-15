import http from "node:http";
import { exec } from "node:child_process";

const PORT = 3001;
const OPENCLAW_TIMEOUT = 60; // seconds

/**
 * Local development proxy server for OpenClaw chat.
 * Calls `openclaw agent` CLI in WSL and returns the response.
 *
 * POST /api/chat
 * Body: { "message": "hello", "sessionId": "optional-session-id" }
 * Response: { "reply": "...", "sessionId": "..." }
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

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
    console.log(`\n🦞 OpenClaw Chat Proxy running at http://localhost:${PORT}`);
    console.log(`   POST /api/chat  { "message": "...", "sessionId": "..." }\n`);
});
