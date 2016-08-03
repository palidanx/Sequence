var playerHand, gameKey, playerKey, playerColor, playerNum, numPlayers;
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

function renderBoard(board){
	console.log(board);
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

function renderHand(playerHand){
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

function playMove(row, col, cardNum, _playerColor){
	var url = 'http://localhost:8080/'+gameKey+'/playPiece/' + playerKey;
	var url2 = 'http://localhost:8080/'+gameKey+'/playCard/' + playerKey + '/' + cardNum;
	$.get(url2, function(data){
		console.log("Telling the Socket the player moved");
		board[parseInt(row) * 10 + parseInt(col)] = _playerColor;
		gameSocket.emit('Player Moved', {
			playerNum: playerNum,
			gameKey: gameKey,
			board: board,
			numPlayers: numPlayers

		})
		renderHand(data);
	})
	var removeCard = false;
	if (_playerColor == 0)
		removeCard = true;
	$.post(url, {
		row: row,
		col: col,
		removeCard: removeCard
	}, function(data){
		//console.log(data);
	}, 'json')
	canMove = false;
}

$(document).ready(function(){
	var urlParams = window.location.href.split('/');
	gameKey = urlParams[3];
	playerKey = urlParams[5];
	gameSocket.on('Player Moved '+ gameKey, function(data, err){
		console.log("Player Moved");
		board = data.board;
		//console.log(board);
		renderBoard(board);
	})
	var eventMessage = gameKey + ' Player Turn ' + playerNum;
	gameSocket.on(eventMessage, function(data){
		canMove = true;
		console.log(data.data);
	})
});
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
			return [true, i];
		}
	}
	return [false, -1];
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
	console.log(lineArray);
	var url = 'http://localhost:8080/' + gameKey + '/madeLine/' + playerKey;
	$.post(url, {
		lineArray: lineArray
	}, function(data){
		board = data.board;
		renderBoard(board);
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
	if (line == null)
		return null;
	if (line[0] == 2){
		renderLine(line[1]);
		score += 2;
		return 2;
	}
	if (line[2] == false){
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

function checkForLines(board, _row, _col){
	var tdboard = convertBoardInto2DArray(board);
	var splicedBoard = [];
	var row = parseInt(_row);
	var col = parseInt(_col);
	var r1 = Math.max(0, row - 4);
	var r2 = Math.min(9, row + 4);
	var c1 = Math.max(0, col - 4);
	var c2 = Math.min(9, col + 4);

	console.log(r1 + " " + r2 + " " + c1 + " " + c2);

	var horizontal = checkHorizontal([r1,r2], [c1,c2], row, col, tdboard);
	var vertical = checkVertical([r1,r2], [c1,c2], row, col, tdboard);
	var ndiagonal = checkNDiagonal([r1,r2], [c1,c2], row, col, tdboard);
	var pdiagonal = checkPDiagonal([r1,r2], [c1,c2], row, col, tdboard);

	checkAndRender(horizontal);
	checkAndRender(vertical);
	checkAndRender(ndiagonal);
	checkAndRender(pdiagonal);
}

function checkHorizontal(rArray, cArray, row, col, tdboard){
	console.log("Checking for horizontal lines");
	console.log(tdboard)
	var r1= rArray[0];
	var r2 = rArray[1];
	var c1 = cArray[0];
	var c2 = cArray[1];
	console.log(r1 + " " + r2 + " " + c1 + " " + c2);
	var bscore = 0; fscore = 0;
	var bArray = [], fArray = [];
	for (var i = (col - 1); i >= c1; i--){
		if (tdboard[row][i] == playerColor){
			bArray.push([row, i]);
			bscore ++;
		}
		else
			break;
	}
	console.log(bscore);
	for (var i = col + 1; i <= c2; i++){
		if (tdboard[row][i] == playerColor){
			fArray.push([row, i]);
			fscore ++;
		}
		else
			break;
	}
	console.log("fscore: " + fscore);
	var score = fscore + bscore + 1;
	if (score < 5)
		return null
	if (score == 9){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 2, lineArray;
	}
	else if (score == 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 1, lineArray, false;
	}
	else if (score > 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 1, lineArray, true;
	}
}
function checkVertical(rArray, cArray, row, col, board){
	var r1= rArray[0];
	var r2 = rArray[1];
	var c1 = cArray[0];
	var c2 = cArray[1];
	var bscore = 0; fscore = 0;
	var bArray = [], fArray = [];
	for (var i = row - 1; i >= r1; i--){
		if (board[i][col] == playerColor){
			bArray.push([i, col]);
			bscore ++;
		}
		else
			break;
	}
	for (var i = row + 1; i <= r2; i++){
		if (board[i][col] == playerColor){
			fArray.push([i, col]);
			fscore ++;
		}
		else
			break;
	}
	var score = fscore + bscore + 1;
	if (score == 9){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 2, lineArray;
	}
	else if (score == 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 1, lineArray, false;
	}
	else if (score > 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 1, lineArray, true;
	}
	return null;
}
function checkNDiagonal(rArray, cArray, row, col, board){
	var r1= rArray[0];
	var r2 = rArray[1];
	var c1 = cArray[0];
	var c2 = cArray[1];
	var bscore = 0; fscore = 0;
	var bArray = [], fArray = [];
	var i = row - 1, j = col - 1;
	for ( ;i >= r1 && j >=c1; ){
		if (board[i][j] == playerColor){
			bArray.push([i, j]);
			bscore ++;
			i--, j--;
		}
		else
			break;
	}
	var i = row + 1; j = col + 1;
	for ( ;i <= r2 && j <= c2; ){
		if (board[i][j] == playerColor){
			fArray.push([i, j]);
			fscore ++;
			i++, j++;
		}
		else
			break;
	}	
	var score = fscore + bscore + 1;
	if (score == 9){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 2, lineArray;
	}
	else if (score == 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 1, lineArray, false;
	}
	else if (score > 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 1, lineArray, true;
	}
	return null;
}
function checkPDiagonal(rArray, cArray, row, col, board){
	var r1= rArray[0];
	var r2 = rArray[1];
	var c1 = cArray[0];
	var c2 = cArray[1];
	var bscore = 0; fscore = 0;
	var bArray = [], fArray = [];
	var i = row + 1, j = col - 1;
	for ( ;i <= r2 && j >=c1; ){
		if (board[i][j] == playerColor){
			bArray.push([i, j]);
			bscore ++;
			i++, j--;
		}
		else
			break;
	}
	var i = row - 1; j = col + 1;
	for ( ;i >= r1 && j <= c2; ){
		if (board[i][j] == playerColor){
			fArray.push([i, j]);
			fscore ++;
			i--, j++;
		}
		else
			break;
	}	
	var score = fscore + bscore + 1;
	if (score == 9){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 2, lineArray;
	}
	else if (score == 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 1, lineArray, false;
	}
	else if (score > 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return 1, lineArray, true;
	}
	return null;
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
	var validMove = false;
	var cardNum = -1;
	var row = coordinate[1];
	var col = coordinate[3];
	var currentPiece = board[parseInt(row + col)];

	if (currentPiece[currentPiece.length - 1] == 'l'){
		console.log("Part of line already, can't be touched");
		return null;
	}

	if (currentPiece == playerColor){
		console.log("Thats your piece");
		return null;
	}

	var hasOEJ = OEJinHand(playerHand);
	var cardNumOEJ = OEJinHand(playerHand)[1];
	var cardNumTEJ = TEJinHand(playerHand)[1];
	var hasTEJ = TEJinHand(playerHand)[0];
	

	var hasCard = cardInHand(card, playerHandUrls)[0];
	var cardNum = cardInHand(card, playerHandUrls)[1];

	console.log(hasCard + " " + hasTEJ);
	if (currentPiece == "0"){
		if (hasCard){
			console.log("Playing card");
			checkForLines(board, parseInt(row), parseInt(col));
			playMove(row, col, cardNum, playerColor);
			return null;
		}
		else if(hasTEJ){
			console.log("Playing Two Eyed Jack");
			cardNumTEJ;
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