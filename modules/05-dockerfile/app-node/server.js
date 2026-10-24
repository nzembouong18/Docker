const http = require("http");
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/health") { res.writeHead(200); return res.end("ok"); }
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Bonjour depuis Node dans Docker", pid: process.pid }));
});

server.listen(port, () => console.log(`écoute sur ${port}`));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
