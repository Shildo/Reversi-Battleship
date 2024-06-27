module.exports.updateBoard = updateBoard;

const fs = require('fs');
const touched = 'T';
const water = ' ';
const hit = 'HIT';

let boards = JSON.parse(fs.readFileSync('././private/battleshipBoards.json', 'utf-8'));

//funcion que primero verifica lo que se pone, y donde se pone para luego actualizar los datos.
function updateBoard(boardData) {
    let boardToFind = boards.find(element => element.boardId === boardData.boardId);
    let i = boards.indexOf(boardToFind);
    if (boardData.state == 'ready') {
        if (boardData.turn == boardData.player1) {
            boards[i].boardShipsPlayer1 = boardData.boardShipsPlayer1;
        } else {
            boards[i].boardShipsPlayer2 = boardData.boardShipsPlayer2;
        }
        updateTurn(boardData);
        boards[i].turn = boardData.turn;

        if (verifyShips(boards[i].boardShipsPlayer1) && verifyShips(boards[i].boardShipsPlayer2)) {
            boards[i].state = "inGame";
        }
        json = JSON.stringify(boards, null, 4);
        fs.writeFile('././private/battleshipBoards.json', json, 'utf-8', (err) => {
            if (err) {
                console.log(err);
            }
        });
        return true;
    }
    else {
        let response = rulesApplication(boardData, boards[i]);
        if (response.ok) {
            let res;
            if (boards[i].turn == boards[i].player1) {
                res = isMatchOver(boards[i].boardShipsPlayer2, boards[i].boardAttackPlayer1, boards[i].player1);
            } else {
                res = isMatchOver(boards[i].boardShipsPlayer1, boards[i].boardAttackPlayer2, boards[i].player2);
            }
            boards[i] = response.board;
            if (!res.finish) {
                updateTurn(boards[i]);
            }
            if(res.finish){
                boards[i].winner = res.winner;
                boards[i].state = 'finished';
            }
            json = JSON.stringify(boards, null, 4);
            fs.writeFile('././private/battleshipBoards.json', json, 'utf-8', (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
        return response.ok;
    }
}

//dependiendo de quien jugo, calcula todo para ese jugador y devuelve 
function rulesApplication(pos, preBoard) {
    let res;
    if (preBoard.turn == preBoard.player1) {
        res = checkBoards(preBoard.boardAttackPlayer1, preBoard.boardShipsPlayer2, pos);
        preBoard.boardAttackPlayer1 = res.attack;
        preBoard.boardShipsPlayer2 = res.ships;
    } else {
        res = checkBoards(preBoard.boardAttackPlayer2, preBoard.boardShipsPlayer1, pos);
        preBoard.boardAttackPlayer2 = res.attack;
        preBoard.boardShipsPlayer1 = res.ships;
    }
    return {ok: res.ok, board: preBoard};
}

//checkea que tiene la board de ships en donde se clickeo y se actualizan ambas boards, attack y ships
function checkBoards(attackBoard, shipBoard, posNewPiece) {
    let valid = false;
    if (shipBoard[posNewPiece.x][posNewPiece.y] != water) {
        attackBoard[posNewPiece.x][posNewPiece.y] = hit;
        shipName = shipBoard[posNewPiece.x][posNewPiece.y];
        shipBoard[posNewPiece.x][posNewPiece.y] = shipBoard[posNewPiece.x][posNewPiece.y] + ' ' + touched;
        sunkShip(attackBoard, shipBoard, shipName);
        valid = true;
    } else if (shipBoard[posNewPiece.x][posNewPiece.y] == water) {
        attackBoard[posNewPiece.x][posNewPiece.y] = 'MISS';
        shipBoard[posNewPiece.x][posNewPiece.y] = 'MISS';
        valid = true;
    }
    return { ok: valid, attack: attackBoard, ships: shipBoard };
}

//devuelve el estado de la partida, si termino o no y en caso de terminar, el ganador
function isMatchOver(shipBoard, attackBoard, playerId) {
    let res = { finish: false, winner: "" };
    let contS = 0, contA = 0;
    for (let i = 0; i < shipBoard.length; i++) {
        for (let j = 0; j < shipBoard[i].length; j++) {
            if (shipBoard[i][j] !== water && shipBoard[i][j] !== 'MISS') contS++;
            if (attackBoard[i][j] !== water && attackBoard[i][j] !== 'MISS') contA++;
        }
    }
    if (contA == contS) {
        res.finish = true;
        res.winner = playerId;
    }
    return res;
}

function verifyShips(boardShips) { //Verificar si la mesa contiene barcos.
    let i = 0;
    let j;
    let found = false;
    while (i < boardShips.length && !found) {
        j = 0;
        while (j < boardShips[i].length && !found) {
            if (boardShips[i][j] != " ") {
                found = true;
            }
            j++;
        }
        i++;
    }
    return found;
}

function sunkShip(attackBoard, shipBoard, shipName) {//Verifica si todas las partes de un determinado barco fueron golpeadas, y si es asi, cambia el estado de ese barco a hundido.
    let condition = shipName + " " + touched;
    let marked = false;
    let i;
    let j;
    i = 0;
    while (i < shipBoard.length && !(marked)) {
        j = 0;
        while (j < shipBoard[i].length && !(marked)) {
            if (shipBoard[i][j] != condition && shipBoard[i][j] == shipName) {
                marked = true;
            }
            j++;
        }
        i++;
    }
    if (!marked) {
        i = 0;
        while (i < shipBoard.length) {
            j = 0;
            while (j < shipBoard[i].length) {
                if (shipBoard[i][j] == condition) {
                    shipBoard[i][j] = shipName + " " + "S";
                    attackBoard[i][j] = shipName + " " + "S";
                }
                j++;
            }
            i++;
        }
    }
}
function updateTurn(boardData) { //Actualizacion del turno.
    if (boardData.turn == boardData.player1) {
        boardData.turn = boardData.player2;
    } else {
        boardData.turn = boardData.player1;
    }
}