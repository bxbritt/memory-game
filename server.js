const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

let games = {};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinGame', (gameId) => {
        socket.join(gameId);
        if (!games[gameId]) {
            games[gameId] = {
                players: [],
                state: {}
            };
        }
        games[gameId].players.push(socket.id);
        io.to(gameId).emit('updateGameState', games[gameId].state);
    });

    socket.on('updateGameState', (gameId, state) => {
        games[gameId].state = state;
        socket.to(gameId).emit('updateGameState', state);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        for (let gameId in games) {
            games[gameId].players = games[gameId].players.filter(id => id !== socket.id);
            if (games[gameId].players.length === 0) {
                delete games[gameId];
            }
        }
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
