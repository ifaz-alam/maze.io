import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import * as url from "url"; // For parsing the URL to get query parameters
const jwt = require("jsonwebtoken");

function onSocketError(err: any) {
    console.error(err);
}

const broadcastOnlineStats = () => {
    const numConnectedClients: number = connectedClients.size;

    for (const client of connectedClients) {
        if (client?.readyState === client.OPEN) {
            client.send(JSON.stringify({ type: "html", id: "online-count", value: numConnectedClients }));
            client.send(JSON.stringify({ type: "html", id: "ingame-count", value: numClientsInGame }));
        }
    }
};

const PORT: number = Number(process.env.PORT);
const app = require("./app");

const server = http.createServer(app);

// We will manually handle the HTTP upgrade request from the client so that we can introduce custom authentication.
const wss = new WebSocketServer({ server });

// Track connected clients
let connectedClients = new Set<WebSocket>();
let numClientsInGame = 0;

wss.on("connection", (ws: WebSocket) => {
    console.log("HI", ws);
    connectedClients.add(ws);
    console.log("New WebSocket connection. Total online:", connectedClients.size);
    broadcastOnlineStats();

    ws.on("message", (message) => {});

    ws.on("close", () => {
        connectedClients.delete(ws);
        console.log("WebSocket disconnected. Total online:", connectedClients.size);
        broadcastOnlineStats();
    });

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        broadcastOnlineStats();
    };
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
            console.log("Server closed");
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error: any) => {
    console.error(error);
    exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
    console.info("SIGTERM received");
    if (server) {
        server.close();
    }
});

// Authenticate and serialize user with Json Web Tokens.
const activeUsers: Set<string> = new Set();
app.post("/login", (req: any, res: any) => {
    const MAX_USERNAME_LENGTH: number = 16;
    const username: string = ((req.body.username as string) || "").slice(0, MAX_USERNAME_LENGTH).trim();
    const isValidUsername: boolean = !!username && /^[a-zA-Z0-9_]+$/.test(username);

    if (!isValidUsername)
        return res.status(400).json({ error: "This username was not accepted. Please provide a username with alphanumeric characters only." });
    if (!username) return res.status(400).json({ error: "No username was given. Please provide a non-empty username." });
    if (activeUsers.has(username)) return res.status(409).json({ error: "This username has been taken. Please try another username." });

    activeUsers.add(username);
    console.log(`User ${username} has logged in.`);

    const userObject = { user: username };
    const accessToken = jwt.sign(userObject, process.env.ACCESS_TOKEN_SECRET);
    return res.json({ accessToken });
});
