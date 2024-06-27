module.exports.updateBoard = updateBoard;

const B = 'B';
const W = 'W';
const fs = require('fs');
let boards = JSON.parse(fs.readFileSync('././private/reversiBoards.json', 'utf-8'));

function updateTurn(boardData) { //Actualizacion del turno.
    if (boardData.turn == boardData.player1) {
        boardData.turn = boardData.player2;
    } else {
        boardData.turn = boardData.player1;
    }
}

function updateBoard(boardData) { //Actualizacion de la informacion de la mesa.
    let boardToFind = boards.find(element => element.boardId === boardData.boardId);
    let i = boards.indexOf(boardToFind);
    let validPos = rulesApplication(boardData.posX, boardData.posY, boards[i]);
    if (validPos) {
        if (boards[i].turn == boards[i].player1){
            boards[i].board[boardData.posX][boardData.posY] = B;
        } else {
            boards[i].board[boardData.posX][boardData.posY] = W;
        }
        let res;
        if (boards[i].turn == boards[i].player1) {
            res = isMatchOver(boards[i], W);
        } else {
            res = isMatchOver(boards[i], B);
        }
        if (!res.finish) {
            updateTurn(boards[i]);
        } else {
            boards[i].state = 'finished';
            boards[i].winner = res.winner;
        }
        json = JSON.stringify(boards, null, 4);
        fs.writeFile('././private/reversiBoards.json', json, 'utf-8', (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
    return validPos;
}

function rulesApplication(posX, posY, board) { //Verificacion y colocacion de la nueva pieza.
    let posNewPiece = {x: posX, y: posY};
    let posBoardNewPiece = checkPositionOnBoard(posNewPiece);
    let newPiece;
    if (board.turn == board.player1){
        newPiece = B;
    } else {
        newPiece = W;
    }
    let validPos = checkAdjacent(newPiece, posNewPiece, posBoardNewPiece, board.board, true);
    return validPos;
}

function checkPositionOnBoard(posNewPiece) { //Devuelve la posicion relativa en el tablero dependiendo la posicion de la pieza.
    if (posNewPiece.x == 0) { //caso de que el click se efectuo arriba en la tabla.
        switch (posNewPiece.y) {
            case 0: return 'top left';  //clickee arriba izquierda.
            case 7: return 'top right'; //clickee arriba derecha.
            default: return 'top'; //clickee arriba.
        }
    }
    else {
        if (posNewPiece.x == 7) { //caso de que el click se efectuo abajo en la tabla.
            switch (posNewPiece.y) {
                case 0: return 'bottom left'; //clickee abajo izquierda.
                case 7: return 'bottom right'; //clickee abajo derecha.
                default: return 'bottom'; //clickee abajo.
            }
        }
        else { //si no clickee ni arriba ni abajo.
            switch (posNewPiece.y) {
                case 0: return 'left'; //clickee a la izquierda.
                case 7: return 'right'; //clickee a la derecha.
                default: return 'middle'; //clickee entre medio.
            }
        }
    }
}
function checkAdjacent(newPiece, posNewPiece, posBoardNewPiece, board, wantToConvert) { //checkea adjacentes dependiendo de donde se encuentra colocada en la mesa la nueva ficha.
    let validPos = false;
    switch (posBoardNewPiece) {
        case 'top': { //si estoy posicionado arriba, en la primer fila pero no en una esquina.
            let pos1 = searchAdjacent(newPiece, posNewPiece, board, 0, 1, wantToConvert); // right
            let pos2 = searchAdjacent(newPiece, posNewPiece, board, 1, 1, wantToConvert); // diagonal right bottom
            let pos3 = searchAdjacent(newPiece, posNewPiece, board, 1, 0, wantToConvert); // bottom
            let pos4 = searchAdjacent(newPiece, posNewPiece, board, 1, -1, wantToConvert);  // diagonal bottom left
            let pos5 = searchAdjacent(newPiece, posNewPiece, board, 0, -1, wantToConvert); // left
            validPos = (pos1 || pos2 || pos3 || pos4 || pos5);
            return validPos;
        }
        case 'top left': { //si estoy posicionado en la esquina arriba a la izquierda.
            let pos1 = searchAdjacent(newPiece, posNewPiece, board, 0, 1, wantToConvert); // right
            let pos2 = searchAdjacent(newPiece, posNewPiece, board, 1, 1, wantToConvert); // diagonal right bottom
            let pos3 = searchAdjacent(newPiece, posNewPiece, board, 1, 0, wantToConvert); // bottom
            validPos = (pos1 || pos2 || pos3);
            return validPos;
        }
        case 'top right': { //si estoy posicionado en la esquina arriba a la derecha.
            let pos1 = searchAdjacent(newPiece, posNewPiece, board, 1, 0, wantToConvert); // bottom
            let pos2 = searchAdjacent(newPiece, posNewPiece, board, 1, -1, wantToConvert); // diagonal bottom left
            let pos3 = searchAdjacent(newPiece, posNewPiece, board, 0, -1, wantToConvert); // left
            validPos = (pos1 || pos2 || pos3);
            return validPos;
        }
        case 'bottom': { //si estoy posicionado abajo, en la ultima fila pero no en una esquina.
            let pos1 = searchAdjacent(newPiece, posNewPiece, board, -1, 0, wantToConvert); // top
            let pos2 = searchAdjacent(newPiece, posNewPiece, board, -1, 1, wantToConvert); // diagonal top right
            let pos3 = searchAdjacent(newPiece, posNewPiece, board, 0, 1, wantToConvert); // right
            let pos4 = searchAdjacent(newPiece, posNewPiece, board, 0, -1, wantToConvert); // left
            let pos5 = searchAdjacent(newPiece, posNewPiece, board, -1, -1, wantToConvert); // diagonal left top
            validPos = (pos1 || pos2 || pos3 || pos4 || pos5);
            return validPos;
        }
        case 'bottom right': { //si estoy posicionado en la esquina abajo a la derecha.
            let pos1 = searchAdjacent(newPiece, posNewPiece, board, -1, 0, wantToConvert); // top
            let pos2 = searchAdjacent(newPiece, posNewPiece, board, 0, -1, wantToConvert); // left
            let pos3 = searchAdjacent(newPiece, posNewPiece, board, -1, -1, wantToConvert); // diagonal left top
            validPos = (pos1 || pos2 || pos3);
            return validPos;
        }
        case 'bottom left': { //si estoy posicionado en la esquina abajo a la izquierda.
            let pos1 = searchAdjacent(newPiece, posNewPiece, board, -1, 0, wantToConvert); // top
            let pos2 = searchAdjacent(newPiece, posNewPiece, board, -1, 1, wantToConvert); // diagonal top right
            let pos3 = searchAdjacent(newPiece, posNewPiece, board, 0, 1, wantToConvert); // right
            validPos = (pos1 || pos2 || pos3);
            return validPos;
        }
        case 'left': { //si estoy posicionado a la izquierda, en la primer columna pero no en una esquina.
            let pos1 = searchAdjacent(newPiece, posNewPiece, board, -1, 0, wantToConvert); // top
            let pos2 = searchAdjacent(newPiece, posNewPiece, board, -1, 1, wantToConvert); // diagonal top right
            let pos3 = searchAdjacent(newPiece, posNewPiece, board, 0, 1, wantToConvert); // right
            let pos4 = searchAdjacent(newPiece, posNewPiece, board, 1, 1, wantToConvert); // diagonal right bottom
            let pos5 = searchAdjacent(newPiece, posNewPiece, board, 1, 0, wantToConvert); // bottom
            validPos = (pos1 || pos2 || pos3 || pos4 || pos5);
            return validPos;
        }
        case 'right': { //si estoy posicionado a la derecha, en la ultima columna pero no en una esquina.
            let pos1 = searchAdjacent(newPiece, posNewPiece, board, -1, 0, wantToConvert); // top
            let pos2 = searchAdjacent(newPiece, posNewPiece, board, 1, 0, wantToConvert); // bottom
            let pos3 = searchAdjacent(newPiece, posNewPiece, board, 1, -1, wantToConvert); // diagonal bottom left
            let pos4 = searchAdjacent(newPiece, posNewPiece, board, 0, -1, wantToConvert); // left
            let pos5 = searchAdjacent(newPiece, posNewPiece, board, -1, -1, wantToConvert); // diagonal left top
            validPos = (pos1 || pos2 || pos3 || pos4 || pos5);
            return validPos;
        }
        case 'middle': { //si estoy posicionado en el medio, rodeado completamente de casillas.
            let pos1 = searchAdjacent(newPiece, posNewPiece, board, -1, 0, wantToConvert); // top
            let pos2 = searchAdjacent(newPiece, posNewPiece, board, -1, 1, wantToConvert); // diagonal top right
            let pos3 = searchAdjacent(newPiece, posNewPiece, board, 0, 1, wantToConvert); // right
            let pos4 = searchAdjacent(newPiece, posNewPiece, board, 1, 1, wantToConvert); // diagonal right bottom
            let pos5 = searchAdjacent(newPiece, posNewPiece, board, 1, 0, wantToConvert); // bottom
            let pos6 = searchAdjacent(newPiece, posNewPiece, board, 1, -1, wantToConvert); // diagonal bottom left
            let pos7 = searchAdjacent(newPiece, posNewPiece, board, 0, -1, wantToConvert); // left
            let pos8 = searchAdjacent(newPiece, posNewPiece, board, -1, -1, wantToConvert); // diagonal left top
            validPos = (pos1 || pos2 || pos3 || pos4 || pos5 || pos6 || pos7 || pos8);
            return validPos;
        }
    }
}
function searchAdjacent(newPiece, posNewPiece, board, x, y, wantToConvert) { //Verifica si el adyacente es del color contrario al de la pieza a colocar.
    if (board[posNewPiece.x + x][posNewPiece.y + y] != newPiece && board[posNewPiece.x + x][posNewPiece.y + y] != ' ') {
        return searchLine(newPiece, posNewPiece, board, x, y, wantToConvert);
    }
    else {
        return false;
    }
}
function searchLine(newPiece, posNewPiece, board, x, y, wantToConvert) { //Recorre con el desplazamiento X e Y la linea en busca de una pieza del mismo color a la que se quiere colocar.
    let found = false;
    let blank = false;
    let posSearchX = posNewPiece.x + x; //me muevo al adyacente en x
    let posSearchY = posNewPiece.y + y; // me muevo al adyacente en y
    let count = 0;
    while (!(posSearchX < 0 || posSearchX > 7 || posSearchY < 0 || posSearchY > 7) && !(found) && !(blank)) {
        if (board[posSearchX][posSearchY] == newPiece) {
            found = true;
        }
        else {
            if (board[posSearchX][posSearchY] !== ' ') {
                count++;
                posSearchX = posSearchX + x;
                posSearchY = posSearchY + y;
            }
            else {
                blank = true;
            }
        }
    }
    if (found && !(blank)) {
        if (wantToConvert)
            convertLine(newPiece, posNewPiece, board, x, y, count);
        return true;
    }
    else {
        return false;
    }
}

function convertLine(newPiece, posNewPiece, board, x, y, count) { //Convierte la linea al color requerido.
    let posX = posNewPiece.x;
    let posY = posNewPiece.y;
    for (let i = 0; i < count; i++) {
        posX = posX + x;
        posY = posY + y;
        board[posX][posY] = newPiece;
    }
}


function pieceCounter(board) { //Cuenta por color la cantidad de piezas en el tablero.
    let json = { B: 0, W: 0 };
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] == B) {
                json.B++;
            } else if (board[i][j] == W) {
                json.W++;
            }
        }
    }
    return json;
}

function boardIsFull(board) { //Verifica si el tablero contiene espacios libres.
    let i = 0, j = 0, ok = true;
    while (i < board.length && ok) {
        while (j < board[i].length && ok) {
            if (board[i][j] == ' ') {
                ok = false;
            }
            j++;
        }
        i++;
    }
    return ok;
}

function canPieceBePlaced(board, piece) { //Retorna verdadero o falso segun si la pieza puede ser colocada correctamente en la posicion requerida.
    let validPos = false;
    for (let i = 0; i < board.length && !validPos; i++) {
        for (let j = 0; j < board[i].length && !validPos; j++) {
            if (board[i][j] == ' ') {
                pos = { x: i, y: j };
                let posOnBoard = checkPositionOnBoard(pos);
                validPos = checkAdjacent(piece, pos, posOnBoard, board, false);
            }
        }
    }
    return validPos;
}

function isMatchOver(boardData, piece) { //Si se cumplen las condiciones para el final de la partida, se declara el ganador.
    let res = { finish: false, winner: "" };
    if (boardIsFull(boardData.board) || !canPieceBePlaced(boardData.board, piece)) {
        let pieces = pieceCounter(boardData.board);
        if (pieces.W > pieces.B) {
            res.winner = boardData.player2;
        } else if (pieces.B > pieces.W) {
            res.winner = boardData.player1;
        } else {
            res.winner = "draw";
        }
        res.finish = true;
    }
    return res;
}