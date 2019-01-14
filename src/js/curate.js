import $ from './dom';
import Tweet from './tweet';
import Render from './render';
import Categories from './categories';
import Colors from './colors';
import Intro from './intro';

const BADGE_R = 3;
const DURATION = 1000;

const exampleTweet = {
	name: 'The Pudding',
	handle: '@puddingviz',
	text: 'We ❤️ Carmen Sandiego',
	time: '11/14/18 12:39 PM'
};

let simulation = null;
let currentCat = null;
let active = false;
const $curate = d3.select('#curate');
const $nav = $curate.select('nav');
const $step = $curate.selectAll('.step');
const $fade = $step.selectAll('.step__fade');

const categoryData = {};

let badgeData = [];

let nodes = [];

let width = 0;
let height = 0;
let centerX = 0;
let centerY = 0;
let radius = 0;
const currentStep = null;
const timer = null;
let triggeredVor = false;
let mobile = false;
const BP = 800;

const ease = d3.easeCubicOut;

const voronoi = d3.voronoi();

function handleVorEnter({ data }) {
	Intro.disable();
	const { x, y, index, category } = data;
	const cd = categoryData[category];
	cd.current += 1;
	if (cd.current >= cd.total) cd.current = 0;

	Render.clear($.contextFg);
	nodes.forEach(d => {
		// d.stroke = '#fff';
		// else d.stroke = '#000';
		Render.dot({ d, ctx: $.contextFg, concentric: d.index === index });
	});

	Tweet.clear({ section: 'curate' });

	Tweet.create({
		data: cd.tweets[cd.current] || exampleTweet,
		x,
		y,
		offset: true,
		section: 'curate'
		// category: filteredTweets[index].category
	});
}

function handleNavClick() {
	$nav.selectAll('button').classed('is-active', false);
	const $button = d3.select(this);
	$button.classed('is-active', true);
	currentCat = $button.at('data-id');
	currentCat = currentCat === 'all' ? null : currentCat;
	clear();
	placeDots();
}

function createVor() {
	// VORONOI
	voronoi
		.x(d => d.x)
		.y(d => d.y)
		.extent([[0, 0], [width, height]]);

	const $vorPath = $.vor.selectAll('path');
	d3.select('.g-voronoi')
		.selectAll('path')
		.remove();

	const polyNodes = nodes.filter(d => {
		if (currentCat) return currentCat === d.category;
		return true;
	});

	const polygons = voronoi.polygons(polyNodes);

	const vorPaths = d3
		.select('.g-voronoi')
		.selectAll('path')
		.data(polygons)
		.enter()
		.append('path');
	// $vorPath = $vorPath
	// 	.data(polygons)
	// 	.enter()
	// 	.append('path')
	// 	.merge($vorPath);

	vorPaths.at('d', d => (d ? `M${d.join('L')}Z` : null));

	// $vorPath.at('d', d => (d ? `M${d.join('L')}Z` : null));
	vorPaths.on('mouseenter', handleVorEnter);
	// $vorPath.on('mouseenter', handleVorEnter);
	// $vorPath.on('mouseout', handleVorE);
	// else $vorPath.on('mouseenter', handleVorEnter);
}

function handleTick() {
	const a = simulation.alpha();

	// console.log(a, triggeredVor);

	if (!triggeredVor && a < 0.5) {
		triggeredVor = true;
		handleEnd();
	}
	if (currentStep == 'nav') {
		Render.clear($.contextFg);
		nodes.forEach(d => {
			Render.dot({ d, ctx: $.contextFg });
		});
	}
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

	// disable mouse interaction while it sim is running
	$.vor.selectAll('path').on('mouseenter', () => {});

	// reset trigger for rendering voronoi
	triggeredVor = false;

	simulation = d3
		.forceSimulation(nodes)
		.on('tick', handleTick)
		.alphaDecay(alphaDecay)
		.alphaMin(alphaMin)
		.alphaTarget(alphaTarget)
		.velocityDecay(velocityDecay)
		.force('x', d3.forceX(centerX))
		.force('y', d3.forceY(centerY))
		.force('charge', d3.forceManyBody().strength(manyBodyStrength));
	// .on('end', handleEnd);
}

function placeDots() {
	// TODO
	// $.chart.select(".chart__curate_purp").classed('is-hidden',false);

	// hide hover text and buttons
	// $fade.classed('is-hidden', true);
	// disable mouse interaction while it sim is running
	// $.vor.selectAll('path').on('mouseenter', () => {});

	// reset trigger for rendering voronoi
	// triggeredVor = false;

	Render.clear($.contextBg);
	Render.clear($.contextFg);

	nodes.forEach(d => {
		if (!currentCat) d.fill = Colors[d.category];
		else
			d.fill = d.category === currentCat ? Colors[d.category] : 'rgba(0,0,0,0)';
		d.stroke = null;
		Render.dot({ d, ctx: $.contextFg });
	});

	createVor();
}

function enterSection(reset) {
	if (reset) currentCat = null;
	placeDots();
}

function enter(step) {
	Tweet.clear({ section: 'curate' });
	// currentStep = step;

	// $.chartCurate.classed('is-hidden', true);

	// $step
	// 	.filter(function(d, i) {
	// 		return d3.select(this).attr('data-step') == step;
	// 	})
	// 	.classed('is-visible', true);

	// if (currentStep === 'intro') placeDots();
	// else if (currentStep === 'nav') {
	// 	runNav('edutainment');
	// 	$.chart.select('.chart__curate_purp').classed('is-hidden', true);
	// 	$nav.selectAll('button').classed('is-active', (d, i) => i === 0);
	// }
}

function exit(step) {
	Tweet.clear({ section: 'curate' });
	// if (step == 'nav') {
	// 	placeDots();
	// 	currentStep = 'intro';
	// }
	// currentStep = step === 'nav' ? 'intro' : 'nav';
	// console.log(step,currentStep);
}

function clear() {
	Tweet.clear({ section: 'curate' });
	active = false;
}

function resize() {
	width = $.chart.node().offsetWidth;
	height = $.chart.node().offsetHeight;
	mobile = width < BP;
	centerX = width / 2;
	centerY = mobile ? (height * 2) / 3 : height / 2;

	const stepHeight = window.innerHeight;
	$step.st('height', stepHeight);

	const { scale, offsetW, offsetH } = Render.getScale();

	badgeData.forEach((d, i) => {
		d.x = scale * d.cx + offsetW;
		d.y = scale * d.cy + offsetH;
		d.r = scale * BADGE_R;
		d.index = i;
	});

	radius = BADGE_R * 3;

	$.chart
		.select('.chart__curate')
		.selectAll('.curate__label')
		.st('left', d => scale * d.cx + offsetW)
		.st('top', d => scale * d.cy + offsetH);

	placeDots();
}

function setupLabels() {
	const $label = $.chart
		.select('.chart__curate')
		.selectAll('div.curate__label')
		.data(Categories)
		.enter()
		.append('div')
		.at('class', d => `curate__label ${d.cat}`);
	$label.append('p').text(d => d.label);
}

function init(data) {
	badgeData = data.fullBadge.map(d => ({
		...d
	}));
	nodes = badgeData;
	// tweetData = data.curate;
	Categories.forEach(c => {
		categoryData[c.cat] = {
			tweets: data.curate.filter(d => d.category === c.cat),
			current: 0,
			total: data.curate.filter(d => d.category === c.cat).length
		};
	});

	$nav.selectAll('button').on('click', handleNavClick);
	setupLabels();
}

export default { init, resize, enter, enterSection, exit, clear };
