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

function check(rArray, cArray, row, col, rInc, cInc, playerColor){
	var rMin = rArray[0];
	var rMax = rArray[1];
	var cMin = cArray[0];
	var cMax = cArray[1];
	var bscore = 0, fscore = 0;
	var blscore = 0; flscore = 0;
	var bArray = [], fArray = [];
	
	board[0][0] = playerColor;
	board[9][9] = playerColor;
	board[0][9] = playerColor;
	board[9][0] = playerColor;

	var i = row + rInc, j = col + cInc;
	while(i <= rMax && j <= cMax){
		if (board[i][j] == playerColor){
			bArray.push([i,j]);
			bscore++;
			i += rInc;
			j += cInc;
		}
		else if (board[i][j] == (playerColor + 'l')){
			bArray.push([i,j]);
			blscore++;
			i += rInc;
			j += cInc;
		}
		else
			break;
	}
	console.log("bscore: " + bscore);
	console.log("blscore: " + blscore);
	i = row - rInc;
	j = col - cInc;
	while(i >= rMin && j >= cMin){
		if (board[i][j] == playerColor){
			fArray.push([i, j]);
			fscore++;
			i -= rInc;
			j -= cInc;
		}
		else if (board[i][j] == (playerColor + 'l')){
			fArray.push([i,j]);
			flscore++;
			i -= rInc;
			j -= cInc;
		}
	}

	board[0][0] = 0;
	board[9][9] = 0;
	board[0][9] = 0;
	board[9][0] = 0;
	console.log("fscore: " + fscore);
	console.log("flscore: " + flscore);
	var score = fscore + flscore + blscore + bscore + 1;
	if (score < 5)
		return null
	if (score == 9){
		if (blscore == 5){
			//consider forward line
		}
		else if (flscore == 5){

		}
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
		if (blscore == 5 || flscore == 5)
			return null;
		else {
			var lineArray = bArray;
			lineArray.push([row, col]);
			lineArray.push(fArray);
			return [1, lineArray, true];
		}	
	}
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

Game.prototype.checkForLines = function checkForLines(_board, _row, _col, playerColor){
	board = _board;
	var row = parseInt(_row);
	var col = parseInt(_col);
	var r1 = Math.max(0, row - 5);
	var r2 = Math.min(9, row + 5);
	var c1 = Math.max(0, col - 5);
	var c2 = Math.min(9, col + 5);

	console.log(r1 + " " + r2 + " " + c1 + " " + c2);

	var horizontal = check([r1, r2], [c1, c2], row, col, 0, 1, playerColor);
	var vertical = check([r1, r2], [c1, c2], row, col, 1, 0, playerColor);
	var ndiagonal = check([r1, r2], [c1, c2], row, col, -1, 1, playerColor);
	var pdiagonal = check([r1, r2], [c1, c2], row, col, 1, 1, playerColor); 

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