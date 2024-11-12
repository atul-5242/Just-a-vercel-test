const WebSocket = require('ws');

let clients = [];

// WebSocket server within the Vercel function
module.exports = (req, res) => {
  if (req.method === 'GET') {
    // Use WebSocket server within Vercel's serverless environment
    const server = new WebSocket.Server({ noServer: true });

    server.on('connection', (ws) => {
      clients.push(ws);

      ws.on('message', (message) => {
        // Broadcast message to all connected clients
        clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      });

      ws.on('close', () => {
        clients = clients.filter((client) => client !== ws);
      });
    });

    // Upgrade the request to WebSocket if possible
    req.socket.server.on('upgrade', (request, socket, head) => {
      server.handleUpgrade(request, socket, head, (ws) => {
        server.emit('connection', ws, request);
      });
    });

    res.status(200).end('WebSocket server is running.');
  } else {
    res.status(405).send('Method not allowed.');
  }
};

