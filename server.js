var express = require('express');
var app = express();
var http = require('http').Server(app);
var Player = require('./modules/player.js');
var Game = require('./modules/game.js');
var bodyParser = require("body-parser");
var path = require('path');
var io = require('socket.io')(http);

var router = express.Router();
var port = process.env.PORT || 8080;

var firebase = require("firebase");
var config = {
	databaseURL: 'https://sequence-3ca77.firebaseio.com/'
};
firebase.initializeApp(config);
var db = firebase.database();
var firebaseGames = db.ref().child('games/');
var firebaseGameCodes = db.ref().child('gameCodes/');
var firebaseLobbies = db.ref().child('lobbies/')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('static'));
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var lobbySocket = io.of('/lobby');
var gameSocket = io.of('/game');

lobbySocket.on('connection', function(socket){
	console.log('User Connected to Lobby');
	socket.on('Created Lobby', function(data){
		console.log("- Creating Lobby");
	})
	socket.on('Joined Lobby', function(data, err){
		console.log("- Joined Lobby");
		lobbySocket.emit('Player Added '+ data.gameKey, {
			playerName: data.playerName
		});
	})
	socket.on('Game Started', function(data, err){
		var gameKey = data.gameKey;
		console.log('Started Game');
		lobbySocket.emit('Game Started ' + gameKey, {
			message: 'Game Started by owner'
		});
	})
});

gameSocket.on('connection', function(socket){
	console.log('User Connected to Game');

	socket.on('Player Moved', function(data){
		console.log(' - Player moved');
		var gameKey = data.gameKey;
		var playerKey = data.playerKey;
		var board = data.board;
		var playerNum = data.playerNum;
		var numPlayers = data.numPlayers;
		console.log(playerNum + " " + numPlayers);
		gameSocket.emit('Player Moved ' + gameKey, {
			board: board
		});
		var messageEvent = gameKey + " Player Turn " + ((playerNum + 1) % numPlayers);
		console.log(messageEvent);
		gameSocket.emit(messageEvent, {
			message: "Your turn"
		})
	})

	socket.on('Line Made', function(data){
		console.log('- Made Line');
		var gameKey = data.gameKey;
		var playerName = data.playerName;
		var board = data.board;
		var score = data.score;
		console.log('Telling everyone in ' + gameKey + ' about line');
		gameSocket.emit('Line Made ' + gameKey, {
			board: board,
			playerName: playerName
		});
	});
});

router.get('/:gameKey/game/:playerKey', function(req, res){
	console.log("Getting Player Game");
	var gameKey = req.params.gameKey;
	var playerKey = req.params.playerKey;
	firebaseGames.child(gameKey).once('value').then(function(snapshot){
		var data = snapshot.val();
		var board = data.board;
		var player = data.players[playerKey];
		var numPlayers = data.numPlayers;
		var currentPlayer = data.players[data.currentTurn];
		var players = data.players;
		res.render('game', {
			player: player,
			playerColor: player.color,
			playerName: player.name,
			playerHand: player.hand,
			playerScore: player.score,
			board: board,
			num: player.num,
			numPlayers: numPlayers,
			currentTurn: data.currentTurn,
			currentName: data.players[data.currentTurn].name,
			players: data.players
		});
	})
});

router.get('/allGames', function(req, res){
	console.log("Getting all games...");
	var returnArray = [];
	firebaseLobbies.once('value').then(function(snapshot){
		var data = snapshot.val();
		var gameKeys = Object.keys(data);
		var numGames = gameKeys.length;
		for (var i = 0 ; i < numGames ; i++){
			var game = data[gameKeys[i]];
			if (game['gameType'] == 'PUBLIC' && game['gameStarted'] == false){
				returnArray.push(game);
			}
		}
		res.send(returnArray);
	});
});

router.get('/', function(req, res){
	console.log("Getting Home Page..");
	res.render('index');
});

router.get('/:gameKey/lobby/:playerKey', function(req,res){
	console.log("Entering lobby...")
	var gameKey = req.params.gameKey;
	var playerKey = req.params.playerKey;
	var playerName;
	firebaseLobbies.child(gameKey).once('value').then(function(snapshot){
		var ownerName = snapshot.val().gameOwner;
		var players = snapshot.val().players;
		var gameCode = snapshot.val().gameCode;
		res.render('lobby', {
			owner: ownerName,
			players: players,
			gameCode: gameCode,
			playerKey: playerKey
		});
	})
})

router.get('/getPlayerHand/:gameKey/:playerId', function(req, res){
	var playerId = req.params.playerId;
	var gameKey = req.params.gameKey;
	console.log("Getting player hand for " + playerId + " in game " + gameKey + "...");
	var hand;
	firebaseGames.child(gameKey + '/players/' + playerId + '/hand').once('value').then(function(snapshot){
		hand = snapshot.val();
		res.send(hand);
	});
});

router.get('/getBoard/:gameKey', function(req, res){
	var gameKey = req.params.gameKey;
	console.log("Getting board for game " + gameKey + "...");
	var board;
	firebaseGames.child(gameKey).once('value').then(function(snapshot){
		board = snapshot.val().board;
		res.send(board);
	});
});

router.get('/:gameKey/playCard/:playerId/:cardNum', function(req, res){
	var playerId = req.params.playerId;
	var gameKey = req.params.gameKey;
	var cardNum = req.params.cardNum;
	var hand;
	var remainingDeck;
	console.log("Playing card for " + playerId + " in game " + gameKey + "...");
	firebaseGames.child(gameKey).once('value').then(function(snapshot){
		//console.log(snapshot.val());
		data = snapshot.val();
		hand = data.players[playerId].hand;
		remainingDeck = data.remainingDeck;
		//console.log(remainingDeck);
		hand[cardNum] = remainingDeck[0];
		remainingDeck.splice(0,1);
		firebaseGames.child(gameKey+'/remainingDeck').set(remainingDeck);
		firebaseGames.child(gameKey+'/players/'+playerId+'/hand').set(hand);
		res.send(hand);
	});
});

function codeExists(array, code){
	for (var i = 0 ; i < array.length; i++){
		if (code == array[i]){
			return true;
		}
	}
	return false;
}

router.post('/createLobby', function(req, res){
	var playerName = req.body.playerName;
	var gameName = req.body.gameName;
	var gameType = req.body.gameType;
	var numPlayers = req.body.numPlayers;
	var gameKey = firebaseLobbies.push().key;
	console.log("---------------------------------------");
	console.log("Creating Lobby for game " + gameKey + "...");
	console.log("Game Name: " + gameName);
	console.log("Game Type: " + gameType);
	console.log("Number of Players: " + numPlayers);

	var gameCode;
	firebaseGameCodes.once('value').then(function(snapshot){
		var data = snapshot.val();
		var gameCodes = Object.keys(data);
		gameCode = Math.floor(1000 + Math.random() * 9000);
		while(codeExists(gameCodes, gameCode)){
			gameCode = Math.floor(1000 + Math.random() * 9000);
		}
		console.log("Game Code: " + gameCode);
		
		firebaseGameCodes.child('/' + gameCode).set(gameKey);
		firebaseLobbies.child(gameKey).set({
			gameType: gameType,
			numPlayers: numPlayers,
			gameName: gameName,
			gameOwner: playerName, 
			gameCode: gameCode,
			gameStarted: false
		})
		var playerKey = firebaseLobbies.child(gameKey+'/players').push(playerName).key;
		console.log("Owner name: " + playerName);
		console.log("Owner Key: " + playerKey);
		console.log("---------------------------------------");
		res.send({
			playerKey: playerKey,
			gameName: gameName,
			numPlayers: numPlayers,
			gameType: gameType,
			gameKey: gameKey,
			gameCode: gameCode
		})
	})
	
});

router.post('/joinGame', function(req, res){
	var playerName = req.body.playerName;
	var gameCode = req.body.gameCode;
	var gameKey;
	firebaseGameCodes.once('value').then(function(snapshot){
		var data = snapshot.val();
		gameKey = data[gameCode];
		if (gameKey == null){
			res.send("404");
		}
		firebaseLobbies.child(gameKey).once('value').then(function(snapshot){
			var data = snapshot.val();
			var maxPlayers = data.numPlayers;
			var numPlayers = (Object.keys(data.players)).length;
			if (maxPlayers == numPlayers){
				res.send("Game Full");
			}
		})
		var playerKey = firebaseLobbies.child(gameKey+'/players').push(playerName).key;
		res.send({
			playerKey: playerKey,
			gameKey: gameKey
		});	
	})
})



router.get("/initializeGame/:gameKey", function(req, res) {

	var gameKey = req.params.gameKey;
	var numPlayers, remainingDeck, board, firebasePlayers;

	firebaseLobbies.child(gameKey).once('value').then(function(snapshot){
		console.log('getting fb data');
		var data = snapshot.val();
		firebasePlayers = data.players;
		console.log(firebasePlayers);
		var colorsArray = ["blue", "green", "red"];
		var keysIndex = Object.keys(firebasePlayers);
		numPlayers = keysIndex.length;
		console.log(numPlayers);
		var game = new Game();
		game.newGame(numPlayers);
		var players = game.getPlayers();
		board = game.getBoard();
		remainingDeck = game.getRemainingDeck();
		for (var i = 0; i < players.length; i++){
			console.log(players[i].getHand());
		}
		
		for (var i = 0 ; i < numPlayers; i++){
			//console.log('stuck here');
			//console.log(firebasePlayers[keysIndex[i]]);
			var tempPlayer = firebasePlayers[keysIndex[i]];
			console.log()
			var fbplayer = {
				name: tempPlayer,
				hand: players[i].getHand(),
				color: colorsArray[i%3],
				score: 0,
				num: i
			}
			firebasePlayers[keysIndex[i]] = fbplayer;
		}
		firebaseLobbies.child(gameKey + "/gameStarted").set(true);
		firebaseGames.child(gameKey).set({
			currentTurn: keysIndex[0],
			numPlayers : numPlayers,
			players : firebasePlayers,
			board: board,
			remainingDeck: remainingDeck
		})
		res.send(gameKey);
	});
});

router.post("/:gameKey/playPiece/:playerKey", function(req, res){
	var gameKey = req.params.gameKey;
	var playerId = req.params.playerKey;
	var row = req.body.row;
	var col = req.body.col;
	var removePiece = req.body.removePiece;
	//console.log(gameKey);
	console.log("Playing piece...");
	firebaseGames.child(gameKey).once('value').then(function(snapshot){

		var data = snapshot.val();
		var board = data.board;
		var keysIndex = Object.keys(data.players);
		var currentTurn;
		for (var i = 0 ; i < keysIndex.length; i++){
			if (keysIndex[i] == playerId)
				currentTurn = keysIndex[(i + 1) % keysIndex.length];
		}
		var playerColor = data.players[playerId].color;
		console.log("Player Color: " + playerColor);

		board[row][col] = playerColor;
		console.log(board);
		if (removePiece == true)
			board[row][col] = 0;
		console.log("Piece Played");
		
		firebaseGames.child(gameKey+"/board").set(board);
		firebaseGames.child(gameKey+'/currentTurn').set(currentTurn);
		res.send(board);
	});
	
})

router.post("/removePiece/:gameKey", function(req, res){
	var gameKey = req.params.gameKey;
	var row = req.body.row;
	var col = req.body.col;
	firebaseGames.child(gameKey).on('value', function(snapshot){
		var board = snapshot.val().board;
		board[row][col] = 0;
		firebaseGames.child(gameKey+"/board").set(board);
	});
	res.send('moveCompleted');
});

router.post("/:gameKey/madeLine/:playerKey", function(req, res){
	var gameKey = req.params.gameKey;
	var playerKey = req.params.playerKey;
	var lineArray = req.body.lineArray;
	console.log(lineArray);
	firebaseGames.child(gameKey).once('value').then(function(snapshot){
		console.log("Got data from firebase");
		var data = snapshot.val();
		var board = data.board;
		var color = data.players[playerKey].color;
		console.log(color);
		for (var i = 0 ; i < lineArray.length; i++){
			board[lineArray[i][0]][lineArray[i][1]] = color + 'l';
		}
		var score = data.players[playerKey].score + 1;
		console.log(board);
		firebaseGames.child(gameKey + "/players/" + playerKey + "/score").set(score);
		firebaseGames.child(gameKey + "/board").set(board);
		res.send({
			board: board,
			score: score
		});
	});
});

app.use('/', router);
http.listen(port, function(){
	console.log("listening on port: "+ port);
});