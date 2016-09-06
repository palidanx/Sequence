var lobbySocket = io.connect('/lobby');
var gameKey, playerKey;



$(document).ready(function(){
	var urlParams = window.location.href.split('/');
	gameKey = urlParams[3];
	playerKey = urlParams[5];

	lobbySocket.on('Player Added ' + gameKey, function(data){
		console.log(data.playerName);
		$('#lobbyTable tr:last').append('<tr><td>'+ data.playerName + '</td><td>Blue</td></tr>');
	});

	lobbySocket.on('Game Started ' + gameKey, function(data){
		console.log(data.message);
		document.location.href = "/" + gameKey + '/game/' + playerKey;
	})
});

function startGame() {
	$.get('/initializeGame/' + gameKey, {}, function(data){
		document.location.href = "/" + gameKey + '/game/' + playerKey;
		lobbySocket.emit('Game Started', {
			gameKey: gameKey
		})
	});
}


