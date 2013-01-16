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
