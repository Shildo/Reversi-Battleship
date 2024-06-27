module.exports.updateMatch = updateMatch;


function updateMatch(game, boardData) {
    const gameUpdater = require('../' + game + 'Modules/' + game + 'Logic.js');
    return gameUpdater.updateBoard(boardData);
}
