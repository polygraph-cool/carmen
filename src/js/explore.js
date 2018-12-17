import $ from './dom';

const origW = 1280;
const origH = 1024;
let radius = 2.5;

const $explore = d3.select('#explore');
const $dots = $explore.select('.explore__dots');

function handoff(direction) {}

function resize() {
	const width = $explore.node().offsetWidth;
	const count = 130000;
	radius = Math.ceil((radius * width) / origW);
	const col = Math.floor(count / width);
	const row = Math.floor(count / col);
	$dots.st({
		height: row * radius,
		backgroundSize: `${radius * 4}px ${radius * 4}px`
	});
}

function init() {
	resize();
}

export default { init, resize, handoff };
