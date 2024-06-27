module.exports.addPlayer2EmptyBoard = addPlayer2EmptyBoard;
module.exports.searchBoardById = searchBoardById;
const fs = require('fs');
const crypto = require('crypto');

function addPlayer2EmptyBoard(game,id) { //Añade al segundo jugador a una partida pasada por id, y en caso de no existir la partida o esta estar completa retorna un error.
    const boards = JSON.parse(fs.readFileSync('././private/' + game + 'Boards.json', 'utf-8'));
    let emptyBoard = boards.find(element => element.boardId === id);
    if (emptyBoard !== undefined && emptyBoard.player2 === "") {
        let player2Id = crypto.randomBytes(32).toString('hex');
        emptyBoard.player2 = player2Id;
        emptyBoard.state = "ready";
        let json = JSON.stringify(boards, null, 4);
        fs.writeFile('././private/' + game + 'Boards.json', json, 'utf-8', (err) => {
            if (err) {
                console.log(err);
            }
        });
        return emptyBoard;
    }
    else if (emptyBoard === undefined){
        return 'missing';
    } else {
        return 'full';
    }
}

function searchBoardById(game, id) { //Busca una partida por una id.
    const boards = JSON.parse(fs.readFileSync('././private/' + game + 'Boards.json', 'utf-8'));
    let res = boards.find(element => element.boardId === id);
    if (res === undefined){
        return 'error'; 
    }
    return res;
}