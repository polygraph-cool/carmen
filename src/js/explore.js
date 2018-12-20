import $ from './dom';
import Tweet from './tweet';

const ORIG_W = 1280;
const ORIG_H = 1024;
const DEFAULT_R = 2.5;

const $explore = d3.select('#explore');
const $dots = $explore.select('.figure__dots');
const $tweets = $explore.select('.figure__tweets');
const $figure = $explore.select('.explore__figure')

const exampleTweet = {
	name: 'The Pudding',
	handle: '@puddingviz',
	text: 'We ❤️ Carmen Sandiego',
	time: '11/14/18 12:39 PM'
};

function handoff(direction) {}

function showTweet() {}

function resize() {
	const headerH = $.header.node().offsetHeight;
	const height = window.innerHeight - headerH;
	$figure.st('height', height)

	const count = 130000;
	const radius = Math.ceil((DEFAULT_R * height) / ORIG_H);
	const diameter = radius * 2
	const row = Math.floor(count / height);
	const col = Math.floor(count / row);
	console.log({row, col, radius})

	$dots.st({
		height: height,
		width: col * radius,
		backgroundSize: `${radius * 2}px ${radius * 2}px`
	});
}

function init() {
	$explore.select('button').on('click', showTweet);
	resize()
}

export default { init, resize, handoff };
