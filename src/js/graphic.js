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

function onSectionEnter(el) {
	console.log('enter', d3.select(el).at('id'));
}

function onSectionExit(el) {
	console.log('exit', d3.select(el).at('id'));
}

function setup() {
	// sections
	intro.init();
	map.init();
	explore.init();
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
