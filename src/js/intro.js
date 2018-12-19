import $ from './dom';
import Tweet from './tweet';
import tweetPos from './tweet-pos';
import badgePos from './badge-pos';

badgePos.forEach(d => {
	d.x = Math.floor(d.x)
	d.y = Math.floor(d.y)
})

let tweetData = [];
const BADGE_W = 1280;
const BADGE_H = 1024;
const BADGE_R = 2.5;
const BADGE_RATIO = BADGE_W / BADGE_H;

const REM = 16;
const catNum = 5;
let width = null;
let height = null;

let scale = 1;

let triggerTimeouts = [];

const $intro = d3.select('#intro');
const $introHed = $intro.select('.intro__hed');
const $title = $intro.selectAll('.intro__hed-text');
const $stepGroup = $intro.selectAll('.intro__steps');
const $step = $intro.selectAll('.step');

const exampleTweet = {
	name: 'The Pudding',
	handle: '@puddingviz',
	text: 'We ❤️ Carmen Sandiego',
	time: '11/14/18 12:39 PM'
};

function setupTweets() {
	const data = tweetData.filter(d => d.chosen);
	const $node = $.nodes.selectAll('.node').data(data, d => d.category);

	console.log({ data });

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

	const exampleData = tweetData.filter(d => d.example);
	const $nodeEx = $.nodes.selectAll('.node__example').data(exampleData);

	const $nodeExEnter = $nodeEx
		.enter()
		.append('circle.node__example')
		.st('opacity', 0);
}

function hideTitle() {
	const titleWidth = $intro.select('.intro__hed').node().offsetWidth;
	$introHed.classed('is-hidden', true);
	$title
		.transition()
		.duration(500)
		.delay((d, i) => i * 50)
		.translate([-titleWidth, 0]);

	$intro
		.select('.carmen-crouch')
		.transition()
		.duration(500)
		.translate([-titleWidth, 20]);
}

function showTitle() {
	$introHed.classed('is-hidden', false);
	$intro
		.select('.carmen-crouch')
		.transition()
		.duration(500)
		.translate([0, 20]);

	$title
		.transition()
		.duration(500)
		.delay((d, i) => i * 50)
		.translate([0, 0]);
}

function triggerExamples() {
	const delay = 4000;
	$.nodes
		.selectAll('.node__example')
		.transition()
		.duration(200)
		.delay((d, i) => i * delay)
		.st('opacity', 1);

	triggerTimeouts = d3.range(3).map(i => {
		const x = (tweetPos[i + catNum].cx * width) / BADGE_W;
		const y = (tweetPos[i + catNum].cy * height) / BADGE_H;
		return setTimeout(
			() =>
				Tweet.create({ data: exampleTweet, x, y, fade: true, offset: true }),
			i * delay
		);
	});
}

function renderDot({ d, ctx }) {
	ctx.beginPath();
	ctx.moveTo(d.cx + d.r, d.cy);
	ctx.arc(d.cx, d.cy, d.r, 0, 2 * Math.PI);
	ctx.fillStyle = d.fill || `rgba(255,255,255,${Math.random()})`;
	ctx.fill();
}

function test() {
	$.context.clearRect(0, 0, width, height);
	// $circle.at('')
	badgePos.forEach(d => {
		renderDot({ d, ctx: $.context });
	});
	requestAnimationFrame(test);
}

function enter(step) {
	test();

	if (step !== 'title') hideTitle();
	if (step !== 'examples') {
		Tweet.clear();
		triggerTimeouts.forEach(t => clearTimeout(t));
	}
	if (step === 'examples') triggerExamples();

	$.nodes.selectAll('.node').classed('is-active', step === 'categories');
	$.nodes.selectAll('.node__example').classed('is-active', step === 'examples');
}

function exit(step) {
	if (step === 'examples') showTitle();
	if (step === 'examples') Tweet.clear();
	if (step === 'categories') triggerExamples();

	$.nodes.selectAll('.node').classed('is-active', step === 'categories');
	$.nodes
		.selectAll('.node__example')
		.classed('is-active', step === 'categories');
}

function handoff(direction) {}

function resize() {
	width = $.chart.node().offsetWidth;
	height = $.chart.node().offsetHeight;
	const screenRatio = width / height;

	let imageW = 0;
	let imageH = 0;
	let offsetW = 0;
	let offsetH = 0;
	if (screenRatio > BADGE_RATIO) {
		scale = height / BADGE_H;
		imageW = scale * BADGE_W;
		offsetW = Math.floor((width - imageW) / 2)
		offsetH = 0;
	} else {
		scale = width / BADGE_W;
		imageH = scale * BADGE_H;
		offsetW = 0;
		offsetH = Math.floor((height - imageH) / 2);
	}

	badgePos.forEach(b => {
		b.cx = scale * b.x + offsetW;
		b.cy = scale * b.y + offsetH;
		b.r = scale * BADGE_R;
	});

	const stepHeight = window.innerHeight;

	const stepSize = $step.size();
	$step
		.st('height', (d, i) => stepHeight * (i === stepSize - 1 ? 2 : 1))
		.classed('is-visible', true);

	// const radius = Math.floor((BADGE_R * width) / BADGE_W);

	// const sz = Math.floor((radius * 4 * 7) / 5)

	const radius = scale * BADGE_R;

	$.chartTweets.st('width', width).st('height', height);
	const unit = (radius + scale) * 2;

	const area = width * height;
	const unitSQ = unit * unit;

	let numDots = Math.ceil(area / unitSQ);

	const col = Math.ceil(width / unit) + 1;

	numDots += col * 2;

	const bgData = d3.range(numDots).map(i => ({
		d: {
			cx: (i % col) * unit,
			cy: Math.floor(i / col) * unit,
			r: scale * BADGE_R,
			fill: '#333'
		},
		ctx: $.contextBg
	}));

	$.contextBg.clearRect(0,0,width, height)
	bgData.forEach(renderDot);
}

function init(data) {
	tweetData = data;
	setupTweets();
	resize();
}

export default { init, resize, enter, exit, handoff };
