var lobbySocket = io.connect('/lobby');

lobbySocket.on('Player Added', function(data){
	console.log(data.playerName);
})
