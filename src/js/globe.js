import * as topojson from 'topojson';
import $ from './dom';

const $section = d3.select('#globe');
const $step = $section.selectAll('.step');

// $.globe is a reference to the <g> element
// that all globe stuff should go inside

// svg dom elements
let globeContext = null;
let globeCanvas = null;
let land = null;
let flyingArcWidth = 2;
let flyingArcColor = 'red';
let cityMarkerRadius = 2;
let cityMarkerColor = '#999';
let swoosh = null;
let fauxSwoosh = null;
let loftedness = 1.3;
let center = null;

var plane = document.getElementById('airplane');

const pathColor = "#666";
const lineWidth = 1;
let globeCoordinates = null;
let loftedProjection = null;
let projection = null;
let graticule = null;
let path = null;
let ready = false;
let fauxPathElement = null;
let textElement = null;
const current = {};

function resize() {
	// resize stepper elements
	const stepHeight = window.innerHeight;

	const stepSize = $step.size();
	$step
		.st('height', (d, i) => stepHeight * (i === stepSize - 1 ? 2 : 1))
		.classed('is-visible', true);

	// resize all the globe stuff
	if (ready) {

		const height = $.chart.node().offsetHeight;
		const width = $.chart.node().offsetWidth;
		const speed = -1e-2;
		const start = Date.now();
		const sphere = {type: "Sphere"};


		const radius = height / 2.5;
		const scale = radius;

		fauxPathElement = $.globe.append("path");

		textElement = $.globe.append("text");

		globeCanvas
			.attr("width", width)
			.attr("height", height);

		projection
			.scale(scale)
			.translate([width / 2, height / 2])
			.precision(0.1)
			.clipAngle(90)
			;

		loftedProjection = d3.geoOrthographic()
    	.scale(((height - 10) / 2) * loftedness)
    	.translate([width / 2, height / 2])
    	.precision(0.1)
			.clipAngle(90)
			;

		path.projection(projection)
			.context(globeContext);
			;

		fauxSwoosh = d3.line()
			.curve(d3.curveNatural)
			.defined(function(d) { return projection.invert(d); })
			;

		swoosh = d3.line()
		  .curve(d3.curveNatural)
		  .defined(function(d) { return projection.invert(d); })
		  .context(globeContext);

		updateCanvasGlobe();
	}
}

function locationAlongArc(start, end, theta) {
  return d3.geoInterpolate(start, end)(theta);
}

function lineLength(points) {
    var d = 0;
    for (var i = 0; i < points.length - 1; i++) {
        var x0 = points[0][0],
            y0 = points[0][1],
            x1 = points[1][0],
            y1 = points[1][1],
            dx = x1 - x0,
            dy = y1 - y0;
        d += Math.sqrt(dx * dx + dy * dy);
    }
    return d;
}

function flyingArc(coords) {
    var source = coords[0];
    var target = coords[1];
    var middle = locationAlongArc(source, target, 0.5);
    return [
        projection(source),
        loftedProjection(middle),
        projection(target)
    ];
}

function updateCanvasGlobe(){
	const height = $.chart.node().offsetHeight;
	const width = $.chart.node().offsetWidth;
	const speed = -1e-2;
	const start = Date.now();
	const sphere = {type: "Sphere"};
	center = [width/2,height/2];

	const radius = height / 2.5;
	const scale = radius;

	globeContext.clearRect(0, 0, width, height);
	globeContext.beginPath();
	globeContext.setLineDash([]);
	path(sphere);
	globeContext.lineWidth = lineWidth;
	globeContext.strokeStyle = pathColor;
	globeContext.stroke();
	projection.clipAngle(90);

	globeContext.beginPath();
	globeContext.setLineDash([]);
	path(land);
	globeContext.lineWidth = lineWidth;
	globeContext.strokeStyle = pathColor;
	globeContext.stroke();

}

function updateMarkers(markers){

	for (var marker in markers){
		var coords = markers[marker];
		var p = projection(coords),
				x = p[0],
				y = p[1];

		var gDistance = d3.geoDistance(coords, projection.invert(center));

		if(gDistance < 1.57){
			globeContext.beginPath();
			globeContext.arc(x, y, cityMarkerRadius, 0, 2 * Math.PI);
			globeContext.fillStyle = cityMarkerColor;
			globeContext.fill();
		}
	}
}

function addFinalMarker(coord){
	var p = projection(coord),
			x = p[0],
			y = p[1];

	globeContext.beginPath();
	globeContext.arc(x, y, 10, 0, 2 * Math.PI);
	globeContext.strokeStyle = "rgba(255,0,0,.5)";

	globeContext.stroke();

	globeContext.beginPath();
	globeContext.arc(x, y, 20, 0, 2 * Math.PI);
	globeContext.strokeStyle = "rgba(255,0,0,.5)";
	globeContext.stroke();
}

function updateTextLabels(textString,coord){
	var p = projection(coord),
			x = p[0],
			y = p[1];

	var offset = 40;

	textElement.attr("transform","translate("+x+","+(y+offset)+")")
	var gDistance = d3.geoDistance(coord, projection.invert(center));

	if(gDistance < 1.57){
		textElement.style("display","block");
	}
	else{
		textElement.style("display","none");
	}
}

function goTo(coordsStart,coordsEnd) {

	let focalPoint = null;
	let flyingArcLength = null;

	textElement.text(current.city);

	function focusGlobeOnPoint(point) {
	    var x = point[0],
	        y = point[1],
	        cx = x,
	        cy = y - 25,
	        rotation = [-cx, -cy];
	    projection.rotate(rotation);
			loftedProjection.rotate(rotation);
	};

	let heading = 0;

	let finalPlaneCoors = null;

	var draw = function(t){

		// Rotate globe to focus on the flying arc
		focusGlobeOnPoint(focalPoint(t));
		updateCanvasGlobe();
		updateMarkers([coordsStart,coordsEnd]);
		updateTextLabels(current.city,coordsEnd);

		globeContext.beginPath();
		swoosh(flyingArc([coordsStart,coordsEnd]));
		globeContext.setLineDash([t * flyingArcLength * 1.7, 1e6]);
		globeContext.lineWidth = flyingArcWidth;
		globeContext.strokeStyle = flyingArcColor;
		globeContext.stroke();

		fauxPathElement.attr("d",fauxSwoosh(flyingArc([coordsStart,coordsEnd])));
		var svgLine = fauxPathElement.node();
		var lineLength = svgLine.getTotalLength();
		var p = svgLine.getPointAtLength(t * flyingArcLength * 1.7);

		var pF = svgLine.getPointAtLength(1 * flyingArcLength * 1.7);
		var xF = pF.x;
		var yF = pF.y;

		var x = p.x;
		var y = p.y;

		var t2 = Math.min(t + .05, 1);
		var p2 = svgLine.getPointAtLength(t2 * flyingArcLength * 1.7);

		var x2 = p2.x
		var y2 = p2.y

		var dP = [x2 - x, y2 - y];
		var mag = dP[0] * dP[0] + dP[1] * dP[1];
		if(mag > 0.00000005) { // Don't update heading for ships that aren't moving; it's distracting
				var targetHeading = -Math.atan2(dP[1], dP[0]) * 180 / Math.PI + 90;
				var dH = targetHeading - heading;
				if(dH > 180) dH -= 360; // Prevent spinouts
				if(dH < -180) dH += 360;
				heading += (dH) * 0.5;

				if(heading > 360) heading -= 360;
				if(heading < -360) heading += 360;
		}
		var r = 135 + heading * -(Math.PI/180)
		var gDistance = d3.geoDistance([x,y], [xF,yF]);
		// console.log();
		if(gDistance == 0){
			addFinalMarker(coordsEnd);
		}
		globeContext.save();
		globeContext.translate(x, y);
		globeContext.rotate(r);
		globeContext.drawImage(plane, -(40/2), -(40/2), 40, 40);
		globeContext.restore();
	}

	function shuffle() {
		focalPoint = d3.geoInterpolate(coordsStart, coordsEnd);
		flyingArcLength = lineLength(flyingArc([coordsStart, coordsEnd]));

		// flyingArcLength = lineLength(flyingArc(link));
		var transitionEase = d3.easeLinear;
		var timer = d3.timer(tick);
		var transitionDuration = 4000;

		function tick(elapsed) {
				var t0 = elapsed / transitionDuration,
						t = transitionEase(t0);
				draw(t);
				if (t0 >= 1) {
						timer.stop();
				};
		}
	}

	shuffle();

}

function update() {
	console.log(current);
	var newCoords = [+current.lon,+current.lat];
	if(!globeCoordinates || current.step == "categories"){
		globeCoordinates = [-74.0060,40.7128];
	}
	if (ready && globeCoordinates[0] != newCoords[0] && globeCoordinates[1] != newCoords[1]) { //ensure lines aren't drawn when no new coordinates
		goTo(globeCoordinates,newCoords);
	}
	globeCoordinates = newCoords;

}

function step(index) {
	const $s = $step.filter((d, i) => i === index);
	['step', 'lat', 'lon', 'tweet', 'user', 'city', 'country'].forEach(d => {
		current[d] = $s.at(`data-${d}`);
	});
	update();
}

function setup(world) {

	function buildCanvas(){

		var sphere = {type: "Sphere"};

		projection = d3.geoOrthographic()
		graticule = d3.geoGraticule();
		globeCanvas = $.globeCanvas;
		globeContext = globeCanvas.node().getContext('2d');

		path = d3.geoPath()

		land = topojson.feature(world, world.objects.land);

	}

	buildCanvas();

}

function init() {
	d3.loadData('assets/data/world-110m.json', (err, response) => {
		if (err) console.log(err);
		setup(response[0]);
		ready = true;
		resize();
		step(0);
	});
}

export default { init, resize, step };
