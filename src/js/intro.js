import $ from './dom';

const origW = 1280;
const origH = 1024;
const radius = 2.5;

const $intro = d3.select('#intro');
const $top = $intro.select('.top');

const tweetPos = [
	{
		cat: 'a',
		cx: 833.5,
		cy: 399.5
	},
	{
		cat: 'b',
		cx: 609.5,
		cy: 316.5
	},
	{
		cat: 'c',
		cx: 385.5,
		cy: 407.5
	},
	{
		cat: 'd',
		cx: 854.5,
		cy: 568.5
	},
	{
		cat: 'e',
		cx: 462.5,
		cy: 582.5
	},
	{
		cat: 'f',
		cx: 651.5,
		cy: 610.5
	},
	{
		cat: 'g',
		cx: 826.5,
		cy: 757.5
	}
];

function setupTweets() {
	$.tweets
		.selectAll('.tweet')
		.data(tweetPos)
		.enter()
		.append('g')
		.at('class', d => `tweet tweet-${d.cat}`)
		.append('circle');
}

function enter(step) {
	$top.classed('is-active', step > 0);
	$.tweets.selectAll('.tweet').classed('is-active', step === 2);
}

function exit(step) {
	// console.log({ step });
	$top.classed('is-active', step === 1);
	$.tweets.selectAll('.tweet').classed('is-active', step !== 2);
}

function resize() {
	const width = $top.node().offsetWidth;
	const height = $top.node().offsetHeight;

	$.svg.st('width', width).st('height', height);

	$.tweets
		.selectAll('.tweet circle')
		.at('r', radius)
		.at('cx', 0)
		.at('cy', 0)
		.translate(d => [(d.cx * width) / origW, (d.cy * height) / origH]);
}

function init() {
	setupTweets();
	resize();
}

export default { init, resize, enter, exit };
