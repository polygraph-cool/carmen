/* global d3 */
import EnterView from 'enter-view';
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

function onStepEnter(el) {
	const step = +d3.select(el).at('data-step');
	intro.enter(step);
}

function onStepExit(el) {
	const step = +d3.select(el).at('data-step');
	intro.exit(step);
}

function onSectionEnter(el) {
	const id = d3.select(el).at('id');
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

function onMapEnter(el) {}

function onMapExit(el) {}

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
		exit: onSectionExit
	});

	// intro steps
	EnterView({
		selector: '#intro .step',
		enter: onStepEnter,
		exit: onStepExit,
		offset: 0.9
	});

	// map steps
	EnterView({
		selector: '#map .step',
		enter: onMapEnter,
		exit: onMapExit,
		offset: 0.9
	});

	resize();
}

function loadData() {
	return new Promise(resolve => {
		const a = 'abcdef';
		const data = d3.range(500).map(d => ({
			text: 'Testing text',
			category: a.charAt(Math.floor(Math.random() * a.length)),
			followers: Math.floor(Math.random() * 1000)
		}));
		resolve(data);
	});
}

function init() {
	loadData().then(setup);
}

export default { init, resize };
