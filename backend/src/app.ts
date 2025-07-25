import express, { Express, Request, response, Response } from "express";
const helmet = require("helmet");
const cors = require("cors");

const app: Express = express();

// Enable cors
app.use(
    cors({
        origin: "*",
    })
);
// Set security HTTP headers
app.use(helmet());

// Parse json request body
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello from HTTP server");
});

module.exports = app;
