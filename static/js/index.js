var lobbySocket = io.connect('/lobby');
var gameKey;

function loadNewGameMenu(){
	$('#gameOptionsCol').load('/templates/newGame.html', function(){});
}
function loadJoinGameMenu(){
	$('#gameOptionsCol').load('/templates/joinGame.html', function(){
		var url = '/allGames';
		$.get(url, function(data){
			console.log(data);
			var numGames = data.length;
			for (var i = 0 ; i < numGames ; i++){
				var rowHTML = "<tr>";
				var nameHTML = "<td>" + data[i].gameName + "</td>";
				var numPlayersHTML = "<td>" + data[i].numPlayers + "</td>";
				var gameCodeHTML = "<td>" + data[i].gameCode + "</td>";
				var joinGameHTML = "<td><a onclick=joinGame("+ data[i].gameCode + ") >Join</a></td>";
				rowHTML += (nameHTML + numPlayersHTML + gameCodeHTML + joinGameHTML + "</tr>");
				console.log(rowHTML);
				$('#gamesBody').append(rowHTML);
			} 
		})
	});
}

function newGame(){
	console.log("Creating Lobby");
	var body = document.getElementsByTagName("BODY")[0];
	var playerName = document.getElementById('playerName').value;
	var gameName = document.getElementById('gameName').value;
	var gameType = "PUBLIC";
	if ($("#private").is(":checked")){
		console.log("Private Game");
		gameType = "PRIVATE";
	}
	var numPlayers = 2;
	if ($("#3players").is(":checked")){
		console.log("3 Players");
		numPlayers = 3;
	}
	var url = '/createLobby';
	console.log("Creating game(" + playerName + "," + gameType + "," + numPlayers + ")");
	$.post(url, {
		playerName: playerName,
		numPlayers: numPlayers, 
		gameType: gameType,
		gameName: gameName
	}, function(data){
		gameKey = data.gameKey;
		var playerKey = data.playerKey;
		console.log(gameKey);
		lobbySocket.emit('Created Lobby', {gameKey: gameKey});
		document.location.href = baseUrl + gameKey + '/lobby/' + playerKey;
	}, 'json')
};

function joinGame(_gameCode){
	var gameCode = _gameCode 
	if (gameCode == null){
		gameCode = $('#gameCode').val();
	}
	console.log(gameCode);
	var url = '/joinGame';
	var playerName = $('#playerName').val();
	$.post(url, {
		gameCode: gameCode,
		playerName: playerName
	}, function(data){
		var gameKey = data.gameKey;
		var playerKey = data.playerKey;
		lobbySocket.emit('Joined Lobby', {gameKey: gameKey, playerName: playerName});
		document.location.href = "/" + gameKey + '/lobby/' + playerKey;
	}, 'json')
}
