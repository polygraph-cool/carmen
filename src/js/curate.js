import $ from './dom';
import Tweet from './tweet';
import Render from './render';
import Categories from './categories';
import Colors from './colors';

const BADGE_R = 3;
const DURATION = 1000;

const exampleTweet = {
	name: 'The Pudding',
	handle: '@puddingviz',
	text: 'We ❤️ Carmen Sandiego',
	time: '11/14/18 12:39 PM'
};

let sampleSize = 0;
let simulation = null;

const $curate = d3.select('#curate');
const $nav = $curate.select('nav');
const $step = $curate.selectAll('.step');

let badgeData = [];
let tweetData = null
let nodes = [];

let width = 0;
let height = 0;
let centerX = 0;
let centerY = 0;
let radius = 0;
let currentStep = null;
let timer = null;

const ease = d3.easeCubicOut;

const scaleStrength = d3.scaleLinear();
const voronoi = d3.voronoi();

function handleVorEnter({ data }) {
	const { x, y } = data;
	Tweet.clear({ section: 'curate' });
	Tweet.create({
		data: exampleTweet,
		x,
		y,
		offset: true,
		section: 'curate'
	});
}

function handleNavClick() {
	$nav.selectAll('button').classed('is-active', false);
	const $button = d3.select(this);
	$button.classed('is-active', true);
	const cat = $button.at('data-id');
	runNav(cat);
}

function handleTick() {
	Render.clear($.contextFg);
	nodes.forEach(d => {
		Render.dot({ d, ctx: $.contextFg });
	});
}

function handleEnd() {
	// VORONOI
	voronoi
		.x(d => d.x)
		.y(d => d.y)
		.extent([[0, 0], [width, height]]);

	let $vorPath = $.vor.selectAll('path');

	const polygons = voronoi.polygons(nodes);

	$vorPath = $vorPath
		.data(polygons)
		.enter()
		.append('path')
		.merge($vorPath);

	$vorPath.at('d', d => (d ? `M${d.join('L')}Z` : null));

	$vorPath.on('mouseenter', handleVorEnter);
	// $vorPath.on('mouseout', handleVorE);
	// else $vorPath.on('mouseenter', handleVorEnter);
}

function runSim() {
	// const alpha = 1;
	// const alphaDecay = 0.0227;
	// const alphaMin = 0.001;
	// const alphaTarget = 0.0;
	// const velocityDecay = 0.4;
	const alphaDecay = 0.0227;
	const alphaMin = 0.001;
	const alphaTarget = 0.0;
	const velocityDecay = 0.4;
	const manyBodyStrength = -radius * 1.5;

	simulation = d3
		.forceSimulation(nodes)
		.on('tick', handleTick)
		.alphaDecay(alphaDecay)
		.alphaMin(alphaMin)
		.alphaTarget(alphaTarget)
		.velocityDecay(velocityDecay)
		.force('x', d3.forceX(centerX))
		.force('y', d3.forceY(centerY))
		.force('charge', d3.forceManyBody().strength(manyBodyStrength))
		.on('end', handleEnd);
}

function runNav(cat) {
	Tweet.clear({ section: 'curate' });
	const c = Categories.find(c => c.cat === cat);
	const sample = Math.floor(c.count * sampleSize);

	badgeData.forEach(n => {
		n.x = n.ox;
		n.y = n.oy;
		n.r = n.or;
	});

	nodes = badgeData.filter(d => d.category === cat).slice(0, sample);

	nodes.forEach(d => {
		d.sr = d.or;
		d.tr = radius;
	});

	// transition scale
	if (timer) timer.stop();

	timer = d3.timer(elapsed => {
		// compute how far through the animation we are (0 to 1)
		const t = Math.min(1, ease((elapsed / DURATION) * 0.5));

		// update point positions (interpolate between source and target)
		nodes.forEach(d => {
			d.r = d.sr * (1 - t) + d.tr * t;
		});

		// if this animation is over
		if (t === 1) {
			// stop this timer for this layout and start a new one
			timer.stop();
		}
	});

	// console.log({ sample });
	runSim();
}

function runIntro() {
	if (simulation) simulation.stop();
	Render.clear($.contextBg);
	Render.clear($.contextFg);

	nodes = badgeData;

	nodes.forEach(d => {
		d.sx = d.x;
		d.sy = d.y;
		d.tx = d.ox;
		d.ty = d.oy;
		d.sr = d.r;
		d.tr = d.or;
		d.fill = Colors[d.category];
	});

	if (timer) timer.stop();

	timer = d3.timer(elapsed => {
		// compute how far through the animation we are (0 to 1)
		const t = Math.min(1, ease(elapsed / DURATION));

		// update point positions (interpolate between source and target)
		nodes.forEach(d => {
			d.x = d.sx * (1 - t) + d.tx * t;
			d.y = d.sy * (1 - t) + d.ty * t;
			d.r = d.sr * (1 - t) + d.tr * t;
		});

		// console.log(nodes[0]);
		// update what is drawn on screen
		Render.clear($.contextFg);
		nodes.forEach(d => {
			Render.dot({ d, ctx: $.contextFg });
		});

		// if this animation is over
		if (t === 1) {
			// stop this timer for this layout and start a new one
			timer.stop();
		}
	});
}

function enter(step) {
	Tweet.clear({ section: 'curate' });
	currentStep = step;
	if (currentStep === 'intro') runIntro();
	else if (currentStep === 'nav') runNav('edutainment');
}

function exit(step) {
	Tweet.clear({ section: 'curate' });
	currentStep = step === 'nav' ? 'intro' : 'nav';
	if (currentStep === 'intro') runIntro();
}

function clear() {
	Tweet.clear({ section: 'curate' });
}

function resize() {
	sampleSize = 0.05;
	width = $.chart.node().offsetWidth;
	height = $.chart.node().offsetHeight;
	centerX = width / 2;
	centerY = height / 2;

	const stepSize = $step.size();
	const stepHeight = window.innerHeight;
	$step.st('height', stepHeight).classed('is-visible', true);
	// .st('height', (d, i) => stepHeight * (i === stepSize - 1 ? 2 : 1))

	const { scale, offsetW, offsetH } = Render.getScale();

	badgeData.forEach(b => {
		b.ox = scale * b.cx + offsetW;
		b.oy = scale * b.cy + offsetH;
		b.or = scale * BADGE_R;
		b.x = centerX;
		b.y = centerY;
		b.r = 0;
	});

	radius = BADGE_R * 3;

	enter(currentStep);
}

function init(data) {
	badgeData = data.badge.map(d => ({
		...d
	}));
	tweetData = data.curate
	// .slice(0, 1);
	$nav.selectAll('button').on('click', handleNavClick);
}

export default { init, resize, enter, exit, clear };
