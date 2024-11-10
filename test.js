const https = require('https');
const fs = require('fs');
const socketIO = require('socket.io');

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/io.miku.us/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/io.miku.us/fullchain.pem')
};

const server = https.createServer(options, (req, res) => {
    res.writeHead(200);
    res.end('Hello, secure world!');
});

const io = socketIO(server);

io.on('connection', socket => {
    console.log('Client connected');
});

server.listen(3000, () => {
    console.log('Server running on https://io.miku.us:3000');
});