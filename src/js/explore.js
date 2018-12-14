import $ from './dom';

const $explore = d3.select('#explore');
const $dots = $explore.select('.explore__dots');
function handoff(direction) {}

function resize() {}

function init() {
	const data = d3.range(135347);
	$dots
		.selectAll('.dot')
		.data(data)
		.enter()
		.append('div.dot');
}

export default { init, resize, handoff };
