/*global variables*/

const gridContainer = document.querySelector('.grid-container');
let cards = [];
let firstCard, secondCard;
let lockBoard = false; /* lock the board when two cards are flipped */
let player1Score = 0;
let player2Score = 0;
let currentPlayer = 1;

document.querySelector(".player1-score").textContent = player1Score;
document.querySelector(".player2-score").textContent = player2Score;
updatePlayerTurn();

/*card implementation*/

fetch("cards.json")
    .then(response => response.json())
    .then((data) => {
        cards = [...data, ...data];
        shuffleCards();
        createBoard();
    });

    //makes the cards randomly generated
function shuffleCards(){
    let index = cards.length,
    tempVal,randomVal;

    while(index!==0){ /* shuffles the cards */
        /* Fisher-Yates Shuffle Algorithm */
        randomVal = Math.floor(Math.random()*index);
        index--;
        tempVal = cards[index];
        cards[index] = cards[randomVal];
        cards[randomVal] = tempVal;
    }
}

//generates the grid of cards
function createBoard(){
    for(let card of cards){
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.setAttribute('data-name', card.name);
        cardElement.innerHTML = `
            <div class="default"></div>
            <div class="reveal">
                <img class="reveal-image" src="${card.image}" />
            </div>
        `;
        gridContainer.appendChild(cardElement);
        cardElement.addEventListener('click', flipCard);
    }
}

//in the event that the users click on a card
function flipCard(){
    if(lockBoard) return;
    if (this == firstCard) return;
    this.classList.add("flipped");

    if(!firstCard){
        firstCard = this;
        return;
    }

    secondCard = this;
    lockBoard = true;
    checkForMatch();
}

function checkForMatch(){
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;
    if(isMatch){
        disableCards();
        updateScore();
        if(checkGameOver()){
            showBox(`Player ${player1Score > player2Score ? 1 : 2} wins!!`);
        }
        
    } else {
        unflipCards();
        switchPlayer();
    }
    
}

function disableCards(){
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);
    resetBoard();
}

function unflipCards(){
    setTimeout(()=>{
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetBoard();
    }, 1000);
}

function resetBoard(){
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

function updateScore(){
    if(currentPlayer === 1){
        player1Score++;
        document.querySelector(".player1-score").textContent = player1Score;
    } else {
        player2Score++;
        document.querySelector(".player2-score").textContent = player2Score;
    }
}

function switchPlayer(){
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updatePlayerTurn();
}

function updatePlayerTurn(){
    document.querySelector(".player-turn").textContent = `Player ${currentPlayer}, make your move!`;
}

function restart(){
    resetBoard();
    shuffleCards();
    player1Score = 0;
    player2Score = 0;
    currentPlayer = 1;
    document.querySelector(".player1-score").textContent = player1Score;
    document.querySelector(".player2-score").textContent = player2Score;
    gridContainer.innerHTML = "";
    createBoard();
    updatePlayerTurn();
    closeBox();
}

function checkGameOver(){
    let cards = document.querySelectorAll('.card');
    for(let card of cards){
        if(!card.classList.contains('flipped')){
            return false;
        }
    }
    return true;
}

function showBox(message) {
    document.getElementById('alert-message').textContent = message;
    document.getElementById('custom-alert').style.display = 'block';
}

function closeBox() {
    document.getElementById('custom-alert').style.display = 'none';
}

















