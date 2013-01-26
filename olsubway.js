//Magic variables here
var BLOCKSIZE =20; //Basic scale for all graphics
var TRACK_THICKNESS = 0.45; //Relative thickness of the track to one block
var STATION_RADIUS = 0.4; //Relative radius of the station
var CONNECTOR_RATIO = 0.55; //Relative thickness of connector, to station
var STATION_LINE_THICKNESS = 0.1; //Absolute thickness of station boundary
var LABEL_FONT_SIZE = 14; //Font size for station labels
var GRID_COLOR = "#bbb"; //Colour of the grid
var END_MOVE = 0.7; //Amount to move the track ending by
var station_colors = ["#000","#eee"]; //Default colour scheme for stations
var glow_colors = ["#03f","#709"]; //Default colour scheme for glow

//Dervied variables
var CONNECTOR_THICKNESS = 2*STATION_RADIUS*CONNECTOR_RATIO;
var INNER_RADIUS = STATION_RADIUS - STATION_LINE_THICKNESS;
var INNER_CONECTOR = CONNECTOR_THICKNESS - STATION_LINE_THICKNESS*2.4;

 //Array of stations for linking
var stations = new Array();

//Arrow Head, defined in terms of blocksize, to be scaled later
var arrow = "M0,0 l0,0.5 0.6,-0.5 -0.6,-0.5z";

//For browsers without Object.create
if(typeof Object.create == "undefined" ) {
	Object.create = function( o ) {
	    function F(){}
	    F.prototype = o;
	    return new F();
	};
}

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
};

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
};

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
};

function Curve(dest,pt){ //pt is the point used to define the curve
	Coordinate.call(this,dest.x, dest.y);
	this.pt = pt;
}

Curve.prototype = Object.create(Coordinate.prototype);

Curve.prototype.toString = function(){
	return this.pt+" "+Coordinate.prototype.toString.call(this);
};

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
};

Track.prototype.paint = function(){
	this.arrowHead();
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
};

Track.prototype.arrowHead = function(){
	if(this.segments.length>1){
		var elem = this.segments.pop();
		var trans;
		if(elem instanceof Curve){
			trans = coordTrans(elem,elem.pt);
			elem = new Curve(trans[0], elem.pt);
		}	
		else{
			trans = coordTrans(elem, this.segments[this.segments.length-1]);
			elem = new Coordinate(trans[0].x,trans[0].y);
		}
			
		this.segments.push(elem);

		paper.path(arrow).attr({fill: this.color, stroke: "none"}).transform("T"+elem.x +"," +elem.y+"S"+BLOCKSIZE+"R"+trans[1]);
	}
};

function Station(name, href, labelDir, labelTer, links){
	this.name=name;
	this.href=href;
	this.labelDir = labelDir;
	this.labelTer = labelTer;
	this.terminals = new Array();
	this.links = links;
	this.ID = stations.length;
	//Terminals, Main glow, Link glow
	this.elements = [paper.set(),paper.set(),paper.set()];
	stations.push(this);
}

Station.prototype.addTerminal = function(trans){
	this.terminals.push(sqrToPixel(trans));
};

Station.prototype.paint = function(){
	//Outer layer
	var prevPt=0;
	for(i in this.terminals){
		var elem;
		//Creates a station marker, size depeding on the layer it is at
		elem = paper.circle(this.terminals[i].x, this.terminals[i].y, STATION_RADIUS*BLOCKSIZE).attr("fill",station_colors[0]);
		this.elements[0].push(elem);
		this.elements[1].push(elem.glow({width: BLOCKSIZE/2, color:glow_colors[0]}));
		this.elements[2].push(elem.glow({width: BLOCKSIZE/2, color:glow_colors[1]}));
		//Links previous terminal to this one
		if(prevPt !== 0){
			elem = paper.path("M"+prevPt+" L"+this.terminals[i]).attr({"stroke":station_colors[0],"stroke-width":BLOCKSIZE*CONNECTOR_THICKNESS});
			this.elements[0].push(elem);
			this.elements[1].push(elem.glow({width: BLOCKSIZE*(CONNECTOR_THICKNESS/2*1.8), opacity: 0.8, color:glow_colors[0]}));
			this.elements[2].push(elem.glow({width: BLOCKSIZE*(CONNECTOR_THICKNESS/2*1.8), opacity: 0.8, color:glow_colors[1]}));
		}
		prevPt = this.terminals[i];
	}
	//Glow created, but hidden at first
	this.elements[1].hide();
	this.elements[2].hide();

	//Inner layer
	prevPt = 0;
	for(i in this.terminals){
		elem = paper.circle(this.terminals[i].x, this.terminals[i].y, BLOCKSIZE*INNER_RADIUS).attr("fill",station_colors[1]);
		this.elements[0].push(elem);
		if(prevPt !== 0){
			elem = paper.path("M"+prevPt+" L"+this.terminals[i]).attr({"stroke":station_colors[1],"stroke-width":BLOCKSIZE*INNER_CONECTOR});
			this.elements[0].push(elem);
		}
		prevPt = this.terminals[i];
	}

	//Print Station number
	for (var i in this.terminals) {
		this.elements[0].push(paper.text(this.terminals[i].x,this.terminals[i].y,this.ID+1).attr({"font-size": INNER_RADIUS*BLOCKSIZE*1.8,"font-weight":"bolder"}));
	}

	//Print station name
	var label = this.printLabel();
	this.elements[0].push(label);

	//Local references
	var mainElem=this.elements[1];
	var links = this.links;
	//Mouse listeners
	//Add mouselistener for glow
	this.elements[0].mouseover(function(e){
		mainElem.show();
		label.attr("font-weight","bolder");
		for(var i in links){
			var j = links[i];
			if(j!=this.ID && typeof stations[j] != "undefined")
				stations[j].elements[2].show();
		}
	}).mouseout(function(e){
		mainElem.hide();
		label.attr("font-weight","normal");
		for(var i in links){
			var j = links[i];
			if(j!=this.ID && typeof stations[j] != "undefined")
				stations[j].elements[2].hide();
		}
	});
	//Add the link
	this.elements[0].attr("href", this.href);
};

Station.prototype.printLabel=function(){
	//Set default values
	if(typeof this.labelTer == "undefined")
		this.labelTer = 1;
	if(typeof this.labelDir == "undefined")
		this.labelDir = "S";
	try{
		if(this.labelTer<0 || this.terminals.length<this.labelTer) throw new Error("Invalid terminal number!");
	}
	catch(err){
		console.error(err.name+": "+err.message);
	}

	//Text alignments
	var x = this.terminals[this.labelTer-1].x, y = this.terminals[this.labelTer-1].y;
	var alignment = "middle";
	switch(this.labelDir.toUpperCase()){
		case "N":
			y-=BLOCKSIZE;
			break;
		case "NW":
		case "WN":
			x-=BLOCKSIZE/2;
			y-=BLOCKSIZE/2;
			alignment = "end";
			break;
		case "W":
			x-=BLOCKSIZE/2;
			alignment = "end";
			break;
		case "SW":
		case "WS":
			x-=BLOCKSIZE/2;
			y+=BLOCKSIZE/2;
			alignment="end";
			break;
		case "S":
			y+=BLOCKSIZE;
			break;
		case "SE":
		case "ES":
			x+=BLOCKSIZE/2;
			y+=BLOCKSIZE/2;
			alignment = "start";
			break;
		case "E":
			x+=BLOCKSIZE/2;
			alignment = "start";
			break;
		case "NE":
		case "EN":
			x+=BLOCKSIZE/2;
			y-=BLOCKSIZE/2;
			alignment = "start";
			break;
	}
	var returnVal = paper.text(x,y,this.name).attr({"text-anchor": alignment, "font-size":LABEL_FONT_SIZE});
	return returnVal;
};

function sqrToPixel(coords){
	return new Coordinate(coords.x*BLOCKSIZE,coords.y*BLOCKSIZE);
}

function reOrderStations(){
	for(var i=2;i>=0;i--){
		for(var j in stations)
			stations[j].elements[i].toFront();
	}
}

function coordTrans(end, prev){
	//Moves coordinate back by end move, works even for eight directions
	var returnX = end.x, returnY = end.y;
	var deg = 0;
	if(end.x-prev.x>0)
		returnX-=END_MOVE*BLOCKSIZE;
	else if (end.x-prev.x<0){
		returnX+=END_MOVE*BLOCKSIZE;
		deg = 180;
	}

	if(end.y-prev.y>0){
		returnY-=END_MOVE*BLOCKSIZE;
		deg = 90;
	}
	else if(end.y-prev.y<0){
		returnY+=END_MOVE*BLOCKSIZE;
		deg = 270;
	}

	return [new Coordinate(returnX,returnY),deg];
}

//Build canvas
var main = $("#subway");
var pos = main.position();
var width = main.attr("width"), height = main.attr("height") ;
var paper = Raphael(pos.left,pos.top, width*BLOCKSIZE, height*BLOCKSIZE);

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

//Grid
if(main.attr("debug")=="true"){
	for (var i = 0; i <= width; i++)
		paper.path("M"+i*BLOCKSIZE+", 0 L"+ i*BLOCKSIZE+", "+height*BLOCKSIZE).attr({"stroke":GRID_COLOR, "stroke-width":2});

	for(var i=0;i<=height;i++)
		paper.path("M0, "+i*BLOCKSIZE+" L"+width*BLOCKSIZE+", "+i*BLOCKSIZE).attr({"stroke":GRID_COLOR, "stroke-width":2});
}

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

//Layer 3, Stations
$("#subway-stations").children().each(
	function(index,Element){
		var name = $(Element).text().replace(/\\n/g,"\n");
		var href = $(Element).children("a").first().attr("href");
		var labelDir = $(Element).attr("label-dir");
		var labelTer = $(Element).attr("label-ter");
		var links = $(Element).attr("link");
		//Numerize the link numbers, set to 0 base
		if(typeof links !="undefined"){
			links = links.split(",");
			for(var i in links)
				links[i] = parseInt(links[i]-1);
		}
		//Create the station
		var s = new Station(name,href,labelDir,labelTer,links);
		//Add each terminal(start from 1 to prevent overflow)
		var terminals = $(Element).attr("pos").split(/[,;]/);
		for(var i=1;i<=terminals.length;i+=2)
			s.addTerminal(new Coordinate(parseInt(terminals[i-1]),parseInt(terminals[i])));
		s.paint();
	}
);
reOrderStations();

//Hide the info lists
main.hide();
