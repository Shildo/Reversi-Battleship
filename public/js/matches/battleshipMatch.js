const TIME = 1;
const myId = sessionStorage.getItem('myId');

var drags = document.querySelectorAll('.draggable');
var Table;
let shipDetails = [{ name: "carrier", length: 5 },
{ name: "battleship", length: 4 },
{ name: "cruiser", length: 3 },
{ name: "destroyer", length: 3 },
{ name: "frigate", length: 2 }];
var dragged;
var playerBoards;
var boardData;
var clicked;

function initialize(gameId) { //Inicializacion de cartel.
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

function verify() { //Verificacion si el jugador que intenta ingresar a la partida es uno de los 2 que deben jugar o añadir jugador en caso de faltar 1.
    let gameId = window.location.href;
    let array = gameId.split('/');
    const http = new XMLHttpRequest();
    http.open("POST", window.location.href);
    http.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                boardData = JSON.parse(this.response);
                if (boardData.player2 != "" && boardData.player1 != myId && boardData.player2 != myId) {
                    window.location.href = "/error-full";
                }
                else {
                    if (boardData.player2 == "" && boardData.player1 != myId) {
                        addPlayer2(array[4]);
                    }
                    initialize(array[4]);
                }
            } else {
                expiredMatch();
            }
        }
    }
    http.setRequestHeader("Content-Type", "application/json");
    http.send();
}

function addPlayer2(gameId) { // Peticion para añadir al jugador nuevo.
    const http = new XMLHttpRequest();
    http.open("POST", '/battleship/join');
    http.onreadystatechange = function () {
        if (this.readyState == 4){ 
            if (this.status == 200) {
                let res = JSON.parse(this.response);
                window.sessionStorage.setItem('myId', res.playerId);
                window.location.href = '/battleship/' + res.gamePage;
            } else {
                let res = JSON.parse(this.response);
                if (res.error == 'missing') {
                    window.location.href = '/error-missing'
                } else {
                    window.location.href = '/error-full';
                }
            }
        }
    }
    http.setRequestHeader('Content-Type', 'application/json');
    http.send(JSON.stringify({ id: gameId }));
}
function waiting() { //Espera que ingresen todos los jugadores a la partida.
    const http = new XMLHttpRequest();
    http.open("POST", window.location.href);
    http.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                boardData = JSON.parse(this.response);
                if (boardData.state == 'waiting') {
                    setTimeout(() => { waiting() }, TIME * 1000);
                } else {
                    if (myId == boardData.player1) {
                        haveShips = verifyShips(boardData.boardShipsPlayer1);
                    }
                    else {
                        haveShips = verifyShips(boardData.boardShipsPlayer2);
                    }
                    if ((boardData.state == "ready") && !(haveShips)) {
                        removeButton();
                        initiateMatch(boardData);
                    } else {
                        removeButton();
                        setPlayer(boardData);
                        let msg = document.getElementById('message');
                        msg.textContent = 'Esperando que el rival coloque sus barcos...';
                        waitingShips();
                    }
                }
            } else {
                expiredMatch();
            }
        }
    }
    http.setRequestHeader("Content-Type", "application/json");
    http.send();
}

function shipWaiting() { //Peticion POST al servidor de los datos de la partida para saber cuando cambia el turno de colocar los barcos.
    let http = new XMLHttpRequest();
    http.open("POST", window.location.href);
    http.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                boardData = JSON.parse(this.response);
                if (!isMyTurn(boardData)) {
                    setTimeout(() => { shipWaiting() }, TIME * 1000);
                } else {
                    let self = document.querySelector('.self');
                    self.classList.remove('battlefield_wait');
                    let h1 = document.getElementById('message');
                    h1.textContent = h1.textContent = "Coloque sus barcos en la tabla y haga click para girarlos sobre el tablero.";
                }
            } else {
                expiredMatch();
            }
        }
    }
    http.setRequestHeader('Content-Type', 'application/json');
    http.send();
}


function initiateMatch(boardData) { //Inicializacion de partida con dibujos de tablero y barcos con drag.
    setPlayer(boardData);
    playerBoards = myBoards(boardData);

    let self = document.createElement('div');
    self.classList.add("battlefield-table-placeholder", "self");

    let enemy = document.createElement('div');
    enemy.classList.add("battlefield-table-placeholder", "enemy");

    let container = document.getElementById('battlefields-container');
    container.appendChild(self);
    container.appendChild(enemy);
    drawBoard(self, false, playerBoards.boardShips);
    drawBoard(enemy, true, playerBoards.boardAttack);

    Table = self.querySelector('.battlefield-table');
    enemy.classList.add('battlefield_wait')
    createShips();
    let h1 = document.getElementById('message');
    if (isMyTurn(boardData)) {
        h1.textContent = "Coloque sus barcos en la tabla y haga click para girarlos sobre el tablero.";
    } else {
        self.classList.add('battlefield_wait');
        h1.textContent = "Espere su turno para colocar barcos.";
    }

    shipWaiting();
}

function setPlayer(boardData) { //Actualiza al jugador por id.
    label = document.getElementById('player');
    if (myId == boardData.player1) {
        label.textContent = 'Usted es el jugador 1.'
    }
    else {
        label.textContent = 'Usted es el jugador 2.'
    }
}

function drawBoard(container, enemy, board) { //Dibujado del tablero.
    var table = document.createElement('table');
    table.classList.add("battlefield-table");
    for (let i = 0; i < board.length; i++) {
        var newTr = document.createElement("tr");
        newTr.classList.add("battlefield-row");
        for (let j = 0; j < board[i].length; j++) {
            var newTd = document.createElement("td");
            newTd.classList.add("battlefield-cell", "empty");
            var newDiv = document.createElement("div");
            newDiv.classList.add("battlefield-cell-content");
            newDiv.setAttribute('data-x', i);
            newDiv.setAttribute('data-y', j);
            if (board[i][j] != 'X') {
                newDiv.textContent = board[i][j];
            }
            if (enemy) {
                if (newDiv.textContent !== ' ') {
                    setClass(newTd, newDiv.textContent);
                } else {
                    newDiv.addEventListener('click', function handleClick(event) {
                        if (!clicked) {
                            clicked = true;
                            if (boardData.turn == myId) {
                                if (myId == boardData.player1) {
                                    boardData.boardAttackPlayer1[i][j] = 'X';
                                }
                                else {
                                    boardData.boardAttackPlayer2[i][j] = 'X';
                                }
                                patch({ x: i, y: j, state: boardData.state, boardId: boardData.boardId });
                            }
                        } else {
                            alert('No puedes declarar mas de un ataque.');
                        }
                    })
                }
            }
            else {
                if (newDiv.textContent !== ' ') {
                    setClass(newTd, newDiv.textContent);
                }
                addEventsDragNDrop(newDiv, { i, j });
            }
            //Indices
            var marker_col = document.createElement("div");
            marker_col.classList.add("marker", "marker__col");
            marker_col.textContent = j + 1;
            var marker_row = document.createElement("div");
            marker_row.classList.add("marker", "marker__row");
            marker_row.textContent = (String.fromCharCode('A'.charCodeAt(0) + i));
            0 === j && newDiv.appendChild(marker_row);
            0 === i && newDiv.appendChild(marker_col);

            newTd.appendChild(newDiv);
            newTr.appendChild(newTd);
        }
        table.appendChild(newTr);
    }
    container.appendChild(table);
}

function setClass(cell, text) {
    if (shipDetails.some(ship => ship.name == text || ship.name + ' T' == text || ship.name + ' S' == text)) {
        cell.classList.remove('empty')
        cell.classList.add('ship-cell');
    } else {
        if (text == "HIT") {
            cell.classList.add('hit');
        } else if (text == "MISS") {
            cell.classList.add('miss');
        }
    }
    if (cell.classList.contains('ship-cell')) {
        if (text.slice(-1) == "T") {
            cell.classList.add('hit');
        }
        else if (text.slice(-1) == "S") {
            cell.classList.add('sunk');
        }
    }
}

//Crea los barcos con sus respectivas clases en el puerto.
function createShips() {
    let port = document.createElement('div');
    port.classList.add('port');
    for (let i = 0; i < shipDetails.length; i++) {
        let newDiv = document.createElement('div');
        newDiv.classList.add("ship", "draggable");
        newDiv.setAttribute('length', shipDetails[i].length);
        newDiv.setAttribute('name', shipDetails[i].name);
        newDiv.id = i;
        newDiv.setAttribute('position', "h");
        newDiv.draggable = true;
        port.appendChild(newDiv);
    }
    let container = document.getElementById("battlefields-container");
    container.appendChild(port);
    const draggables = document.querySelectorAll('.draggable');
    addEventsToShips(draggables);
}

// Agrega los eventos dragStart, dragEnd y la función de rotar a los barcos. 
function addEventsToShips(ships) {
    ships.forEach(draggable => {
        draggable.addEventListener('dragstart', e => {
            dragged = draggable;
            e.dataTransfer.setData("Text", e.target.id);
            e.dataTransfer.setDragImage(draggable, 0, 0);
            draggable.classList.add('dragging');
            setTimeout(() => {
                draggable.style.display = 'none';
            }, 0);
            if (draggable.classList.contains('placed')) {
                if (draggable.getAttribute('position') == 'h') {
                    toTableH(parseInt(draggable.parentElement.getAttribute('data-x')), parseInt(draggable.parentElement.getAttribute('data-y')), 'remove', parseInt(draggable.getAttribute('length')), null);
                }
                else {
                    toTableV(parseInt(draggable.parentElement.getAttribute('data-x')), parseInt(draggable.parentElement.getAttribute('data-y')), 'remove', parseInt(draggable.getAttribute('length')), null);
                }
            }
        });

        draggable.addEventListener('dragend', () => {
            setTimeout(() => {
                draggable.style.display = 'block';

            }, 0)
            draggable.classList.remove('dragging');
        });

        draggable.addEventListener('click', function handleClick(event) {
            if (draggable.classList.contains('placed')) {
                if (draggable.getAttribute('position') == 'h') {
                    if (draggable.parentElement.getAttribute('data-x') <= 10 - draggable.getAttribute('length') &&
                        verifyPosition(parseInt(draggable.parentElement.getAttribute('data-x')), parseInt(draggable.parentElement.getAttribute('data-y')), 'v', draggable.getAttribute('length'))) {
                        draggable.setAttribute('position', "v");
                        toTableH(parseInt(draggable.parentElement.getAttribute('data-x')), parseInt(draggable.parentElement.getAttribute('data-y')), 'remove', parseInt(draggable.getAttribute('length')), null);
                        toTableV(parseInt(draggable.parentElement.getAttribute('data-x')), parseInt(draggable.parentElement.getAttribute('data-y')), 'add', parseInt(draggable.getAttribute('length')));
                    }
                } else {
                    if (draggable.parentElement.getAttribute('data-y') <= 10 - draggable.getAttribute('length') &&
                        verifyPosition(parseInt(draggable.parentElement.getAttribute('data-x')), parseInt(draggable.parentElement.getAttribute('data-y')), 'h', draggable.getAttribute('length'))) {
                        draggable.setAttribute('position', "h");
                        toTableV(parseInt(draggable.parentElement.getAttribute('data-x')), parseInt(draggable.parentElement.getAttribute('data-y')), 'remove', parseInt(draggable.getAttribute('length')));
                        toTableH(parseInt(draggable.parentElement.getAttribute('data-x')), parseInt(draggable.parentElement.getAttribute('data-y')), 'add', parseInt(draggable.getAttribute('length')), null);
                    }
                }
            }
        });
    });
}

function updateBoardAndTurn(boardData) { //Actualiza el tablero y los turnos con la nueva informacion.
    removeChildren(document.getElementById("battlefields-container"));
    playerBoards = myBoards(boardData);
    let self = document.createElement('div');
    self.classList.add("battlefield-table-placeholder", "self");
    let enemy = document.createElement('div');
    enemy.classList.add("battlefield-table-placeholder", "enemy");
    let container = document.getElementById('battlefields-container');
    container.appendChild(self);
    container.appendChild(enemy);
    drawBoard(self, false, playerBoards.boardShips);
    drawBoard(enemy, true, playerBoards.boardAttack);
    setTurn(boardData);
    waitingShips();
}

function setTurn(boardData) { //Actualiza el turno de los jugadores.
    let h1 = document.getElementById('message');
    if (isMyTurn(boardData)) {
        h1.textContent = 'Es tu turno, declare ataque.';

        document.querySelector(".enemy").classList.remove('battlefield_wait');
        document.querySelector(".self").classList.add('battlefield_wait');
    }
    else {
        h1.textContent = 'Es turno del oponente, espere a que realice su ataque. '
        document.querySelector(".self").classList.remove('battlefield_wait');
        document.querySelector(".enemy").classList.add('battlefield_wait');
    }
    if (myId == boardData.turn) {
        clicked = false;
    }
}

//Asigna a cada jugador sus tableros.
function myBoards(boardData) {
    if (boardData.player1 == myId) {
        return { boardShips: boardData.boardShipsPlayer1, boardAttack: boardData.boardAttackPlayer1 };
    }
    else {
        return { boardShips: boardData.boardShipsPlayer2, boardAttack: boardData.boardAttackPlayer2 };
    }
}

//Agrega los eventos a las celdas de la tabla para posicionar los barcos.
function addEventsDragNDrop(element, position) {

    element.addEventListener('dragover', e => {
        e.preventDefault();
    });

    element.addEventListener('dragenter', () => {
        let limit = 10 - dragged.getAttribute('length');
        if (dragged.getAttribute('position') == 'h') {
            if (position.j <= limit) {
                if (Table.rows[position.i].cells[position.j].classList.contains('empty') && verifyPosition(position.i, position.j, 'h', dragged.getAttribute('length'))) {
                    toTableH(position.i, position.j, 'paint', dragged.getAttribute('length'), 'rgba(143, 255, 0)');
                }
                else {
                    toTableH(position.i, position.j, 'paint', dragged.getAttribute('length'), 'rgba(170, 12, 72)');
                }
            }
            else {
                toTableH(position.i, position.j, 'border-error', dragged.getAttribute('length'), 'rgba(255, 0, 0)');
            }
        }
        else {
            if (position.i <= limit) {
                if (Table.rows[position.i].cells[position.j].classList.contains('empty') && verifyPosition(position.i, position.j, 'v', dragged.getAttribute('length'))) {
                    toTableV(position.i, position.j, 'paint', dragged.getAttribute('length'), 'rgba(143, 255, 0)');
                }
                else {
                    toTableV(position.i, position.j, 'paint', dragged.getAttribute('length'), 'rgba(170, 12, 72)');
                }
            }
            else {
                toTableV(position.i, position.j, 'border-error', dragged.getAttribute('length'), 'rgba(255, 0, 0)');
            }
        }
    });

    element.addEventListener('dragleave', () => {
        let limit = 10 - dragged.getAttribute('length');
        if (dragged.getAttribute('position') == 'h') {
            if (position.j <= limit) {
                toTableH(position.i, position.j, 'paint', dragged.getAttribute('length'), 'rgba(0, 0, 0, 0)');
            }
            else {
                toTableH(position.i, position.j, 'border-error', dragged.getAttribute('length'), 'rgba(0, 0, 0, 0)');
            }
        }
        else {
            if (position.i <= limit) {
                toTableV(position.i, position.j, 'paint', dragged.getAttribute('length'), 'rgba(0, 0, 0, 0)');
            }
            else {
                toTableV(position.i, position.j, 'border-error', dragged.getAttribute('length'), 'rgba(0, 0, 0, 0)');
            }
        }
    });

    element.addEventListener('drop', e => {
        e.preventDefault();
        let id = e.dataTransfer.getData("Text");
        let draggeded = document.getElementById(id);
        let limit = 10 - dragged.getAttribute('length');

        if (draggeded.getAttribute('position') == 'h') {
            if (position.j <= limit && verifyPosition(position.i, position.j, 'h', draggeded.getAttribute('length'))) {
                toTableH(position.i, position.j, 'add', draggeded.getAttribute('length'));
                draggeded.classList.add('placed');
                element.append(draggeded)
                ready();
            }
            else {
                for (let i = 0; i < 10 - position.j; i++) {
                    Table.rows[position.i].cells[position.j + i].firstChild.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                }
            }
        }
        else {
            if (position.i <= limit && verifyPosition(position.i, position.j, 'v', draggeded.getAttribute('length'))) {
                toTableV(position.i, position.j, 'add', draggeded.getAttribute('length'));
                draggeded.classList.add('placed');
                element.append(draggeded);
                ready();
            }
            else {
                for (let i = 0; i < 10 - position.i; i++) {
                    Table.rows[position.i + i].cells[position.j].firstChild.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                }
            }
        }
    });
}

//Modifica la tabla verticalmente. Agrega colores y clases dependiendo la acción que es pasada por parametro.
function toTableV(x, y, action, length, color) {
    switch (action) {
        case 'add':
            for (let i = 0; i < length; i++) {
                Table.rows[x + i].cells[y].firstChild.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                Table.rows[x + i].cells[y].classList.remove('empty');
                Table.rows[x + i].cells[y].classList.add('bussy');
            }
            break;
        case 'remove':
            for (let i = 0; i < length; i++) {
                Table.rows[x + i].cells[y].firstChild.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                Table.rows[x + i].cells[y].classList.remove('bussy');
                Table.rows[x + i].cells[y].classList.add('empty');
            }
            break;
        case 'paint':
            for (let i = 0; i < length; i++) {
                Table.rows[x + i].cells[y].firstChild.style.backgroundColor = color;
            };
            break;
        case 'border-error':
            for (let i = 0; i < 10 - x; i++) {
                Table.rows[x + i].cells[y].firstChild.style.backgroundColor = color;
            }
            break;
    }
}

//Modifica la tabla horizontalmente. Agrega colores y clases dependiendo la acción que es pasada por parametro.
function toTableH(x, y, action, length, color) {
    switch (action) {
        case 'add':
            for (let i = 0; i < length; i++) {
                Table.rows[x].cells[y + i].firstChild.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                Table.rows[x].cells[y + i].classList.remove('empty');
                Table.rows[x].cells[y + i].classList.add('bussy');
            }
            break;
        case 'remove':
            for (let i = 0; i < length; i++) {
                Table.rows[x].cells[y + i].firstChild.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                Table.rows[x].cells[y + i].classList.remove('bussy');
                Table.rows[x].cells[y + i].classList.add('empty');
            }
            break;
        case 'paint':
            for (let i = 0; i < length; i++) {
                Table.rows[x].cells[y + i].firstChild.style.backgroundColor = color;
            };
            break;
        case 'border-error':
            for (let i = 0; i < 10 - y; i++) {
                Table.rows[x].cells[y + i].firstChild.style.backgroundColor = color;
            }
    }
}

//Verifica que a lo largo del barco seleccionado no haya posiciones ocupadas.
function verifyPosition(x, y, position, length) {
    switch (position) {
        case 'v':
            for (let i = 1; i < length; i++) {
                if (Table.rows[x + i].cells[y].classList.contains('bussy')) {
                    return false;
                }
            }
            return true;
        case 'h':
            for (let i = 1; i < length; i++) {
                if (Table.rows[x].cells[y + i].classList.contains('bussy')) {
                    return false;
                }
            }
            return true;
    }
}

function isMyTurn(boardData) {
    if (boardData.turn == myId) {
        return true;
    } else {
        return false;
    }
}

function verifyShips(boardShips) {
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

function ready() {
    let port = document.querySelector('.port');
    if (port.childElementCount == 0) {
        document.getElementById('button').disabled = false;
    }
}

// Al comenzar guarda las posiciones de los barcos en la tabla del jugador y las envía al servidor.
// Deja al jugador que envió los barcos en espera a que el jugador contrario envíe sus barcos.
function start() {
    document.getElementById('button').remove();

    document.querySelectorAll('.ship').forEach(element => {
        let x = parseInt(element.parentElement.getAttribute('data-x'));
        let y = parseInt(element.parentElement.getAttribute('data-y'));
        if (element.getAttribute('position') == 'h') {
            for (let i = 0; i < element.getAttribute('length'); i++) {
                playerBoards.boardShips[x][y + i] = element.getAttribute('name');
            }
        }
        else {
            for (let i = 0; i < element.getAttribute('length'); i++) {
                playerBoards.boardShips[x + i][y] = element.getAttribute('name');
            }
        }
    });

    if (boardData.player1 == myId) {
        boardData.boardShipsPlayer1 = playerBoards.boardShips;
    } else {
        boardData.boardShipsPlayer2 = playerBoards.boardShips;
    }

    document.querySelector(".self").style.pointerEvents = "none";
    patch(boardData);
    let container = document.getElementById("battlefields-container");
    removeChildren(container);
    let h1 = document.getElementById('message');
    h1.textContent = 'Esperando que el rival coloque sus barcos...';
    setTimeout(() => { waitingShips() }, TIME * 1000);
}


function patch(data) {
    const http = new XMLHttpRequest();
    http.open("PATCH", window.location.href);
    http.setRequestHeader('Content-Type', 'application/json');
    http.send(JSON.stringify(data));
}

function waitingShips() { //Espera que los barcos sean colocados por los jugadores.
    let http = new XMLHttpRequest();
    http.open("POST", window.location.href);
    http.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                boardData = JSON.parse(this.response);
                if (boardData.state !== "inGame" && boardData.state !== "finished") {
                    setTimeout(() => { waitingShips() }, TIME * 1000);
                } else {
                    if (boardData.state !== "finished") {
                        setTimeout(() => { updateBoardAndTurn(boardData) }, TIME * 1000);
                    } else {
                        endMatch(boardData);
                    }
                }
            } else {
                expiredMatch();
            }
        }
    }
    http.setRequestHeader('Content-Type', 'application/json');
    http.send();
}


function removeChildren(element) {
    while (element.firstChild != null) {
        element.removeChild(element.firstChild);
    }
}

function endMatch(boardData) {
    let match = document.getElementById('match');
    removeChildren(match);
    let body = document.getElementById('body');
    let message = document.getElementById('endMessage');
    if (boardData.winner == myId) {
        body.style.backgroundColor = "#90EE90";
        message.style.color = "#000000"
        message.style.textShadow = "1px 1px 2px #808080"
        message.textContent = "GANASTE";
    }
    else {
        body.style.backgroundColor = "#ff0000";
        message.style.color = "#8b0000"
        message.style.textShadow = "1px 1px 2px black"
        message.textContent = "PERDISTE"
    }
    setTimeout(() => { deleteMatch() }, TIME * 5000);
}

function deleteMatch() {
    const http = new XMLHttpRequest();
    http.open("DELETE", window.location.href);
    http.setRequestHeader('Content-Type', 'application/json');
    http.send(JSON.stringify({ id: boardData.boardId }));
}

function expiredMatch() {
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