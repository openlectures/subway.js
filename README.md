OLsubwaymap
===========

Javascript app to display an interactive subway map. Javascript reads from HTML and uses Raphael to render a map.

##Introduction
This app allows a user to render a subway map from HTML lists.
Features includes:
* Rendering of "stations" and 4-directional "tracks"
* Islands to group "stations"
* Interactive "stations" that could show additional links
* Automatic scaling of map to the width of it's container
* Display a grid to aid positioning

The map works on a grid system. Cooridnates are defined at the cross-sections of the grid, and __all__ settings in the HTML file should be defined in terms of grid coordinates.

###Libraries
* Rapheal: http://raphaeljs.com/ 
    * ScaleRapheal: http://www.shapevent.com/scaleraphael/
* jQuery: http://jquery.com/
    * jQuery throttle / debounce: http://benalman.com/projects/jquery-throttle-debounce-plugin/

##Set-up
Include the Javascript libraries in your HTML file header. They are provided in the resources folder.
```xml
<script type="text/javascript" src="./resources/jquery.min.js"></script>
<script type="text/javascript" src="./resources/raphael-min.js"></script>
<script type="text/javascript" src="./resources/scale.raphael.js"></script>
<script type="text/javascript" src="./resources/jquery.ba-throttle-debounce.min.js"></script>
```
Include *olsubway.js* in the HTML file body, at the end.
>Note: the script has to be at the end or it will not work.

```xml
<script type="text/javascript" src="./olsubway.js"></script>
```
Create a `<div>` tag. The map will be contained within the tag. `data-debug="true"` can be included to display a grid for referencing. The width and height of the canvas will be determined automatically from the elements created.
```xml
<div ID="subway" data-debug="true"></div>
```
All further elements shall go between this tag.

##Stations
Stations are where your data-points are shown. This app supports stations with multiple "terminals", i.e. A station may take up more than a single point. Terminals are connected to each other via connectors in a linear fashion. When the mouse is hovered over a station, the station will "glow".

Stations are defined as elements of an unordered list, and go between a `<ul ID="subway-stations"></ul>` tag. Each element defines the coordinates of the terminals, and they are linked in order of how they are specified. X and Y coordinates are seperated by a comma, and coordinate pairs are seperated by a semi-colon. 

Each station can be named. Simply include the name of the station anywhere between the list element tag. The location of the label can then be specified(N,NE,E,SE,S,SW,W,NW), with the default being South. You can also specify the terminal which the label appears next to, e.g. `label-ter="1"` will place the label next to the first terminal you have specified. First terminal is selected by default.

Hyperlinks can be added to the stations. Include them using `<a href="url"></a>` as you would normally do, inside the list element. 

Refer to the example below:
```xml
<ul ID="subway-stations">
	<li data-pos="2,2; 4,4; 2,6" data-label-dir="E" data-label-ter="3" ><a href="http://www.google.com/">Google</a></li>
	<li data-pos="13, 8; 13,9" data-label-ter = "2">ABC</li>
	<li data-pos="11,16" data-label-dir="SE">DEF</li>
	<li data-pos="2,18"></li>
	<li data-pos="6,18"></li>
</ul>
```
>Note: All data attributes are defined as custom HTML attributes, as defined in HTML5.

###Links
Stations that are related can be "linked". When the mouse is hovered over a station, all stations that are linked to it will also light up, in a different colour. To define links, enter the station numbers of the links in the `data-links` attribute. Station numbers are defined in the order in which the station are listed, i.e. The first list item is Station 1, the second Station 2. Station numbers are also displayed on the station itself.

In the example below, when the mouse is hovered over the Station "ABC", Station "Google" and "DEF" will also light up.
```xml
<ul ID="subway-stations">
	<li data-pos="2,2; 4,4; 2,6" data-label-dir="E" data-label-ter="3" data-link="2,3,5,22" ><a href="http://www.google.com/">Google</a></li>
	<li data-pos="13, 8; 13,9" data-label-ter = "2" data-link="1,3">ABC</li>
	<li data-pos="11,16" data-label-dir="SE">DEF</li>
	<li data-pos="2,18" data-link="2"></li>
	<li data-pos="6,18"></li>
</ul>
```

##Tracks
Tracks connect the various "stations". Currently, this app supports 4-directions for tracks (North, South, East, West), with smooth turns. 

Each track is an unordered list, under `class="subway-tracks"`, with each element representing a segment. Specify the colour of the track, as well as the starting point. A track that is defined first will appear behind a track defined later, should they overlap.

For each subsequent segment, you may:

1. Define a straight link by simply specifying the coordinates of the next point.
2. Define a curve, by specifying the coordinates of the next point, as well as the direction the track faces after the curve.

At the end of the defined track, an arrowhead will point to the final destination. Avoid defining sharp turns at the very end to prevent the arrow to appear in an awkard way.

Refer to the example below:
```xml
<ul class="subway-tracks" data-color="#f3b" data-start-point="2,2">
    <li data-dest="5,2"></li>
    <li data-dest="6,3" data-turn="S"></li>
    <li data-dest="6,6"></li>
    <li data-dest="9,9" data-turn="E"></li>
    <li data-dest="16,9"></li>
    <li data-dest="17,10" data-turn="S"></li>
    <li data-dest="15,12" data-turn="W"></li>
    <li data-dest="11,16" data-turn="S"></li>
    <li data-dest="9,18" data-turn="W"></li>
    <li data-dest="2,18"></li>
</ul>
```
> Note that it is possible to create tracks that do not stick to the four directions this app is designed to handle, though it might not look the way it is intended to look like.

##Islands
Islands can be used to group certain "stations". All islands should be defined between a `<ul ID="subway-islands"></ul>` tag.

Each island is an unordered list, under `class="subway-tracks"`, with each element defining an edge (with coordinates) of the island. Specify the name, background colour, label font size and colour. The name of the island will be displayed at the centroid of the polygon which defines the island. Refer to the exmaple below.
```xml
<ul class="subway-islands" data-island-name="Test" data-background-color="#ddd" data-font-size="50px" data-font-color="#fff">
    <li data-edge="1,1"></li>
    <li data-edge="18.5,1"></li>
    <li data-edge="18.5,20"></li>
    <li data-edge="10,25"></li>
    <li data-edge="1,20"></li>
</ul>
```
> As islands do not have to be defined along the grid, you may use decimals for the coordinates.

##Scaling
The map is scaled automatically based on the width of the container it is in, i.e. The container of the `<div>` tag.

The map is rescaled(debounced) when the window is resized. Thus, in any application where the map container's width is changed when resizing the window, the map will be scaled accordingly to fit the width of the container.
>This means that the map will fit exactly into the container horizontally, but not vertically.

##Development
This app is developed under openlectures.

Contact: hello@openlectures.org

Website: http://openlectures.org/

##Copyright and License

Licensed under the MIT License (MIT).

Copyright © 2013 openlectures LLP (http://openlectures.org/).

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
