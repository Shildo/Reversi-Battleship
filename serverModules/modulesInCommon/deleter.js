module.exports.deleter = deleter;
const fs = require('fs');

function deleter(game, board) { //Elimina del archivo la partida.
    let boards = JSON.parse(fs.readFileSync('././private/' + game + 'Boards.json', 'utf-8'));
    let boardToFind = boards.find(element => element.boardId === board.id);
    let i = boards.indexOf(boardToFind);
    if (i !== -1) {

        boards.splice(i, 1);
        let json = JSON.stringify(boards, null, 4);
        fs.writeFileSync('././private/' + game + 'Boards.json', json, 'utf-8', (err) => {
            console.log(err);
        });
        return true;
    }
    return false;
}