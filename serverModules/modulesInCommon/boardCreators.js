module.exports.createBoard = createBoard;
const day = 86400000;
const fs = require('fs');

function createBoard(game){
    //Previo a la creacion se verifica si existen partidas en el archivo que esten estancadas (24 hs sin terminar) y se las elimina.
    let boards = JSON.parse(fs.readFileSync('././private/' + game + 'Boards.json', 'utf-8'));
    const actualTime = new Date().getTime();
    for (let i=0; i<boards.length;i++){
        if (actualTime - boards[i].creationDate >= day){
            boards.splice(i, 1); 
            i--;
        }
    }
    let json = JSON.stringify(boards, null, 4);
    fs.writeFileSync('././private/'+ game +'Boards.json', json, 'utf-8', (err) => {
        console.log(err);
    });
    const creator = require('../' + game + 'Modules/' + game + 'Creator.js');
    return creator.createBoard();
}