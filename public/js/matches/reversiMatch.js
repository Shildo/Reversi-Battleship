const TIME = 1;
const myId = sessionStorage.getItem('myId');
var clicked = false;

function initialize(gameId){ //Inicializacion de cartel.
    let msg = document.getElementById('message');
    msg.textContent = 'Apreta el boton para copiar el codigo de la partida y pasarselo a tu rival';
    let button = document.createElement('button');
    button.id = 'code';
    button.textContent = "Copiar código";
    let div = document.getElementById('match');
    button.onclick = function() {
        navigator.clipboard.writeText(gameId);
        alert('Ha copiado el codigo');
    };
    div.appendChild(button);
    waiting();
}
function verify(){ //Verificacion si el jugador que intenta ingresar a la partida es uno de los 2 que deben jugar o añadir jugador en caso de faltar 1.
    let gameId = window.location.href;
    let array = gameId.split('/');
    const http = new XMLHttpRequest();
    http.open("POST", window.location.href);
    http.onreadystatechange = function () {
        if (this.readyState == 4 ){
            if (this.status == 200){
                let boardData = JSON.parse(this.response);
                if(boardData.player2 != "" && boardData.player1 != myId && boardData.player2 != myId){
                    window.location.href = "/error-full";
                }
                else{
                    if(boardData.player2 == "" && boardData.player1 != myId){
                        addPlayer2(array[4]);
                    }
                    initialize(array[4]);
                }
            } else {
                expiredTime();
            }
        }
    }
    http.setRequestHeader("Content-Type", "application/json");
    http.send();
}
function addPlayer2(gameId){ // Peticion para añadir al jugador nuevo.
    const http = new XMLHttpRequest();
    http.open("POST", '/reversi/join');
    http.onreadystatechange = function(){
        if (this.readyState == 4) {
            if (this.status == 200){
                let res = JSON.parse(this.response);
                window.sessionStorage.setItem('myId', res.playerId);
                window.location.href = '/reversi/'+res.gamePage;
            } else {
                let res = JSON.parse(this.response);
                if (res.error == 'missing'){
                    window.location.href = '/error-missing'
                } else {
                    window.location.href = '/error-full';
                }
            }
        }
    }
    http.setRequestHeader('Content-Type', 'application/json');
    http.send(JSON.stringify({id: gameId}));
}
function waiting() { //Espera que ingresen todos los jugadores a la partida.
    const http = new XMLHttpRequest();
    http.open("POST", window.location.href);
    http.onreadystatechange = function () {
        let boardData;
        if (this.readyState == 4){
            if (this.status == 200) {
                boardData = JSON.parse(this.response);
                if (boardData.state == 'waiting') {
                    setTimeout(() => { waiting() }, TIME * 1000);
                } else {
                    removeButton();
                    setPlayer(boardData);
                    updateBoardAndTurn(boardData, true);
                }
            } else {
                expiredTime();
            }
        }
    }
    http.setRequestHeader("Content-Type", "application/json");
    http.send();
}

function setPlayer(boardData) { // Actualizacion de cartel segun la id del jugador.
    label = document.getElementById('player');
    if (myId == boardData.player1) {
        label.textContent = 'Usted juega con fichas Negras.'
    }
    else {
        label.textContent = 'Usted juega con fichas Blancas.'
    }
}

function updateBoardAndTurn(boardData, ok) { 
    setTurn(boardData);
    drawBoard(boardData, ok);
}

function setTurn(boardData) { // Actualizacion del turno segun id.
    let h1 = document.getElementById('message');
    if (boardData.turn == boardData.player1) {
        h1.textContent = 'Turno fichas negras';
    }
    else {
        h1.textContent = 'Turno fichas blancas';
    }
    if(myId == boardData.turn){
        clicked = false;
    }
    if (boardData.turn == myId) {
        document.getElementById('board').classList.remove('wait');
    }
    else {
        document.getElementById('board').classList.add('wait');
    }
}

function drawBoard(boardData, ok) { //Grafica el tablero segun la informacion que se obtiene del servidor.
    boardDiv = document.getElementById('board');

    removeChildren(boardDiv);

    let i;
    let j;
    for (i = 0; i < boardData.board.length; i++) {
        for (j = 0; j < boardData.board[i].length; j++) {
            let cell = document.createElement('div');
            cell.textContent = boardData.board[i][j];
            cell.textContent != ' ' ? cell.classList.add('bussy') : cell.classList.add('empty');
            if (boardData.board[i][j] != " ") {
                var piece = document.createElement('span');
                piece.classList.add('piece');
                cell.appendChild(piece);
                boardData.board[i][j] == "B" ? piece.classList.add('black') : piece.classList.add('white');
            }
            let json = { row: i, column: j };
            cell.id = JSON.stringify(json);
            cell.classList.add('cell');
            cell.addEventListener('click', function handleClick(event) {
                if (boardData.turn == myId) {
                    if (this.textContent !== " ") {
                        alert('No puedes colocar una pieza en un espacio ocupado');
                    }
                    else{
                        if(!clicked){
                            clicked = true;
                            let position = JSON.parse(cell.id);
                            if (myId == boardData.player1) {
                                boardData.board[position.row][position.column] = 'B';
                            }
                            else {
                                boardData.board[position.row][position.column] = 'W';
                            }
                        }
                        else{
                            alert('No puedes colocar mas de una pieza');
                        }
                        if (ok){
                            let pos = JSON.parse(cell.id);
                            patch(boardData.boardId, pos.row, pos.column);
                        }
                    }
                }
            });
            boardDiv.appendChild(cell);
        }
    }
    if (ok){
        const http = new XMLHttpRequest();
        http.open("POST", window.location.href);
        http.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    let data = JSON.parse(this.response);
                    if (data.state != "finished") {
                        setTimeout(() => { updateBoardAndTurn(data, true) }, TIME * 1000);
                    } else {
                        endMatch(data);
                    }
                } else {
                    expiredTime();
                }
            }
        }
        http.setRequestHeader('Content-Type', 'application/json');
        http.send();
    }
   }

function patch(id, x, y) { // Peticion PATCH de la posicion de la ficha nueva para poder verificarla en el servidor y actualizar los datos del tablero.
    const http = new XMLHttpRequest();
    http.open("PATCH", window.location.href);
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 400) {
            alert('La posicion no es valida, intente de nuevo.');
            clicked = false;
        }
    }
    http.setRequestHeader('Content-Type', 'application/json');
    let data = {boardId: id, posX: x, posY: y};
    http.send(JSON.stringify(data));
}

function removeChildren(element) {
    while (element.firstChild != null) {
        element.removeChild(element.firstChild);
    }
}

function endMatch(boardData) { // Muestra mensajes sobre quien gano.

    updateBoardAndTurn(boardData, false);

    let board = document.getElementById('board');
    if (board.classList.contains('wait')){
        board.classList.remove('wait');
    }

    let body = document.getElementById('body');
    let div = document.createElement('div');
    div.classList.add('endMessage');

    div.style.backgroundColor = "#502e02";

    if (boardData.winner == myId) {
        div.style.color = "#90EE90"
        div.style.textShadow = "1px 1px 2px #808080"
        div.textContent = "GANASTE";
    }
    else {
        if (boardData.winner != 'draw') {
            div.style.color = "#fd4347"
            div.style.textShadow = "1px 1px 2px black"
            div.textContent = "PERDISTE"
        }
        else {
            div.style.color = "#5D6AB9"
            div.style.textShadow = "1px 1px 2px black"
            div.textContent = "EMPATE"
        }
    }

    body.appendChild(div);

    let button = document.createElement('button');
    button.textContent = 'Volver al menú';
    button.classList.add('botoncito');
    button.onclick = function(){window.location.href='/reversi'}; 

    body.appendChild(button);

    setTimeout(() => {deleteMatch(boardData.boardId)}, TIME * 5000);
}

function deleteMatch(boardId) { //Peticion DELETE para borrar la partida del archivo una vez terminada.
    const http = new XMLHttpRequest();
    http.open("DELETE", window.location.href);
    http.setRequestHeader('Content-Type', 'application/json');
    http.send(JSON.stringify({id: boardId}));
}

function expiredTime(){
    let div = document.getElementById('match');
    while (div.firstChild != null){
        div.removeChild(div.firstChild);
    }
    let h1 = document.createElement('h1');
    h1.id = 'expirationMessage';
    h1.textContent = 'Lo sentimos, la partida ha expirado...';
    div.appendChild(h1);
}

function removeButton(){
    let div = document.getElementById('match');
    let button = document.getElementById('code');
    div.removeChild(button);
}