/* global d3 */
import EnterView from 'enter-view';
import tweetPos from './tweet-pos';
import $ from './dom';
import Intro from './intro';
import Globe from './globe';
import Curate from './curate';
import Explore from './explore';
import Render from './render';

import badgePos from './badge-pos';

badgePos.forEach(d => {
	d.cx = Math.floor(d.x);
	d.cy = Math.floor(d.y);
});

const DPR = window.devicePixelRatio ? Math.min(window.devicePixelRatio, 2) : 1;

function resize() {
	const headerH = $.header.node().offsetHeight;
	const height = window.innerHeight - headerH;
	$.chart.st({ height });
	const width = $.chart.node().offsetWidth;
	$.svg.st({ width, height });

	Render.resize();
	Intro.resize();
	// Globe.resize();
	Curate.resize();
	Explore.resize();
}

function onIntroStepEnter(el) {
	const step = d3.select(el).at('data-step');
	Intro.enter(step);
}

function onIntroStepExit(el) {
	const step = d3.select(el).at('data-step');
	Intro.exit(step);
}

function updateSection(index) {
	const $section = $.section.filter((d, i) => i === index);
	const id = $section.at('id');
	console.log('section', id);
	$.chart.classed('is-hidden', false);
	$.introDots.classed('is-hidden', true);
	$.exploreNav.classed('is-hidden', true);
	$.globe.classed('is-hidden', true);
	switch (id) {
	case 'intro':
		$.introDots.classed('is-hidden', false);
		Intro.handoff();
		break;
	case 'globe':
		// Globe.handoff();
		// Globe.classed('is-hidden', false);
		break;
	case 'curate':
		Curate.handoff();
		break;

	case 'explore':
		$.chart.classed('is-hidden', true);
		$.exploreNav.classed('is-hidden', false);
		Explore.handoff();
		break;

	default:
		break;
	}
}

function onGlobeStepEnter(el) {}

function onGlobeStepExit(el) {}

function onCurateStepEnter(el) {
	console.log(el);
	const step = d3.select(el).at('data-step');
	Curate.enter(step);
}

function onCurateStepExit(el) {
	const step = d3.select(el).at('data-step');
	Curate.exit(step);
}

function setup(data) {
	// sections
	Intro.init({ data, badgePos });
	// Globe.init(data);
	Curate.init({ data, badgePos });
	Explore.init(data);
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

	// globe steps
	EnterView({
		selector: '#globe .step',
		enter: onGlobeStepEnter,
		exit: onGlobeStepExit,
		offset: 0.9
	});

	EnterView({
		selector: '#curate .step',
		enter: onCurateStepEnter,
		exit: onCurateStepExit,
		offset: 0.9
	});

	resize();
}

function loadData() {
	return new Promise(resolve => {
		const a = 'abcde';
		const data = d3.range(100).map((d, i) => ({
			text: 'Testing text',
			category: a.charAt(i % a.length),
			followers: Math.floor(Math.random() * 1000),
			chosen: i < a.length,
			example: i >= a.length && i < a.length + 3
		}));

		const withPos = data.map((d, i) => ({
			...d,
			x:
				d.chosen || d.example
					? tweetPos[i].cx
					: Math.random() * window.innerWidth,
			y:
				d.chosen || d.example
					? tweetPos[i].cy
					: Math.random() * window.innerHeight
		}));
		resolve(withPos);
	});
}

function svgToJSON() {
	const out = [];
	d3.select('.test')
		.selectAll('circle')
		.each((d, i, n) => {
			const c = d3.select(n[i]);
			out.push({
				x: +c.at('cx'),
				y: +c.at('cy'),
				r: +c.at('r')
			});
		});
	window.output = JSON.stringify(out);
}

function init() {
	loadData().then(setup);
	// svgToJSON();
}

export default { init, resize };
