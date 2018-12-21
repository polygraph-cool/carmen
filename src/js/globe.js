import * as topojson from 'topojson';
import $ from './dom';

const $map = d3.select('#map');
const $step = $map.selectAll('.step');

let $outline = null;
let $sphere = null;
let $pathCountry = null;
let $pathGraticule = null;
let $pathBorder = null;
let $pathLand = null;

let projection = null;
let path = null;
let ready = false;
let tweetData = [];

function resize() {
	const stepHeight = window.innerHeight;

	const stepSize = $step.size();
	$step
		.st('height', (d, i) => stepHeight * (i === stepSize - 1 ? 2 : 1))
		.classed('is-visible', true);

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

		$.map.translate([0, 0]);
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
				// $pathLand.at('d', path);
				$pathCountry.at('d', path);
				// context.clearRect(0, 0, width, height);
				// context.beginPath();
				// path(land);
				// context.fill();
				// context.beginPath();
				// context.arc(width / 2, height / 2, radius, 0, 2 * Math.PI, true);
				// context.lineWidth = 2.5;
				// context.stroke();
			};
		});
}

function handoff(direction) {
	const data = tweetData.filter(d => d.chosen);
	const $node = $.nodes.selectAll('.node').data(data, d => d.category);

	const $nodeEnter = $node
		.enter()
		.append('g')
		.at('class', d => `node node-${d.category}`);

	$nodeEnter.each((d, i, n) => {
		if (d.chosen) {
			d3.select(n[i]).append('circle.outer');
			d3.select(n[i]).append('circle.mid');
		}
	});

	$nodeEnter.append('circle.inner');

	$node.exit().remove();

	const $nodeMerge = $nodeEnter.merge($node);

	$nodeMerge
		.transition()
		.duration(500)
		.translate(d => [Math.random() * 500, Math.random() * 500]);
}

function setup(world) {
	projection = d3.geoOrthographic();
	path = d3.geoPath().projection(projection);

	const countries = topojson.feature(world, world.objects.countries).features;
	const land = topojson.feature(world, world.objects.land);

	const mesh = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);

	$sphere = $.map.append('path.sphere');
	$pathGraticule = $.map.append('path.graticule');
	$pathLand = $.map.append('path.land');
	$pathBorder = $.map.append('path.border');

	$pathBorder.datum(mesh);
	$pathLand.datum(land);

	// const $pathLand = $svg.append('path.land');
	$pathCountry = $.map
		.selectAll('.country')
		.data(countries)
		.enter()
		.append('path.country');

	$outline = $.map.append('circle.outline');

	const graticule = d3.geoGraticule();
	$pathGraticule.datum(graticule);

	// $pathLand.datum(land).at('d', path);
}

function init(data) {
	tweetData = data;
	d3.loadData('assets/data/world-110m.json', (err, response) => {
		if (err) console.log(err);
		setup(response[0]);
		ready = true;
	});
}

export default { init, resize, handoff };
