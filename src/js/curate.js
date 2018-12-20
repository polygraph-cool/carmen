import $ from './dom';
import Tweet from './tweet';
import Render from './render';
import categories from './categories';

const BADGE_W = 1280;
const BADGE_H = 1024;
const BADGE_R = 2.5;
// const RADIUS_INC = 0.1;

const COL = {
	a: '#3d66f9',
	b: '#62c6f9',
	c: '#29cc7a',
	d: '#fcd206'
};

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
let nodes = [];

let centerX = 0;
let centerY = 0;
let radius = 0;
let currentStep = null;

const scaleStrength = d3.scaleLinear();

function handleMouseEnter(d) {
	const { x, y } = d;
	Tweet.clear();
	Tweet.create({
		data: exampleTweet,
		x,
		y,
		offset: true
	});
	$.nodes.selectAll('.node').classed('is-highlight', false);
	d3.select(this).classed('is-highlight', true);
}

function handleMouseOut() {}

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
		// scale radius smoothly
		// if (d.r !== d.targetR) d.r += RADIUS_INC;
		// d.r = Math.min(d.targetR, d.r);
		Render.dot({ d, ctx: $.contextFg });
	});
}

function handleEnd() {
	nodes.forEach(d => {
		d.r = radius;
	});
	handleTick();
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
	const c = categories.find(c => c.cat === cat);
	const sample = Math.floor(c.count * sampleSize);

	nodes = badgeData
		.filter(n => n.category === cat)
		.slice(0, sample)
		.map(n => ({
			...n,
			targetR: radius
		}));
	console.log({ sample });
	runSim();
}

function runIntro() {
	Render.clear($.contextBg);
	Render.clear($.contextFg);

	// $edu = #e50914
	// $role = #3d66f9
	// $fashion = #62c6f9
	// $culture = #29cc7a
	// $travel = #fcd206

	badgeData.forEach(d => {
		d.fill = COL[d.category];
		Render.dot({ d, ctx: $.contextFg });
	});
}

function enter(step) {
	currentStep = step;
	if (currentStep === 'intro') runIntro();
	else if (currentStep === 'nav') runNav('a');
}

function exit(step) {
	currentStep = step === 'nav' ? 'intro' : 'nav';
}

function handoff(direction) {
	// handleNavClick.call($nav.select('label').node());
}

function resize() {
	sampleSize = 0.05;
	centerX = $.chart.node().offsetWidth / 2;
	centerY = $.chart.node().offsetHeight / 2;

	const stepSize = $step.size();
	const stepHeight = window.innerHeight;
	$step.st('height', stepHeight).classed('is-visible', true);
	// .st('height', (d, i) => stepHeight * (i === stepSize - 1 ? 2 : 1))

	const { scale, offsetW, offsetH } = Render.getScale();

	badgeData.forEach(b => {
		b.x = scale * b.cx + offsetW;
		b.y = scale * b.cy + offsetH;
		b.r = scale * BADGE_R;
	});

	radius = 8;

	enter(currentStep);
}

function init(data) {
	badgeData = data.map(d => ({ ...d }));
	$nav.selectAll('button').on('click', handleNavClick);
}

export default { init, resize, enter, exit, handoff };
