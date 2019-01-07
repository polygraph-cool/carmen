import * as topojson from 'topojson';
import $ from './dom';
import Render from './render';
import Tweet from './tweet';
import Color from './colors';


const firstStepCoords = [46.738586,24.7136];

const $section = d3.select('#globe');
const $step = $section.selectAll('.step');
const $planeEl = d3.select('.airplane').node();

const DURATION = 2000;
const ARC_WIDTH = 2;
const MARKER_RADIUS = 2;
const MARKER_COLOR = '#999';
const PATH_COLOR = '#666';
const LOFT = 1.8;
const LINE_WIDTH = 1;

let loftedness = 1.3;


let land = null;
let swoosh = null;
let fauxSwoosh = null;
let center = null;
let globeCoordinates = null;
let loftedProjection = null;
let projection = null;
let path = null;
let fauxPathElement = null;
let textElement = null;
let ready = false;
let width = 0;
let height = 0;
let stepWidth = 0;
let adjustRetina = 0;

const current = {};

function locationAlongArc(start, end, theta) {
	return d3.geoInterpolate(start, end)(theta);
}

function lineLength(points) {
	let d = 0;
	for (let i = 0; i < points.length - 1; i += 1) {
		const x0 = points[0][0];

		const y0 = points[0][1];

		const x1 = points[1][0];

		const y1 = points[1][1];

		const dx = x1 - x0;

		const dy = y1 - y0;
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

function updateCanvasGlobe() {
	const sphere = { type: 'Sphere' };
	center = [width / 2, height / 2];

	Render.clear($.contextGlobe);
	$.contextGlobe.beginPath();
	$.contextGlobe.setLineDash([]);
	path(sphere);
	$.contextGlobe.lineWidth = LINE_WIDTH;
	$.contextGlobe.strokeStyle = PATH_COLOR;
	$.contextGlobe.stroke();
	projection.clipAngle(90);
	$.contextGlobe.beginPath();
	$.contextGlobe.setLineDash([]);
	path(land);
	$.contextGlobe.lineWidth = LINE_WIDTH;
	$.contextGlobe.strokeStyle = PATH_COLOR;
	$.contextGlobe.stroke();
}

function addTweetBox(coord) {
	console.log(active);
	const p = projection(coord);

	const x = p[0]*(1/adjustRetina) + stepWidth;

	const y = p[1]*(1/adjustRetina);
	if (current.step !== 'categories' && active) {
		const data = {
			text: current.tweet,
			handle: current.user,
			category: 'money',
			star_tweet: 'x'
		};
		Tweet.create({
			data,
			x,
			y,
			fade: true,
			offset: true,
			section: 'globe'
		});
	}
}

function updateMarkers(markers) {
	for (const marker in markers) {
		const coords = markers[marker];
		const p = projection(coords);

		const x = p[0];

		const y = p[1];

		const gDistance = d3.geoDistance(coords, projection.invert(center));

		if (gDistance < 1.57) {
			$.contextGlobe.beginPath();
			$.contextGlobe.arc(x, y, MARKER_RADIUS, 0, 2 * Math.PI);
			$.contextGlobe.fillStyle = MARKER_COLOR;
			$.contextGlobe.fill();
		}
	}
}

function addFinalMarker(coord) {
	const p = projection(coord);

	const x = p[0];

	const y = p[1];

	$.contextGlobe.beginPath();
	$.contextGlobe.arc(x, y, 10*adjustRetina, 0, 2 * Math.PI);
	$.contextGlobe.strokeStyle = 'rgba(255,0,0,.5)';

	$.contextGlobe.stroke();

	$.contextGlobe.beginPath();
	$.contextGlobe.arc(x, y, 20*adjustRetina, 0, 2 * Math.PI);
	$.contextGlobe.strokeStyle = 'rgba(255,0,0,.5)';
	$.contextGlobe.stroke();
}

function updateTextLabels(textString, coord) {

	var width = +$.canvasGlobe
		.style("width").replace("px","");

	var svgWidth = +$.svg.style("width").replace("px","");

	const p = projection(coord);

	const x = p[0]*(1/adjustRetina) + (svgWidth-width);

	const y = p[1]*(1/adjustRetina);

	const offset = 40;

	textElement.attr('transform', `translate(${x},${y + offset})`);

	const gDistance = d3.geoDistance(coord, projection.invert(center));

	if (gDistance < 1.57) {
		textElement.style('display', 'block');
	} else {
		textElement.style('display', 'none');
	}
}

function showStatic(globeCoordinates){

	textElement.text(current.country);
	let focalPoint = null;

	function focusGlobeOnPoint(point) {
		const x = point[0];

		const y = point[1];

		const cx = x;

		const cy = y - 0;

		const rotation = [-cx, -cy];
		projection.rotate(rotation);
		loftedProjection.rotate(rotation);
	}

	function draw(globeCoordinates) {
		// Rotate globe to focus on the flying arc
		focusGlobeOnPoint(globeCoordinates);
		updateCanvasGlobe();
		//updateMarkers([coordsStart, coordsEnd]);
		updateTextLabels(current.city, globeCoordinates);
		addFinalMarker(globeCoordinates);
		addTweetBox(globeCoordinates)
		// $.contextGlobe.save();
		// $.contextGlobe.translate(x, y);
		// $.contextGlobe.rotate(r);
		// $.contextGlobe.restore();
	};
	if(current.step != "categories"){
		draw(globeCoordinates);
	}

}

function createImages(){
}

function goTo(coordsStart, coordsEnd) {
	let focalPoint = null;
	let flyingArcLength = null;
	textElement.text(current.country);
	//&&
	function focusGlobeOnPoint(point) {

		const x = point[0];
		const y = point[1];
		const cx = x;
		const cy = y + 10;
		const rotation = [-cx, -cy];

		projection.rotate(rotation);
		loftedProjection.rotate(rotation);
	}

	let heading = 0;

	const draw = t => {
		// Rotate globe to focus on the flying arc
		focusGlobeOnPoint(focalPoint(t));
		updateCanvasGlobe();
		updateMarkers([coordsStart, coordsEnd]);
		updateTextLabels(current.country, coordsEnd);

		$.contextGlobe.beginPath();
		swoosh(flyingArc([coordsStart, coordsEnd]));
		$.contextGlobe.setLineDash([t * flyingArcLength * 1.7, 1e6]);
		$.contextGlobe.strokeStyle = Color.edutainment;
		$.contextGlobe.lineWidth = ARC_WIDTH;

		$.contextGlobe.stroke();

		fauxPathElement.attr('d', fauxSwoosh(flyingArc([coordsStart, coordsEnd])));
		const svgLine = fauxPathElement.node();
		const p = svgLine.getPointAtLength(t * flyingArcLength * 1.7);

		const pF = svgLine.getPointAtLength(1 * flyingArcLength * 1.7);
		const xF = pF.x;
		const yF = pF.y;

		const { x, y } = p;

		const t2 = Math.min(t + 0.05, 1);
		const p2 = svgLine.getPointAtLength(t2 * flyingArcLength * 1.7);

		const x2 = p2.x;
		const y2 = p2.y;

		const dP = [x2 - x, y2 - y];
		const mag = dP[0] * dP[0] + dP[1] * dP[1];
		if (mag > 0.00000005) {
			// Don't update heading for ships that aren't moving; it's distracting
			const targetHeading = (-Math.atan2(dP[1], dP[0]) * 180) / Math.PI + 90;
			let dH = targetHeading - heading;
			if (dH > 180) dH -= 360; // Prevent spinouts
			if (dH < -180) dH += 360;
			heading += dH * 0.5;

			if (heading > 360) heading -= 360;
			if (heading < -360) heading += 360;
		}
		const r = 135 + heading * -(Math.PI / 180);
		const gDistance = d3.geoDistance([x, y], [xF, yF]);


		if (gDistance === 0) {
			addFinalMarker(coordsEnd);
		}
		$.contextGlobe.save();
		$.contextGlobe.translate(x, y);
		$.contextGlobe.rotate(r);

		$.contextGlobe.drawImage($planeEl, -(40*adjustRetina / 2), -(40*adjustRetina / 2), 40*adjustRetina, 40*adjustRetina);
		$.contextGlobe.restore();
	};

	const shuffle = () => {
		focalPoint = d3.geoInterpolate(coordsStart, coordsEnd);
		flyingArcLength = lineLength(flyingArc([coordsStart, coordsEnd]));

		// flyingArcLength = lineLength(flyingArc(link));

		const tick = elapsed => {
			const t0 = elapsed / DURATION;

			const t = d3.easeSinInOut(t0);
			draw(t);
			if (t0 >= 1) {
				timer.stop();
				addTweetBox(coordsEnd);
			}
		};

		const timer = d3.timer(tick);
	};
	shuffle();

}

function update() {
	const newCoords = [+current.lon, +current.lat];
	console.log(newCoords);
	Tweet.clear({ section: 'globe' });

	if (current.step === 'categories') {
		globeCoordinates = firstStepCoords;
		console.log(globeCoordinates);
	}
	if (ready) {
		if(current.step === 'categories'){
			updateCanvasGlobe();
			textElement.text("")
		}
		else if(globeCoordinates[0] == newCoords[0] && globeCoordinates[1] == newCoords[1]){
			showStatic(globeCoordinates);
		}
		else{
			goTo(globeCoordinates, newCoords);
		}
	}
	globeCoordinates = newCoords;
}

function step(index) {
	const $s = $step.filter((d, i) => i === index);
	['step', 'lat', 'lon', 'tweet', 'user', 'city', 'country'].forEach(d => {
		current[d] = $s.at(`data-${d}`);
	});

	$s.classed('is-visible', true);

	update();
}

function resize() {
	// resize stepper elements
	const stepHeight = window.innerHeight;
	stepWidth = d3.select('.globe__steps').node().offsetWidth;
	$step.st('height', stepHeight)//.classed('is-visible', true);

	// resize all the globe stuff
	if (ready) {
		height = $.canvasGlobe.node().offsetHeight * Render.getDPR();
		width = $.canvasGlobe.node().offsetWidth * Render.getDPR();
		const smaller = Math.min(width, height);
		const radius = smaller / 2.5;
		const scale = radius;

		fauxPathElement = $.globe.append('path');

		textElement = $.globe.append('text');

		projection
			.scale(scale)
			.translate([width / 2, height / 2])
			.precision(0.1)
			.clipAngle(90);

		loftedProjection = d3.geoOrthographic()
    	.scale(((height - 10) / 2) * loftedness)
    	.translate([width / 2, height / 2])
    	.precision(0.1)
			.clipAngle(90)
			;

		const x = firstStepCoords[0];
		const y = firstStepCoords[1];
		const cx = x;
		const cy = y;
		const rotation = [-cx, -cy];
		projection.rotate(rotation);
		loftedProjection.rotate(rotation);

		path.projection(projection).context($.contextGlobe);
		fauxSwoosh = d3
			.line()
			.curve(d3.curveNatural)
			.defined(d => projection.invert(d));

		swoosh = d3
			.line()
			.curve(d3.curveNatural)
			.defined(d => projection.invert(d))
			.context($.contextGlobe);

		updateCanvasGlobe();
	}
}

function setup(world) {

	var widthCanvasDom = +$.canvasGlobe
		.style("width").replace("px","");

	var widthRetinaDom = +$.canvasGlobe
		.attr("width");

	adjustRetina = (widthRetinaDom/widthCanvasDom);

	console.log(adjustRetina);

	projection = d3.geoOrthographic();
	path = d3.geoPath();
	land = topojson.feature(world, world.objects.countries);
	var stepsColors = d3.select(".globe__steps").selectAll(".step").each(function(d){
		var stepName = d3.select(this).attr("data-step");

		d3.select(this).select(".destination-wrapper")
			.style("color",Color[stepName])

		d3.select(this).select(".destination-wrapper")
			.select(".destination-plane")
			.select("path")
			.style("fill",Color[stepName])
			;
	})
}

let active = false;

function clear() {
	active = false;
	Tweet.clear({ section: 'globe' });
	Render.clear($.contextEx);
}

function enterSection() {
	Render.clear($.contextFg);
	active = true;
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

export default { init, resize, step, enterSection, clear};
