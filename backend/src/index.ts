import express, { Express, Request, Response } from "express";

const PORT: string = process.env.PORT as string;

const app: Express = express();
app.get("/", (req: Request, res: Response) => {
    res.send("Hello from the b");
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
