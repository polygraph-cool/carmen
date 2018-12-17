/* global d3 */
import EnterView from 'enter-view';
import tweetPos from './tweet-pos';
import $ from './dom';
import intro from './intro';
import map from './map';
import curate from './curate';
import explore from './explore';

function resize() {
	const headerH = $.header.node().offsetHeight;
	const height = window.innerHeight - headerH;
	$.chart.st({ height });
	intro.resize();
	map.resize();
	curate.resize();
	explore.resize();
}

function onIntroStepEnter(el) {
	const step = d3.select(el).at('data-step');
	intro.enter(step);
}

function onIntroStepExit(el) {
	const step = d3.select(el).at('data-step');
	intro.exit(step);
}

function updateSection(index) {
	const $section = $.section.filter((d, i) => i === index);
	const id = $section.at('id');
	console.log('section', id);
	$.chart.classed('is-hidden', false);
	$.introDots.classed('is-hidden', true);
	$.exploreNav.classed('is-hidden', true);

	switch (id) {
	case 'intro':
		$.introDots.classed('is-hidden', false);
		intro.handoff();
		break;
	case 'map':
		map.handoff();
		break;

	case 'curate':
		curate.handoff();
		break;

	case 'explore':
		$.chart.classed('is-hidden', true);
		$.exploreNav.classed('is-hidden', false);
		explore.handoff();
		break;

	default:
		break;
	}
}

function onMapStepEnter(el) {}

function onMapStepExit(el) {}

function setup(data) {
	// sections
	intro.init(data);
	map.init(data);
	curate.init(data);
	explore.init(data);

	// section steps
	EnterView({
		selector: 'section',
		enter: el => {
			const index = +d3.select(el).attr('data-index');
			updateSection(index);
		},
		exit: el => {
			let index = +d3.select(el).attr('data-index');
			index = Math.max(0, index - 1);
			updateSection(index);
		},
		offset: 0.2
	});

	// intro steps
	EnterView({
		selector: '#intro .step',
		enter: onIntroStepEnter,
		exit: onIntroStepExit,
		offset: 0.9
	});

	// map steps
	EnterView({
		selector: '#map .step',
		enter: onMapStepEnter,
		exit: onMapStepExit,
		offset: 0.9
	});

	resize();
}

function loadData() {
	return new Promise(resolve => {
		const a = 'abcde';
		const data = d3.range(2400).map((d, i) => ({
			text: 'Testing text',
			category: a.charAt(i % a.length),
			followers: Math.floor(Math.random() * 1000),
			chosen: i < a.length,
			example: i >= a.length && i < a.length + 3
		}));

		const withPos = data.map((d, i) => ({
			...d,
			x: ( d.chosen  || d.example ) ? tweetPos[i].cx : Math.random() * window.innerWidth,
			y: ( d.chosen || d.example ) ? tweetPos[i].cy : Math.random() * window.innerHeight
		}));
		resolve(withPos);
	});
}

function init() {
	loadData().then(setup);
}

export default { init, resize };
