import express from "express";
import http from "http";
// import { WebSocketServer } from "ws";
import { Server } from "socket.io";
import os from "os";
import pty from "node-pty";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

// Configs
dotenv.config();
const port = process.env.PORT || 3000;
const shell = os.platform() === "win32" ? "poweshell.exe" : "bash";

// Inits
const app = express();
const server = http.createServer(app);
// const wss = new WebSocketServer({ server, perMessageDeflate: false });
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});
app.use(morgan("combined"));
app.use(cors());
// {
//  origin: [
//    "http://127.0.0.1:5173",
//    "ws://127.0.0.1:5173",
//    "http://127.0.0.1:3000",
//    "ws://127.0.0.1:3000",
//  ],
// }
app.use(express.static(path.resolve("./dist")));

io.on("connection", (ws) => {
  console.log("Connected");

  const terminal = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env,
  });

  terminal.onData((data) => {
    ws.emit("terminal-data", data);
  });

  ws.on("input", (msg) => {
    console.log(msg);
    terminal.write(msg);
  });

  ws.on("disconnect", () => {
    console.log("Closed");
    terminal.kill();
  });
});

app.listen(port, (error) => {
  if (error) return console.log(error);
  console.log(`>Server started on port ${port}`);
});
