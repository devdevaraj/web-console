import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { io, Socket } from "socket.io-client";
import "@xterm/xterm/css/xterm.css";
import { DefaultEventsMap } from "socket.io";

function TerminalComponent() {
 const terminalRef = useRef<HTMLDivElement | null>(null);
 const socket = useRef<Socket<DefaultEventsMap, DefaultEventsMap>>(io(import.meta.env.VITE_BASE_URL));
 const term = useRef<Terminal | null>(null);

 useEffect(() => {
  if (!terminalRef.current) return;

  term.current = new Terminal({
   cursorBlink: true,
   theme: { background: "black", foreground: "white" }
  });

  const fitAddon = new FitAddon();
  term.current.loadAddon(fitAddon);
  term.current.open(terminalRef.current!);
  fitAddon.fit();

  socket.current.on("terminal-data", data => {
   term.current?.write(data);
  });
  term.current.onData((data) => {
   socket.current.emit("input", data);
  });

  window.addEventListener("resize", () => fitAddon.fit());

  return () => {
   term.current?.dispose();
   socket.current.disconnect();
  }
 }, []);

 return (
  <div ref={terminalRef} style={{ width: "100vw", height: "100vh" }}></div>
 );
}

export default TerminalComponent;