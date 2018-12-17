import $ from './dom';
import Tweet from './tweet';

let tweetData = [];
const origW = 1280;
const origH = 1024;
let radius = 2.5;

const $intro = d3.select('#intro');
const $top = $intro.select('.top');
const $introHed = $intro.select('.intro__hed');
const $title = $intro.selectAll('.intro__hed-text');
const $step = $intro.selectAll('.step');

const exampleTweet = {
	name: 'The Pudding',
	handle: '@puddingviz',
	text: 'We ❤️ Carmen Sandiego',
	time: '11/14/18 12:39 PM'
};

function setupTweets() {
	const data = tweetData.filter(d => d.chosen);
	const $tweet = $.tweets.selectAll('.tweet').data(data, d => d.category);

	const $tweetEnter = $tweet
		.enter()
		.append('g')
		.at('class', d => `tweet tweet-${d.category}`);

	$tweetEnter.each((d, i, n) => {
		if (d.chosen) {
			d3.select(n[i]).append('circle.outer');
			d3.select(n[i]).append('circle.mid');
		}
	});

	$tweetEnter.append('circle.inner');
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
	d3.range(6).forEach(i => {
		const x = Math.random() * $.chartTweets.node().offsetWidth;
		const y = Math.random() * $.chartTweets.node().offsetHeight;
		Tweet.create({ data: exampleTweet, x, y });
	});
}

function enter(step) {
	$top.classed('is-active', step !== 'title');

	if (step !== 'title') hideTitle();
	if (step !== 'examples') Tweet.clear();
	if (step === 'examples') triggerExamples();

	$.tweets.selectAll('.tweet').classed('is-active', step === 'categories');
}

function exit(step) {
	$top.classed('is-active', step !== 'examples');

	if (step === 'examples') showTitle();
	if (step === 'examples') Tweet.clear();
	if (step === 'categories') triggerExamples();

	$.tweets.selectAll('.tweet').classed('is-active', step === 'categories');
}

function handoff(direction) {}

function resize() {
	const width = $top.node().offsetWidth;
	const height = $top.node().offsetHeight;

	const stepHeight = window.innerHeight;

	const stepSize = $step.size();
	$step
		.st('height', (d, i) => stepHeight * (i === stepSize - 1 ? 2 : 1))
		.classed('is-visible', true);

	radius = (radius * width) / origW;

	$.svg.st('width', width).st('height', height);

	$.tweets
		.selectAll('.tweet')
		.translate(d => [(d.x * width) / origW, (d.y * height) / origH]);

	$.tweets
		.selectAll('.inner')
		.at('r', radius)
		.at('cx', 0)
		.at('cy', 0);

	$.tweets
		.selectAll('.mid')
		.at('r', radius * 4)
		.at('cx', 0)
		.at('cy', 0);

	$.tweets
		.selectAll('.outer')
		.at('r', radius * 10)
		.at('cx', 0)
		.at('cy', 0);
}

function init(data) {
	tweetData = data;
	setupTweets();
	resize();
}

export default { init, resize, enter, exit, handoff };
