import $ from './dom';
import Tweet from './tweet';
import Render from './render';

const BADGE_W = 1280;
const BADGE_H = 1024;
const BADGE_R = 2.5;
const RADIUS_INC = 0.1;

const exampleTweet = {
	name: 'The Pudding',
	handle: '@puddingviz',
	text: 'We ❤️ Carmen Sandiego',
	time: '11/14/18 12:39 PM'
};

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
	$nav.selectAll('input').prop('checked', false);
	const $label = d3.select(this);
	$label.prop('checked', true);
	const cat = $label
		.parent()
		.select('input')
		.at('value');
	update(cat);
}

function handleTick() {
	// Render.clear($.contextFg);
	nodes.forEach(d => {
		// scale radius smoothly
		if (d.r !== d.targetR) d.r += RADIUS_INC;
		d.r = Math.min(d.targetR, d.r);
		Render.dot({ d, ctx: $.contextFg });
	});
}

function runSim() {
	// const alpha = 1;
	// const alphaDecay = 0.0227;
	// const alphaMin = 0.001;
	// const alphaTarget = 0.0;
	// const velocityDecay = 0.4;
	const alphaDecay = 0.1;
	const alphaMin = 0.001;
	const alphaTarget = 0.2;
	const velocityDecay = 0.4;
	const manyBodyStrength = -radius * 1.5;

	simulation = d3
		.forceSimulation(nodes)
		.on('tick', handleTick)
		.alphaDecay(alphaDecay)
		.alphaMin(alphaMin)
		.alphaTarget(alphaTarget)
		.velocityDecay(velocityDecay)
		.force('center', d3.forceCenter(centerX, centerY))
		.force('x', d3.forceX(centerX))
		.force('y', d3.forceY(centerY))
		.force('charge', d3.forceManyBody().strength(manyBodyStrength));
}

function update(cat) {
	nodes = badgeData
		.filter(d => d.category === cat)
		.map(d => ({
			...d,
			ctx: $.contextFg,
			fill: 'yellow',
			r: 1,
			targetR: radius
		}));

	const followerMax = d3.max(nodes, n => n.followers);

	scaleStrength.domain([0, followerMax]).range([0.1, 0.33]);

	const $node = $.nodes.selectAll('.node').data(nodes, d => d.id);

	const $nodeEnter = $node
		.enter()
		.append('g')
		.at('class', d => `node node-${d.category} is-active`)
		.on('mouseenter', handleMouseEnter)
		.on('mouseout', handleMouseOut);

	$nodeEnter.each((d, i, n) => {
		if (d.chosen) {
			d3.select(n[i]).append('circle.outer');
			d3.select(n[i]).append('circle.mid');
		}
	});

	$nodeEnter.append('circle.inner').at({
		cx: 0,
		cy: 0,
		r: 0
	});

	$node.exit().remove();

	const $nodeMerge = $nodeEnter.merge($node);
	$nodeMerge
		.classed('is-curate', true)
		.select('.inner')
		.transition()
		.duration(500)
		.at('r', radius);

	runSim();
}

function runIntro() {
	Render.clear($.contextFg);

	// $edu = #e50914
	// $role = #3d66f9
	// $fashion = #62c6f9
	// $culture = #29cc7a
	// $travel = #fcd206

	const col = {
		a: '#e50914',
		b: '#3d66f9',
		c: '#62c6f9',
		d: '#fcd206'
	};

	badgeData.forEach(d => {
		d.fill = col[d.category];
		Render.dot({ d, ctx: $.contextFg });
	});
}

function enter(step) {
	currentStep = step;
	if (currentStep === 'intro') runIntro();
}

function exit(step) {
	currentStep = step === 'nav' ? 'intro' : 'nav';
}

function handoff(direction) {
	// handleNavClick.call($nav.select('label').node());
}

function resize() {
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
	$nav.selectAll('label').on('click', handleNavClick);
}

export default { init, resize, enter, exit, handoff };
