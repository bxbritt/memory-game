const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

let players = {};
let gameState = { cards: [], currentPlayer: 1, scores: { 1: 0, 2: 0 } };

// Shuffle function
function shuffleCards(array) {
    let shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Handle connections
io.on("connection", (socket) => {
    console.log("A player connected:", socket.id);

    // Assign players
    if (!players[1]) {
        players[1] = socket.id;
        socket.emit("playerNumber", 1);
    } else if (!players[2]) {
        players[2] = socket.id;
        socket.emit("playerNumber", 2);
        io.emit("setBoard", gameState);
    } else {
        socket.emit("gameFull");
        return;
    }

    // Initialize the game with cards
    socket.on("initializeGame", (data) => {
        gameState.cards = shuffleCards([...data, ...data]);
        io.emit("setBoard", gameState);
    });

    // Handle card flip
    socket.on("flipCard", ({ firstIndex, secondIndex }) => {
        io.emit("cardFlipped", { firstIndex, secondIndex });

        let firstCard = gameState.cards[firstIndex];
        let secondCard = gameState.cards[secondIndex];

        if (firstCard.name === secondCard.name) {
            gameState.scores[gameState.currentPlayer]++;
            io.emit("updateScores", gameState.scores); // Send updated scores immediately
            io.emit("matchResult", {
                match: true,
                scores: gameState.scores,
                nextPlayer: gameState.currentPlayer,
                firstIndex,
                secondIndex
            });
            checkGameEnd(); // Check if the game has ended
        } else {
            gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
            setTimeout(() => {
                io.emit("matchResult", {
                    match: false,
                    scores: gameState.scores,
                    nextPlayer: gameState.currentPlayer,
                    firstIndex,
                    secondIndex
                });
            }, 1000);
        }
    });

    // Restart game
    socket.on("restartGame", () => {
        gameState.scores = { 1: 0, 2: 0 };
        gameState.currentPlayer = 1;
        io.emit("gameRestarted", gameState);
    });

    // Check for game end and announce winner
    function checkGameEnd() {
        const totalCards = gameState.cards.length / 2;
        const player1Score = gameState.scores[1];
        const player2Score = gameState.scores[2];

        if (player1Score + player2Score === totalCards) {
            const winner = player1Score > player2Score ? 1 : 2;
            io.emit("announceWinner", winner);
        }
    }

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("A player disconnected:", socket.id);
        if (players[1] === socket.id) delete players[1];
        if (players[2] === socket.id) delete players[2];
        io.emit("playerDisconnected");
    });
});

// Start server
const PORT = process.env.PORT || 5500;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
