const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

const searcher = require('./serverModules/modulesInCommon/boardSearchers.js');
const boardMaker = require('./serverModules/modulesInCommon/boardCreators.js');
const gameDeleter = require('./serverModules/modulesInCommon/deleter.js');
const logic = require('./serverModules/modulesInCommon/updater.js')

app.use(express.static('public'));

app.use(express.json());

app.get('/', mainMenu); // Menu principal con acceso a los juegos.
app.get('/error-:type', error); // Pagina de error al no haber partidas disponibles.

app.get('/:game', gameMenu); // Menu principal de cada juego.
app.post('/:game/create', createMatch); // Inicializacion de partida.

app.get('/:game/create', errorCreateYJoin); //Envia a pagina de error si alguien intenta acceder al create - join manualmente. 
app.get('/:game/join', errorCreateYJoin);

app.post('/:game/join', joinMatch); // Unirse a una partida ya creada y con espacio libre.

app.get('/:game/:id', sendMatch); // Envia el HTML de la partida.
app.patch('/:game/:id', modifyBoard); // Modifica los datos de las partidas con los cambios correspondientes.
app.post('/:game/:id', manager); // Envia los datos de la partida pedida.
app.delete('/:game/:id', deleteManager); // Elimina del archivo de partidas la partida.

app.listen(port, () => { //Inicializacion del servidor.
    console.log(`Servidor abierto en el puerto ${port}`);
    console.log(`http://localhost:${port}`);
});


//menus
function mainMenu(req, res) {
    res.sendFile(path.join(__dirname, '/public/html/menus/mainMenu.html'));
}

function gameMenu(req, res) {
    res.sendFile(path.join(__dirname, '/public/html/menus/' + req.params.game + 'Menu.html'));
}

//crear las boards
function createMatch(req, res) {
    let board = boardMaker.createBoard(req.params.game);
    res.json({
        playerId: board.player1,
        gamePage: board.boardId
    });
}

//une a la partida al 2do player
function joinMatch(req, res) {
    board = searcher.addPlayer2EmptyBoard(req.params.game,req.body.id);
    if (board !== 'missing' && board !== 'full') {
        res.json({
            playerId: board.player2,
            gamePage: board.boardId
        });
    } else if (board == 'full'){
        res.status(400).json({error:'full'}); //no hay partidas disponibles
    } else {
        res.status(400).json({error:'missing'});
    }
}

//manda el html del match al request
function sendMatch(req, res) {
    res.sendFile(path.join(__dirname, '/public/html/matches/' + req.params.game + 'Match.html'));
}

//manager
function manager(req, res) {
    let board = searcher.searchBoardById(req.params.game, req.params.id);
    if (board == 'error'){
        res.sendStatus(400);
    } else {
        res.json(board);
    }
    
}

function modifyBoard(req, res) {
    if (logic.updateMatch(req.params.game, req.body)) {
        res.sendStatus(200); //se pudo y se realizo el cambio
    } else {
        res.sendStatus(400); //no se pudo hacer lo que el jugador quiso y se le devolvio el error
    }
}

//error partidas no disponibles.
function error(req, res) {
    if (req.params.type == 'missing'){
        res.sendFile(path.join(`${__dirname}/public/html/errors/matchNotFound.html`));
    } else{
        res.sendFile(path.join(`${__dirname}/public/html/errors/matchFull.html`))
    }

}

function deleteManager(req, res) {
    if (gameDeleter.deleter(req.params.game, req.body)) {
        res.sendStatus(200);
    }
}

function errorCreateYJoin(req, res){
    res.sendFile(path.join(__dirname, '/public/html/errors/errorCreateYJoin.html'));
}