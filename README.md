OLsubwaymap
===========

Javascript app to display an interactive subway map. Javascript reads from HTML and uses Raphael to render a map.

##Introduction
This app allows a user to render a subway map from HTML lists.
Features includes:
* Rendering of "stations" and 4-directional "tracks"
* Islands to group "stations"
* Interactive "stations" that could show additional links

The map works on a grid system, with each grid taking up ??? pixels. Cooridnates are defined at the cross-sections of the grid, and __all__ settings in the HTML file should be defined in terms of grid coordinates.

###Libraries
* Rapheal: http://raphaeljs.com/ 
* jQuery: http://jquery.com/

##Set-up
Include the Javascript libraries in your HTML file header. They are provided in the resources folder.
```xml
<script type="text/javascript" src="./resources/jquery.min.js"></script>
<script type="text/javascript" src="./resources/raphael-min.js"></script>
```
Include *olsubway.js* in the HTML file body
```xml
<script type="text/javascript" src="./olsubway.js"></script>
```
Create a `<div>` tag, specifying the height and width (in grid coordinates) of the map window. The map shall be placed at the position the contents of the tag resides.
```xml
<div ID="subway" height="50" width = "50"></div>
```
All further elements shall go between this tag.

##Tracks
Tracks connect the various "stations". Currently, this app supports 4-directions for tracks (North, South, East, West), with smooth turns. All tracks should be defined between a `<ul ID="subway-tracks"></ul>` tag.

Each track is another unordered list, with each element representing a segment. Specify the colour of the track, as well as the starting point.

For each subsequent segment, you may:

1. Define a straight link by simply specifying the coordinates of the next point.
2. Define a curve, by specifying the coordinates of the next point, as well as the direction the track faces after the curve.

Refer to the example below:
```xml
<ul ID="subway-tracks">
	<ul color="#f3b" start-point="2,2">
		<li dest="5,2"></li>
		<li dest="6,3" turn="S"></li>
		<li dest="6,6"></li>
		<li dest="9,9" turn="E"></li>
		<li dest="16,9"></li>
		<li dest="17,10" turn="S"></li>
		<li dest="15,12" turn="W"></li>
		<li dest="11,16" turn="S"></li>
		<li dest="9,18" turn="W"></li>
		<li dest="2,18"></li>
	</ul>
</ul>
```
> Note that it is possible to create tracks that do not stick to the four directions this app is designed to handle, though it might not look the way it is intended to look like.

##Islands
Islands can be used to group certain "stations". All islands should be defined between a `<ul ID="subway-islands"></ul>` tag.

Each island is another unordered list, with each element defining an edge (with coordinates) of the island. Specify the name, background colour, label font size and colour. The name of the island will be displayed at the centroid of the polygon which defines the island. Refer to the exmaple below.
```xml
<ul island-name="Test" background-color="#ddd" font-size="32px" font-color="#fff">
	<li edge="1,1"></li>
	<li edge="18.5,1"></li>
	<li edge="18.5,20"></li>
	<li edge="10,25"></li>
	<li edge="1,20"></li>
</ul>
```
> As islands do not have to be defined along the grid, you may use decimals for the coordinates.