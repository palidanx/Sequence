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

var Game = function(numPlayers){
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
};

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