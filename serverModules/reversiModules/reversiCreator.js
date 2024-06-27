module.exports.createBoard = createBoard;
const crypto = require('crypto');
const fs = require('fs');
let boards = JSON.parse(fs.readFileSync('././private/reversiBoards.json', 'utf-8'));

function createBoard() { //Crea una partida de reversi con sus valores iniciales.
    let player1Id = crypto.randomBytes(32).toString('hex');

    let grid = [];
    for (let i = 0; i < 8; i++) {
        grid[i] = [];
        for (let j = 0; j < 8; j++) {
            grid[i][j] = ' ';
        }
    }
    grid[3][3] = 'B';
    grid[4][4] = 'B';
    grid[4][3] = 'W';
    grid[3][4] = 'W';

    let boardData = {
        board: grid,
        player1: player1Id,
        player2: '',
        boardId: crypto.randomBytes(32).toString('hex'),
        turn: player1Id,
        state: 'waiting',
        winner: '',
        creationDate: new Date().getTime()
    };
    storeBoard(boardData);
    return boardData;
}

function storeBoard(board) { //Almacena la partida en el archivo correspondiente.
    boards.push(board);
    json = JSON.stringify(boards, null, 4);
    fs.writeFile('././private/reversiBoards.json', json, 'utf-8', (err) => {
        if (err) {
            console.log(err);
        }
    });
}

