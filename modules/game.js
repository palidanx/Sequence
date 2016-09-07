var Player = require('./player.js');
var shuffleArray = function(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
};
var initializeHands = function(_shuffledPack, _numPlayers) {
	var playerHands = [];
	var discardedCards = _numPlayers * 6;
	var remainingDeck = _shuffledPack.splice(0,discardedCards);
	for (var i = 0 ; i < _numPlayers; i++) {
		var playerHand = [];
		for (var j = 0; j < 6; j++){
			playerHand[j] = remainingDeck[j * _numPlayers + i];
		}
		playerHands.push(playerHand);
	}
	return [playerHands, _shuffledPack];
};

//Board initialized to all zeroes. board[0][0] = 6d
var board = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]];
var numPlayers;
var players = [];
var gameKey;
var originalDeck = ["s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "sJ","sQ", "sK",
		"sA", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10", "hJ", "hQ", "hK",
		"hA","c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10","cJ", "cQ", "cK",
		"cA","d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10", "dJ", "dQ", "dK", "dA", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "sJ","sQ", "sK",
		"sA", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10", "hJ", "hQ", "hK",
		"hA","c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10","cJ", "cQ", "cK",
		"cA","d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10", "dJ", "dQ", "dK", "dA"];
var remainingDeck;

function checkHorizontal(rArray, cArray, row, col, tdboard){
	console.log(tdboard)
	var r1= rArray[0];
	var r2 = rArray[1];
	var c1 = cArray[0];
	var c2 = cArray[1];
	console.log(r1 + " " + r2 + " " + c1 + " " + c2);
	var bscore = 0; fscore = 0;
	var bArray = [], fArray = [];
	for (var i = (col - 1); i >= c1; i--){
		if (tdboard[row][i] == playerColor ){
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
		return [2, lineArray];
	}
	else if (score == 5){
		console.log("YOU MADE A LINE");
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return [1, lineArray, false];
	}
	else if (score > 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return [1, lineArray, true];
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
	console.log(' VERT bscore: ' + bscore + ', fscore: '+ fscore);
	var score = fscore + bscore + 1;
	if (score == 9){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return [2, lineArray];
	}
	else if (score == 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return [1, lineArray, false];
	}
	else if (score > 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return [1, lineArray, true];
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
	console.log(' NDIAG bscore: ' + bscore + ', fscore: '+ fscore);
	var score = fscore + bscore + 1;
	if (score == 9){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return [2, lineArray];
	}
	else if (score == 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		console.log("YOU MADE A LINE");
		return [1, lineArray, false];
	}
	else if (score > 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return [1, lineArray, true];
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
		return [2, lineArray];
	}
	else if (score == 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return [1, lineArray, false];
	}
	else if (score > 5){
		var lineArray = bArray;
		lineArray.push([row, col]);
		lineArray.push(fArray);
		return [1, lineArray, true];
	}
	return null;
}

var Game = function(){};

Game.prototype.newGame = function(numPlayers){
	numPlayers = numPlayers;
	var shuffledDeck = shuffleArray(originalDeck);
	var init = initializeHands(shuffledDeck, numPlayers);
	var playerHands = init[0];
	for (var i = 0 ; i < numPlayers; i++){
		var tempPlayer = new Player("temp", playerHands[i], i);
		//console.log(tempPlayer.getName());
		players[i] = tempPlayer;
		//console.log(players[i].getName());
	}
	//console.log(players[0].getName());
	remainingDeck = init[1];
}

Game.prototype.checkForLines = function checkForLines(board, row, col){
	var tdboard = convertBoardInto2DArray(board);
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

	console.log(ndiagonal);

	var numLines = 0;
	numLines+=checkAndRender(horizontal);
	numLines+=checkAndRender(vertical);
	numLines+=checkAndRender(ndiagonal);
	numLines+=checkAndRender(pdiagonal);

	if (numLines == 0)
		return false;
	else{
		gameSocket.emit('Line Made', {
			gameKey : gameKey,
			playerName: playerName,
			board: board,
			score: score
		});  
		return true;
	}
}

Game.prototype.getPlayers = function getPlayers(){
	return players;
};

Game.prototype.getRemainingDeck = function getRemainingDeck(){
	return remainingDeck;
};

Game.prototype.getGameKey = function getGameKey(){
	return gameKey;
};

Game.prototype.getBoard = function getBoard(){
	return board;
}
Game.prototype.playPiece = function playPiece(playerId, row, col){
	board[row][col] = playPiece;
}
module.exports = Game;