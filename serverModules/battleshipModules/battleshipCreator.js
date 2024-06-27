module.exports.createBoard = createBoard;
const crypto = require('crypto');
const fs = require('fs');
let boards = JSON.parse(fs.readFileSync('././private/battleshipBoards.json', 'utf-8'));

function createBoard() { //Crea la partida de battleship con sus valores iniciales.
    let player1Id = crypto.randomBytes(32).toString('hex');

    let grid = [];
    for (let i = 0; i < 10; i++) {
        grid[i] = [];
        for (let j = 0; j < 10; j++) {
            grid[i][j] = ' ';
        }
    }

    let boardData = {
        boardShipsPlayer1: grid,
        boardShipsPlayer2: grid,
        boardAttackPlayer1: grid,
        boardAttackPlayer2: grid,
        player1: player1Id,
        player2: '',
        boardId: crypto.randomBytes(32).toString('hex'),
        turn: player1Id,
        state: 'waiting',
        winner:'',
        creationDate: new Date().getTime()
    };
    storeBoard(boardData);
    return boardData;
}

function storeBoard(board) { //Almacena la partida en el archivo correspondiente.
    boards.push(board);
    json = JSON.stringify(boards, null, 4);
    fs.writeFile('././private/battleshipBoards.json', json, 'utf-8', (err) => {
        if (err) {
            console.log(err);
        }
    });
}
