/* global d3 */
import EnterView from 'enter-view';
import tweetPos from './tweet-pos';
import $ from './dom';
import intro from './intro';
import map from './map';
import curate from './curate';
import explore from './explore';

function resize() {
	const height = window.innerHeight;
	$.chart.st({ height });
	intro.resize();
	map.resize();
	curate.resize();
	explore.resize();
}

function onIntroStepEnter(el) {
	const step = +d3.select(el).at('data-step');
	intro.enter(step);
}

function onIntroStepExit(el) {
	const step = +d3.select(el).at('data-step');
	intro.exit(step);
}

function onSectionEnter(el) {
	const id = d3.select(el).at('id');
	console.log({ id });
	switch (id) {
	case 'intro':
		intro.handoff();
		break;

	case 'map':
		map.handoff();
		break;

	case 'curate':
		curate.handoff();
		break;

	case 'explore':
		explore.handoff();
		break;

	default:
		break;
	}
	// make map visible
}

function onSectionExit(el) {}

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
		enter: onSectionEnter,
		exit: onSectionExit,
		offset: 0.9
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
		const a = 'abcdef';
		const data = d3.range(5000).map((d, i) => ({
			text: 'Testing text',
			category: a.charAt(i % a.length),
			followers: Math.floor(Math.random() * 1000),
			chosen: i < a.length
		}));

		const withPos = data.map((d, i) => ({
			...d,
			x: d.chosen ? tweetPos[i].cx : Math.random() * 1000,
			y: d.chosen ? tweetPos[i].cy : Math.random() * 1000
		}));
		resolve(withPos);
	});
}

function init() {
	loadData().then(setup);
}

export default { init, resize };
