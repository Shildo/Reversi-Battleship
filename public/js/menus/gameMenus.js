function sendCreateGameReq(game){ //Envio de peticion POST para la creacion de partidas.

    const http = new XMLHttpRequest();

    http.open("POST", '/'+game+'/create');

    http.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200){
            let res = JSON.parse(this.response);
            window.sessionStorage.setItem('myId', res.playerId);
            window.location.href = '/'+game+'/'+res.gamePage;
        }
    }

    http.setRequestHeader('Content-Type', 'application/json');
    http.send();
}

function  sendJoinGameReq(game){ //Envio de peticion POST para unirse a una partida por una id determinada.
    let gameId = document.getElementById("gameId").value;
    if(gameId == ""){
        alert('debe colocar la ID de la partida que desea ingresar.');
    }
    else{
        const http = new XMLHttpRequest();

        http.open("POST", '/'+game+'/join');

        http.onreadystatechange = function(){
            if (this.readyState == 4 && this.status == 200){
                let res = JSON.parse(this.response);
                window.sessionStorage.setItem('myId', res.playerId);
                window.location.href = '/'+game+'/'+res.gamePage;
            } else if (this.readyState == 4 && this.status !== 200){
                let res = JSON.parse(this.response);
                if (res.error == 'missing'){
                    window.location.href = '/error-missing'
                } else {
                    window.location.href = '/error-full';
                }
            }
        }
        http.setRequestHeader('Content-Type', 'application/json');
        http.send(JSON.stringify({id: gameId}));
    }
}
function goBack(){
    window.location.href = '/';
}