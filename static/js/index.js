var lobbySocket = io.connect('/lobby');
var gameKey;

function newGame(){
	console.log("Creating Lobby");
	var body = document.getElementsByTagName("BODY")[0];
	var playerName = document.getElementById('playerName').value;
	var baseUrl = 'http://localhost:8080/';
	var url = baseUrl + 'createLobby';
	console.log(url);
	$.post(url, {
		playerName: playerName
	}, function(data){
		gameKey = data.gameKey;
		var playerKey = data.playerKey;
		console.log(gameKey);
		lobbySocket.emit('Created Lobby', {gameKey: gameKey});
		document.location.href = baseUrl + gameKey + '/lobby/' + playerKey;
	}, 'json')
};

function joinGame(){
	console.log("Joining Game");
	gameKey = document.getElementById('gameKey').value;
	var playerName = document.getElementById('playerName_2').value;
	var baseUrl = 'http://localhost:8080/';
	var url = baseUrl + 'joinGame';
	$.post(url, {
		gameKey: gameKey,
		playerName: playerName
	}, function(data){
		var gameKey = data.gameKey;
		var playerKey = data.playerKey;
		lobbySocket.emit('Joined Lobby', {gameKey: gameKey, playerName: playerName});
		document.location.href = baseUrl + gameKey + '/lobby/' + playerKey;
	}, 'json')
};
