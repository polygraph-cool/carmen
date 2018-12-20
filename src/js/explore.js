import $ from './dom';
import Tweet from './tweet';

const ORIG_W = 1280;
const ORIG_H = 1024;
const DEFAULT_R = 2.5;

const $explore = d3.select('#explore');
const $dots = $explore.select('.figure__dots');
const $tweets = $explore.select('.figure__tweets');

const exampleTweet = {
	name: 'The Pudding',
	handle: '@puddingviz',
	text: 'We ❤️ Carmen Sandiego',
	time: '11/14/18 12:39 PM'
};

function handoff(direction) {}

function showTweet() {}

function resize() {
	const width = $explore.node().offsetWidth;
	const count = 130000;
	const radius = Math.ceil((DEFAULT_R * width) / ORIG_W);
	const col = Math.floor(count / width);
	const row = Math.floor(count / col);
	$dots.st({
		height: row * radius,
		backgroundSize: `${radius * 2}px ${radius * 2}px`
	});
}

function init() {
	$explore.select('button').on('click', showTweet);
}

export default { init, resize, handoff };
