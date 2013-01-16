//Magic variables here
var BLOCKSIZE = 10;

function Coordinate(x,y){
	this.x = x;
	this.y = y;
	this.toString = function(){
		return "("+this.x+", "+this.y+")";
	};
}

function Island(name, color, fontSize, fontColor){
	this.name = name;
	this.color = color;
	this.fontSize = fontSize;
	this.fontColor = fontColor;
	this.edges = new Array();
	this.addEdge = function(coords){
		coords = sqrToPixel(coords);
		this.edges.push(coords);
	}
	this.centroid = function(){
		try{
			if(this.edges.length<1) throw new Error("Polygon has no points!");
		}
		catch(err){
			console.error(err.name+": "+err.message);
		}

		/* Centriod forumla
		Cx = 1/(6A) Sum(i=0->n-1){(x[i]+x[i+1])(x[i]y[i+1]-x[i+1]y[i])}
		Cy = 1/(6A) Sum(i=0->n-1){(y[i]+y[i+1])(x[i]y[i+1]-x[i+1]y[i])}
		A = 1/2 Sum(i=0->n-1){x[i]y[i+1]-x[i+1]y[i]}
		*/		
		this.edges.push(this.edges[0]);
		var sumX=0, sumY=0, sumArea=0;
		for(var i=0;i<this.edges.length-1;i++){
			sumX+=(this.edges[i].x+this.edges[i+1].x)*(this.edges[i].x*this.edges[i+1].y - this.edges[i+1].x*this.edges[i].y);
			sumY+=(this.edges[i].y+this.edges[i+1].y)*(this.edges[i].x*this.edges[i+1].y - this.edges[i+1].x*this.edges[i].y);
			sumArea+= this.edges[i].x*this.edges[i+1].y - this.edges[i+1].x*this.edges[i].y;
		}
		this.edges.pop();//Remove repaeated element

		return new Coordinate(1/(3*sumArea)*sumX, 1/(3*sumArea)*sumY);

	}
	this.paint = function(){
		if(this.edges.length>2){//Polygons have at least 3 edges
			//Draw a polygon path and label it, text in the center
			var svg="M";
			for (i in this.edges) {
				svg += this.edges[i].x+","+this.edges[i].y+" ";
			}
			paper.path(svg+"z").attr({"fill": color, "stroke":"none"});

			var center = this.centroid();
			paper.text(center.x,center.y,this.name).attr({"font-size":fontSize, "fill": fontColor});
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
var paper = Raphael(pos.left,pos.top, main.attr("width")*BLOCKSIZE, main.attr("height")*BLOCKSIZE);

//Layer 1, Islands
$("#subway-islands").children().each(
	function(index, Element){
		//Build an island
		var i = new Island($(Element).attr("island-name"),$(Element).attr("background-color"),$(Element).attr("font-size"), $(Element).attr("font-color"));
		//Add the edges
		$(Element).children().each(
			function(index,Element){
				//Split the x and y and add it to the polygon
				var edgeCoords = $(Element).attr("edge").split(",");
				i.addEdge(new Coordinate(parseFloat(edgeCoords[0]),parseFloat(edgeCoords[1])));
			}
		);
		//Paint the island
		i.paint();
	}
);

//Hide the info lists
main.hide();
