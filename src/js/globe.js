import * as topojson from 'topojson';
import $ from './dom';

const $section = d3.select('#globe');
const $step = $section.selectAll('.step');

// $.globe is a reference to the <g> element
// that all globe stuff should go inside

// svg dom elements
let $outline = null;
let $sphere = null;
let $pathCountry = null;
let $pathGraticule = null;
let $pathBorder = null;
let $pathLand = null;

let projection = null;
let path = null;
let ready = false;

let currentStep = 'categories';

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

		const radius = height / 2.5;
		const scale = radius;

		projection
			.translate([width / 2, height / 2])
			.scale(scale)
			.clipAngle(90);

		$outline
			.at('cx', width / 2)
			.at('cy', height / 2)
			.at('r', projection.scale());

		$sphere.at('d', path({ type: 'Sphere' }));

		$pathGraticule.at('d', path);
		$pathBorder.at('d', path);
		$pathLand.at('d', path);
		$pathCountry.at('d', path);

		$.globe.translate([0, 0]);
	}
}

function goTo({ coords, duration = 2000 }) {
	const [lat, lon] = coords;
	d3.transition()
		.duration(duration)
		.ease(d3.easeCubicInOut)
		.tween('rotate', () => {
			const r = d3.interpolate(projection.rotate(), [-lon, -lat]);

			return t => {
				projection.rotate(r(t));
				$pathGraticule.at('d', path);
				$pathBorder.at('d', path);
				$pathLand.at('d', path);
				$pathCountry.at('d', path);
			};
		});
}

function update() {
	console.log({ currentStep });
}

function step(index) {
	const $s = $step.filter((d, i) => i === index);
	currentStep = $s.at('data-step');
	update();
}

function setup(world) {
	projection = d3.geoOrthographic();
	path = d3.geoPath().projection(projection);

	const countries = topojson.feature(world, world.objects.countries).features;
	const land = topojson.feature(world, world.objects.land);

	const mesh = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
	$sphere = $.globe.append('path.sphere');
	$pathGraticule = $.globe.append('path.graticule');
	$pathLand = $.globe.append('path.land');
	$pathBorder = $.globe.append('path.border');

	$pathBorder.datum(mesh);
	$pathLand.datum(land);

	// const $pathLand = $svg.append('path.land');
	$pathCountry = $.globe
		.selectAll('.country')
		.data(countries)
		.enter()
		.append('path.country');

	$outline = $.globe.append('circle.outline');

	const graticule = d3.geoGraticule();
	$pathGraticule.datum(graticule);
	// $pathLand.datum(land).at('d', path);
}

function init() {
	d3.loadData('assets/data/world-110m.json', (err, response) => {
		if (err) console.log(err);
		setup(response[0]);
		ready = true;
		resize();
	});
}

export default { init, resize, step };
