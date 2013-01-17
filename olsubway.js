//Magic variables here
var BLOCKSIZE = 10;
var TRACK_THICKNESS = 0.5;

function Coordinate(x,y){
	this.x = x;
	this.y = y;
}

Coordinate.prototype.toString = function(){
	return this.x+","+this.y;
};

function Island(name, color, fontSize, fontColor){
	this.name = name;
	this.color = color;
	this.fontSize = fontSize;
	this.fontColor = fontColor;
	this.edges = new Array();
}

Island.prototype.addEdge = function(coords){
	coords = sqrToPixel(coords);
	this.edges.push(coords);
}

Island.prototype.centroid = function(){
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

Island.prototype.paint = function(){
	if(this.edges.length>2){//Polygons have at least 3 edges
		//Draw a polygon path and label it, text in the center
		var svg="M";
		for (i in this.edges){
			svg += this.edges[i].toString()+" ";
		}
		paper.path(svg+"z").attr({"fill": this.color, "stroke":"none"});

		var center = this.centroid();
		paper.text(center.x,center.y,this.name).attr({"font-size":this.fontSize, "fill": this.fontColor});
	}
}

function Curve(dest,pt){ //pt is the point used to define the curve
	Coordinate.call(this,dest.x, dest.y);
	this.pt = pt;
}
Curve.prototype = Object.create(Coordinate.prototype);

Curve.prototype.toString = function(){
	return this.pt+" "+Coordinate.prototype.toString.call(this);
}

function Track(color, startingPt){
	this.color = color;
	this.segments = new Array(sqrToPixel(startingPt));
}

Track.prototype.addSegment = function(dest, dir){
	dest = sqrToPixel(dest);
	//Determine what type of segment is added
	//Straight path
	if(typeof dir == "undefined")
		this.segments.push(dest);
	//Horizontal to Veritcal (control = (prev.y,dest.x))
	else if(dir.toUpperCase() == "N" || dir.toUpperCase() == "S")
		this.segments.push(new Curve(dest, new Coordinate(dest.x,this.segments[this.segments.length-1].y)));
	//Vertical to horizontal (control = (prev.x,dest.y))
	else if(dir == "E" || dir == "W")
		this.segments.push(new Curve(dest, new Coordinate(this.segments[this.segments.length-1].x,dest.y)));
}

Track.prototype.paint = function(){
	var svg = "M"+this.segments[0]+" "; //First point is never a "curve"
	for(var i=1;i<this.segments.length;i++){
		//Use SVG quadratic Bézier curveto to draw curves
		if(this.segments[i] instanceof Curve) 
			svg+="Q"+this.segments[i]+" ";
		//Use SVG line to draw straight lines
		else
			svg+="L"+this.segments[i]+" ";
	}

	paper.path(svg).attr({"stroke": this.color, "stroke-width": TRACK_THICKNESS*BLOCKSIZE});
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

//Layer 2, Tracks
$("#subway-tracks").children().each(
	function(index, Element){
		//Build a new track
		var startingCoord = $(Element).attr("start-point").split(",");
		var t = new Track($(Element).attr("color"), new Coordinate(parseInt(startingCoord[0]), parseInt(startingCoord[1])));
		//Process each segment
		$(Element).children().each(
			function(index,Element){
				var destCoords = $(Element).attr("dest").split(",");
				t.addSegment(new Coordinate(parseInt(destCoords[0]),parseInt(destCoords[1])), $(Element).attr("turn"));
			}
		);
		//Paint the track
		t.paint();
	}
);

//Hide the info lists
main.hide();
