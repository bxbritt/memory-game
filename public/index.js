const gridContainer = document.querySelector('.grid-container');
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let player1Score = 0;
let player2Score = 0;
let currentPlayer = 1;
let myPlayerNumber = null;

const socket = io();

// Display initial scores
document.querySelector(".player1-score").textContent = player1Score;
document.querySelector(".player2-score").textContent = player2Score;
updatePlayerTurn();

// Fetch and set up cards
fetch("cards.json")
    .then(response => response.json())
    .then((data) => {
        socket.emit("initializeGame", data);
    })
    .catch(error => console.error("Error loading cards:", error));

// Get assigned player number
socket.on("playerNumber", (number) => {
    myPlayerNumber = number;
    updatePlayerTurn();
});

// Listen for board setup from server
socket.on("setBoard", (gameState) => {
    cards = gameState.cards;
    player1Score = gameState.scores[1];
    player2Score = gameState.scores[2];
    currentPlayer = gameState.currentPlayer;
    updateScores();
    updatePlayerTurn();
    createBoard();
});

// Create card grid
function createBoard() {
    gridContainer.innerHTML = "";
    cards.forEach((card, i) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.setAttribute('data-name', card.name);
        cardElement.dataset.index = i;
        cardElement.innerHTML = `
            <div class="default"></div>
            <div class="reveal">
                <img class="reveal-image" src="${card.image}" />
            </div>
        `;
        gridContainer.appendChild(cardElement);
        cardElement.addEventListener('click', flipCard);
    });
}

// Handle card flip
function flipCard() {
    if (lockBoard || this.classList.contains("flipped")) return;
    if (myPlayerNumber !== currentPlayer) return; // Prevent other player from clicking

    this.classList.add("flipped");

    if (!firstCard) {
        firstCard = this;
    } else {
        secondCard = this;
        lockBoard = true;
        socket.emit("flipCard", {
            firstIndex: firstCard.dataset.index,
            secondIndex: secondCard.dataset.index
        });
    }
}

// Sync flipped cards
socket.on("cardFlipped", ({ firstIndex, secondIndex }) => {
    document.querySelector(`[data-index='${firstIndex}']`).classList.add("flipped");
    document.querySelector(`[data-index='${secondIndex}']`).classList.add("flipped");
});

// Handle match result and update scores immediately
socket.on("matchResult", ({ match, scores, nextPlayer, firstIndex, secondIndex }) => {
    if (match) {
        firstCard.removeEventListener("click", flipCard);
        secondCard.removeEventListener("click", flipCard);
        updateScores(scores);
        resetBoard(); // Unlock board immediately so player can continue their turn
    } else {
        setTimeout(() => {
            document.querySelector(`[data-index='${firstIndex}']`).classList.remove("flipped");
            document.querySelector(`[data-index='${secondIndex}']`).classList.remove("flipped");
            currentPlayer = nextPlayer;
            updatePlayerTurn();
            resetBoard(); // Unlock board AFTER switching turn
        }, 1000);
    }
});

// **NEW: Sync scores immediately across both screens**
socket.on("updateScores", (scores) => {
    updateScores(scores);
});

// Update score display immediately
function updateScores(scores) {
    player1Score = scores[1];
    player2Score = scores[2];
    document.querySelector(".player1-score").textContent = player1Score;
    document.querySelector(".player2-score").textContent = player2Score;
}

// Update player turn display
function updatePlayerTurn() {
    document.querySelector(".player-turn").textContent = `Player ${currentPlayer}, make your move!`;
    lockBoard = myPlayerNumber !== currentPlayer; // Lock board for non-active player
}

// Restart game
function restart() {
    resetBoard();
    socket.emit("restartGame");
}

// Sync restart
socket.on("gameRestarted", (newGameState) => {
    player1Scaore = newGameState.scores[1];
    player2Score = newGameState.scores[2];
    currentPlayer = newGameState.currentPlayer;

    updateScores({ 1: player1Score, 2: player2Score });
    updatePlayerTurn();
    gridContainer.innerHTML = "";
    cards = newGameState.cards;
    createBoard();
});

// Reset card state
function resetBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

// Show winner dialog box
function showWinner(winner) {
    const alertBox = document.getElementById("custom-alert");
    const alertMessage = document.getElementById("alert-message");
    alertMessage.textContent = `Player ${winner} wins!`;
    alertBox.style.display = "block";
}

// Close the winner dialog box
function closeBox() {
    document.getElementById("custom-alert").style.display = "none";
}

// Listen for winner announcement from server
socket.on("announceWinner", (winner) => {
    showWinner(winner);
});
