var playerHand, playerName, gameKey, playerKey, playerColor, playerNum, numPlayers, score;
var gameSocket = io.connect('/game');
var board;
var playerHandUrls = [];
var sMap = {
		"d": "diamonds",
		"s": "spades",
		"c": "clubs",
		"h": "hearts"
	};
var suiteMapping = {
		"d": "_of_diamonds.png",
		"s": "_of_spades.png",
		"c": "_of_clubs.png",
		"h": "_of_hearts.png"
	};
var numberMapping = {
		"K": "king",
		"Q": "queen",
		"A": "ace",
		"J": "jack"
	};
var canMove = false;

function renderBoard(_board){
	board = _board;
	for (var i = 0 ; i < 100; i++){
		if (board[i]!=0){
				var idString = "r" + Math.floor(i/10) + "c" + i%10;
				switch(board[i]){
					case "blue":
						$("#" + idString + " img").css("border", "5px solid blue");
						break;
					case "green":
						$("#" + idString + " img").css("border", "5px solid green");
						break;
					case "red": 
						$("#" + idString + " img").css("border", "5px solid red");
						break;
					case "bluel":
						$("#" + idString + " img").css({"border": "6px solid blue",
														'opacity': '0.5'});
						break;
					case "greenl":
						$("#" + idString + " img").css({"border": "6px solid green",
														'opacity': '0.5'});
						break;
					case "redl": 
						$("#" + idString + " img").css({"border": "6px solid red",
														'opacity': '0.5'});
						break;
				}
			}
		}
}

function convertBoardToOneDString(board){
	var otboard = [];
	for (var i = 0 ; i < 10 ; i++){
		for (var j = 0 ; j < 10; j++){
			otboard[10 * i + j]  = board[i][j];
		}
	}
	console.log(otboard);
	return otboard;
}

function renderHand(_playerHand){
	playerHand = _playerHand;
	$('#playerHand').empty();
	for (var i = 0; i < playerHand.length; i++){
		var cardString = playerHand[i];
		var suite = cardString.slice(0,1);
		var num = cardString.slice(1,cardString.length);
		var url = '/images/cards/' + sMap[suite] + '/';
		if (num == "K" || num == "Q" || num == "A" || num == "J"){
			url += numberMapping[num] + suiteMapping[suite];
		}
		else
			url += num + suiteMapping[suite];
		playerHandUrls[i] = url;
		$('#playerHand').append('<div class="playerCard col l1"><img src=' + url + '></div>');
	}
}

function playCard(cardNum){
	var url = '/' + gameKey + '/playCard/' + playerKey + '/' + cardNum;
	$.get(url, function(data){
		renderHand(data);
	})
}

function playMove(row, col, cardNum, _playerColor){
	var url = '/' + gameKey + '/playPiece/' + playerKey;
	
	var removeCard = false;
	if (_playerColor == 0)
		removeCard = true;
	$.post(url, {
		row: row,
		col: col,
		removeCard: removeCard
	}, function(data){
		console.log("Telling the Socket the player moved");
		console.log(data);
		renderBoard(convertBoardToOneDString(data));
		gameSocket.emit('Player Moved', {
			playerNum: playerNum,
			gameKey: gameKey,
			board: data,
			numPlayers: numPlayers

		})
		playMove(cardNum);
	}, 'json')

	canMove = false;
}

$(document).ready(function(){
	var rows = $('#scoreTable table tr');

	for (var i = 0 ; i < rows.length ; i++){
		var color = rows[i].find(".color").text();
		if (playerColor == color){
			playerName = rows[i].find('.name').text();
			break;
		}
	}
	var urlParams = window.location.href.split('/');
	gameKey = urlParams[3];
	playerKey = urlParams[5];
	gameSocket.on('Player Moved '+ gameKey, function(data, err){
		console.log("Player Moved");
		board = data.board;
		//console.log(board);
		renderBoard(board);
	})
	var turnMessage = gameKey + ' Player Turn ' + playerNum;
	gameSocket.on(turnMessage, function(data){
		canMove = true;
		console.log(data.message);
	})
	var lineMessage = 'Line Made ' + gameKey;
	gameSocket.on(lineMessage, function(data){
		board = data.board;
		var lineName = data.playerName;
		for ( var i = 0 ; i < rows.length ; i++){
			var name = rows[i].find('.name').text();
			if (name == lineName)
				var rowScore = rows[i].find('.score');
				var score = parseInt(rowScore.text()) + 1;
				rowScore.text(score);
		}
		})
	})
function OEJinHand(_hand){
	var hand = _hand;
	for (var i = 0 ; i < playerHand.length; i++){
		if (playerHand[i] == 'hJ' || playerHand[i] == 'sJ'){
			console.log('Has OEJ');
			return [true, i];
		}
	}
	return [false, -1];
}
function TEJinHand(_hand){
	var hand = _hand;
	for (var i = 0 ; i < playerHand.length; i++){
		if (playerHand[i] == 'dJ' || playerHand[i] == 'cJ'){
			console.log('Has TEJ');
			return [true, i];
		}
	}
	return [false, -1];
}

function cardInHand(card, _handUrls){
	for (var i = 0 ; i < _handUrls.length; i++){
		if (card.includes(_handUrls[i])){
			return i;
		}
	}
	return -1;
}

function convertBoardInto2DArray(board, playerColor){
	console.log(board.length);
	var tdboard = [];
	var row = [];
	var counter = 0;
	for (var i = 0 ; i < 10; i ++){
		tdboard[i] = board.splice(0,10);
	}
	console.log(tdboard);
	tdboard[0][0] = playerColor;
	tdboard[9][9] = playerColor;
	tdboard[0][9] = playerColor;
	tdboard[9][0] = playerColor;
	console.log(tdboard);
	return tdboard;
}

function renderLine(lineArray){
	console.log("Rendering your line");
	var url = '/' + gameKey + '/madeLine/' + playerKey;
	$.post(url, {
		lineArray: lineArray
	}, function(data){
		board = data.board;
		score = data.score;
		renderBoard(convertBoardToOneDString(board));
	})
}
function makeUserChooseLine(lineArray){
	var numPos = lineArray.length - 4;
	var possibleLines = [];
	var tempLine = [];
	for (var i = 0 ; i < numPos; i++){
		for (var j = 0 ; j < 5 ; j++){
			tempLine[j] = lineArray[i + j];
		}
		possibleLines[i] = tempLine;
		tempLine = [];
	}
}

function checkAndRender(line){
	console.log("Checking for lines");
	if (line == null)
		return 0;
	if (line[0] == 2){
		renderLine(line[1]);
		score += 2;
		return 2;
	}
	if (line[2] == false){
		console.log("made a line");
		renderLine(line[1]);
		score++;
		return 1;
	}
	if (line[2] == true){
		renderLine(makeUserChooseLine(line[1]));
		score++;
		return 1;
	}
}




$("html").click(function(e){
	var coordinate = e.target.parentElement.id;
	if (e.target.localName != "img" || coordinate[0]!='r')
		return null;

	if (!canMove){
		console.log("Not your turn");
		return null;
	}

	var card = e.target.src;
	var row = coordinate[1];
	var col = coordinate[3];
	var currentPiece = board[parseInt(row + col)];

	if (currentPiece[currentPiece.length - 1] == 'l'){
		alert("Part of line already, can't be touched");
		return null;
	}

	if (currentPiece == playerColor){
		alert("Thats your piece");
		return null;
	}

	var hasOEJ = OEJinHand(playerHand);
	var cardNumOEJ = OEJinHand(playerHand)[1];
	var hasTEJ = TEJinHand(playerHand)[0];
	var cardNumTEJ = TEJinHand(playerHand)[1];

	var cardNum = cardInHand(card, playerHandUrls)[1];

	if (currentPiece == "0"){
		if (cardNum != -1){
			console.log("Playing card");
			playMove(row, col, cardNum, playerColor);
			return null;
		}
		else if(hasTEJ){
			console.log("Playing Two Eyed Jack");
			playMove(row, col, cardNumTEJ, playerColor);
			return null;
		}
		else{
			console.log("Illegal Move. Player does not have card or wild jack");
			return null;
		}
	}
	else {
		if (hasOEJ){
			console.log("Playing One Eyed Jack");
			playMove(row, col, cardNumOEJ, 0);
			return null;
		}
		else {
			console.log("Card Occupied");
			return null;
		}
	}
});

function initializeTable(_playerHand, _playerColor, _board, _playerNum, _numPlayers, _currentTurn, _currentName) {
	var urlParams = window.location.href.split('/');
	gameKey = urlParams[3];
	playerKey = urlParams[5];
	playerNum = _playerNum;
	numPlayers = _numPlayers;

	if (playerKey == _currentTurn){
		canMove = true;
		$('#turnInfo').append('<div class="col">Your Turn</div>');
	}
	else
		$('#turnInfo').append('<div class="col">'+ _currentName +'\'s turn</div>');
	if (canMove)
		console.log("Your Turn");
	board = _board.split(',');
	console.log(board);
	playerColor = _playerColor;
 	playerHand = _playerHand.split(',');
 	//convertBoardInto2DArray(board, playerColor);
	var imageUrls = [];
	renderBoard(board);
	renderHand(playerHand);
}