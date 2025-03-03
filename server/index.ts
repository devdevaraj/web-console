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

const CONTAINER_ID = "6f09a7a9d96b";

// Configs
dotenv.config();
const port = process.env.PORT || 3000;
// const shell = os.platform() === "win32" ? "poweshell.exe" : "bash";

// Inits
const app = express();
const server = http.createServer(app);
// const wss = new WebSocketServer({ server, perMessageDeflate: false });
app.use(
  cors({
    origin: "*",
  })
);
const io = new Server(server, {
  cors: { origin: "*" },
});
app.use(morgan("combined"));
app.use(express.static(path.resolve("./dist")));

io.on("connection", (ws) => {
  console.log("Connected");

  // const terminal = pty.spawn(shell, [], {
  //   name: "xterm-color",
  //   cols: 80,
  //   rows: 24,
  //   cwd: process.env.HOME,
  //   env: process.env,
  // });

  const terminal = pty.spawn(
    "docker",
    ["exec", "-it", CONTAINER_ID, "/bin/bash"],
    {
      name: "xterm-color",
      cols: 80,
      rows: 32,
    }
  );

  terminal.onData((data) => {
    ws.emit("terminal-data", data);
  });

  ws.on("input", (msg) => {
    terminal.write(msg);
  });

  ws.on("disconnect", () => {
    console.log("Closed");
    terminal.kill();
  });
});

server.listen(port, (error: unknown) => {
  if (error) {
    console.log(error);
    return;
  }
  console.log(`>Server started on port ${port}`);
});
