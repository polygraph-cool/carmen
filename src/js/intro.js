import $ from './dom';
import tweetPos from './category-tweets'

const origW = 1280;
const origH = 1024;
let radius = 2.5;

const $intro = d3.select('#intro');
const $top = $intro.select('.top');
const $title = $intro.selectAll('.intro__hed-text')
const $step = $intro.selectAll('.step')

function setupTweets() {
	const $gTweets = $.tweets
		.selectAll('.tweet')
		.data(tweetPos)
		.enter()
		.append('g')
		.at('class', d => `tweet tweet-${d.cat}`)

	$gTweets
		.append('circle.outer');

	$gTweets
		.append('circle.mid');

	$gTweets
		.append('circle.inner');
}

function hideTitle(){
	const titleWidth = $intro.select('.intro__hed').node().offsetWidth

	$title
		.transition()
		.duration(500)
		.delay((d, i) => i * 50)
			.translate(d => [-titleWidth, 0])

	$intro.select('.carmen-crouch')
		.transition()
		.duration(500)
			.translate(d => [-titleWidth, 20])
}

function showTitle(){
	$intro.select('.carmen-crouch')
		.transition()
		.duration(500)
			.translate(d => [0, 20])

	$title
		.transition()
		.duration(500)
		.delay((d, i) => i * 50)
			.translate(d => [0, 0])
}


function enter(step) {
	$top.classed('is-active', step > 0);
	$.tweets.selectAll('.tweet').classed('is-active', step === 2);
	if (step === 1) hideTitle()
}

function exit(step) {
	$top.classed('is-active', step !== 1);
	$.tweets.selectAll('.tweet').classed('is-active', step === 2);
	if (step === 1) showTitle()
}

function resize() {
	const width = $top.node().offsetWidth;
	const height = $top.node().offsetHeight;

	const stepHeight = Math.floor(window.innerHeight)

	$step
		.style('height', `${stepHeight}px`)


	radius = radius * width / origW

	$.svg.st('width', width).st('height', height);

	$.tweets
		.selectAll('.tweet')
		.translate(d => [(d.cx * width) / origW, (d.cy * height) / origH]);

	$.tweets
		.selectAll('.inner')
		.at('r', radius)
		.at('cx', 0)
		.at('cy', 0)

	$.tweets
		.selectAll('.mid')
		.at('r', radius * 4)
		.at('cx', 0)
		.at('cy', 0)

	$.tweets
		.selectAll('.outer')
		.at('r', radius * 10)
		.at('cx', 0)
		.at('cy', 0)
}

function init() {
	setupTweets();
	resize();
}

export default { init, resize, enter, exit };
