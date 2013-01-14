//Magic variables here
var BLOCKSIZE = 10;

function Coordinate(x,y){
	this.x = x;
	this.y = y;
	this.toString = function(){
		return "("+x+", "+y+")";
	};
}

function sqrToPixel(coords){
	return new Coordinate(coords.x*BLOCKSIZE,coords.y*BLOCKSIZE);
}

function pixelToSqr(coords){
	return new Coordinate(coords.x/BLOCKSIZE,coords.y/BLOCKSIZE);
}

//Build canvas
var main = $("#subway");
var pos = main.position();
var paper = Raphael(pos.left, pos.top, 320, 200);

//Layer 1, Islands
var islands = main.children();

//Hide the info lists
main.hide();
