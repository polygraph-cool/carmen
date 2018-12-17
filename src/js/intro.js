import $ from './dom';
import Tweet from './tweet';
import tweetPos from './tweet-pos';

let tweetData = [];
const origW = 1280;
const origH = 1024;
let radius = 2.5;
const REM = 16;
const tweetWidth = 15 * REM;
const catNum = 5;
let width = null;
let height = null;

let triggerTimeouts = [];

const $intro = d3.select('#intro');
const $top = $intro.select('.top');
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
		const x = (tweetPos[i + catNum].cx * width) / origW;
		const y = (tweetPos[i + catNum].cy * height) / origH;
		return setTimeout(
			() =>
				Tweet.create({ data: exampleTweet, x, y, fade: true, offset: true }),
			i * delay
		);
	});
}

function enter(step) {
	$top.classed('is-active', step !== 'title');

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
	$top.classed('is-active', step !== 'examples');

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
	width = $top.node().offsetWidth;
	height = $top.node().offsetHeight;

	const stepHeight = window.innerHeight;

	const stepSize = $step.size();
	$step
		.st('height', (d, i) => stepHeight * (i === stepSize - 1 ? 2 : 1))
		.classed('is-visible', true);

	radius = (radius * width) / origW;

	$.svg.st('width', width).st('height', height);

	$.nodes
		.selectAll('.node, .node__example')
		.translate(d => [(d.x * width) / origW, (d.y * height) / origH]);

	$.nodes
		.selectAll('.inner, .node__example')
		.at('r', radius)
		.at('cx', 0)
		.at('cy', 0);

	$.nodes
		.selectAll('.mid')
		.at('r', radius * 4)
		.at('cx', 0)
		.at('cy', 0);

	$.nodes
		.selectAll('.outer')
		.at('r', radius * 10)
		.at('cx', 0)
		.at('cy', 0);

	$.chartTweets.st('width', width).st('height', height);
}

function init(data) {
	tweetData = data;
	setupTweets();
	resize();
}

export default { init, resize, enter, exit, handoff };
