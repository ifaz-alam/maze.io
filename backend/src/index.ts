import express, { Express, Request, Response } from "express";
import { WebSocket, WebSocketServer } from "ws";
import http from "http";

const PORT: number = Number(process.env.PORT);

const app: Express = express();

app.get("/", (req: Request, res: Response) => {
    res.send("Hello from HTTP server");
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Track connected clients
let connectedClients = new Set<WebSocket>();
let numClientsInGame = 0;

function broadcastOnlineStats() {
    const numConnectedClients: number = connectedClients.size;

    for (const client of connectedClients) {
        if (client?.readyState === client.OPEN) {
            client.send(JSON.stringify({ type: "html", id: "online-count", value: numConnectedClients }));
            client.send(JSON.stringify({ type: "html", id: "ingame-count", value: numClientsInGame }));
        }
    }
}

wss.on("connection", (ws: WebSocket) => {
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
    };
});

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
