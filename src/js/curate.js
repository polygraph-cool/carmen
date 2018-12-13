import $ from './dom';

const $curate = d3.select('#curate');
const $p = $curate.select('p');

let tweetData = [];

function handoff(direction) {}

function resize() {
	$p.st('height', window.innerHeight);
}

function init(data) {
	tweetData = data;
}

export default { init, resize, handoff };
