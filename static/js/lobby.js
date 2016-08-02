var lobbySocket = io.connect('/lobby');
var gameKey, playerKey, baseUrl;



$(document).ready(function(){
	var urlParams = window.location.href.split('/');
	gameKey = urlParams[3];
	playerKey = urlParams[5];
	baseUrl = 'http://localhost:8080/';


	lobbySocket.on('Player Added ' + gameKey, function(data){
		console.log(data.playerName);
		$('#playerList').append('<li class="collection-item">' + data.playerName + '</li>');
	});

	lobbySocket.on('Game Started ' + gameKey, function(data){
		console.log(data.message);
		document.location.href = baseUrl + gameKey + '/game/' + playerKey;
	})
});

function startGame() {
	$.get(baseUrl + 'initializeGame/' + gameKey, {}, function(data){
		document.location.href = baseUrl + gameKey + '/game/' + playerKey;
		lobbySocket.emit('Game Started', {
			gameKey: gameKey
		})
	});
}


