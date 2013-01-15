//Magic variables here
var BLOCKSIZE = 10;

function Coordinate(x,y){
	this.x = Number(x);
	this.y = Number(y);
	this.toString = function(){
		return "("+this.x+", "+this.y+")";
	};
}

function Island(name, color, fontSize, fontColor){
	this.name = name;
	this.color = color;
	this.fontSize = fontSize;
	this.fontColor = fontColor;
	this.svgUnclosed = "M";
	this.xTotal = 0;
	this.yTotal = 0;
	this.edgeCount = 0;
	this.addEdge = function(coords){
		this.xTotal += coords.x;
		this.yTotal += coords.y;
		this.edgeCount++;
		this.svgUnclosed += coords.x + ","+coords.y+" ";
	}
	this.paint = function(){
		if(this.edgeCount>2){//Polygons have at least 3 edges
			//Draw a polygon path and label it, text in the center
			paper.path(this.svgUnclosed+"z").attr({"fill": color, "stroke":"none"});
			paper.text(this.xTotal/this.edgeCount,this.yTotal/this.edgeCount,this.name).attr({"font-size":fontSize, "fill": fontColor});
		}
	}
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
var paper = Raphael(pos.left,pos.top, main.attr("width"), main.attr("height"));

//Layer 1, Islands
$("#subway-islands").children().each(
	function(index, Element){
		//Build an island
		var i = new Island($(Element).attr("island-name"),$(Element).attr("background-color"),$(Element).attr("font-size"), $(Element).attr("font-color"));
		//Add the edges
		$(Element).children().each(
			function(index,Element){
				i.addEdge(new Coordinate($(Element).attr("edge-x"),$(Element).attr("edge-y")));
			}
		);
		//Paint the island
		i.paint();
	}
);

//Hide the info lists
main.hide();
