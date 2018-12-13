/* global d3 */
import EnterView from 'enter-view';
import $ from './dom';
import intro from './intro';
import map from './map';
import explore from './explore';

let tweetData = [];

function resize() {
	const height = window.innerHeight;
	$.chart.st({ height });
	intro.resize();
	map.resize();
	explore.resize();
}

function onStepEnter(el) {
	const step = +d3.select(el).at('data-step');
	intro.enter(step);
}

function onStepExit(el) {
	const step = +d3.select(el).at('data-step');
	intro.exit(step);
}

function onSectionEnter(el) {
	const id = d3.select(el).at('id')
	if (id === "map") map.handoff()
	// make map visible
}

function onSectionExit(el) {}

function onMapEnter(el){}

function onMapExit(el){}

function setup() {
	// sections
	intro.init();
	map.init();
	explore.init();

	EnterView({
		selector: '#intro .step',
		enter: onStepEnter,
		exit: onStepExit,
		offset: 0.9
	});
	EnterView({
		selector: '#map .step',
		enter: onMapEnter,
		exit: onMapExit,
		offset: 0.9
	});
	EnterView({
		selector: 'section',
		enter: onSectionEnter,
		exit: onSectionExit
	});
	resize();
}

function loadData() {
	return new Promise(resolve => {
		const a = 'abcdef';
		tweetData = d3.range(500).map(d => ({
			text: 'Testing text',
			category: a.charAt(Math.floor(Math.random() * a.length)),
			likes: Math.floor(Math.random() * 1000),
			retweets: Math.floor(Math.random() * 100)
		}));
		resolve();
	});
}

function init() {
	loadData().then(setup);
}

export default { init, resize };
