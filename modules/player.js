var Player = function(_name, _hand,_id) {
	this.name = _name;
	this.hand = _hand;
	this.id = _id;
};

Player.prototype.getName = function getName(){
	return this.name;
};

Player.prototype.getHand = function getHand(){
	return this.hand;
};

module.exports = Player;