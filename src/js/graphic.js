/* global d3 */
import EnterView from 'enter-view';
import Shuffle from 'lodash.shuffle';
import tweetPos from './tweet-pos';
import $ from './dom';
import Intro from './intro';
import Globe from './globe';
import Curate from './curate';
import Explore from './explore';
import Render from './render';

import badgePos from './badge-pos';
import categories from './categories';

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
	$.exploreNav.classed('is-hidden', true);
	$.globe.classed('is-hidden', true);
	Intro.clear();
	Curate.clear();
	switch (id) {
	case 'intro':
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
	const step = d3.select(el).at('data-step');
	Curate.enter(step);
}

function onCurateStepExit(el) {
	const step = d3.select(el).at('data-step');
	Curate.exit(step);
}

function setup(data) {
	// sections
	Intro.init(data);
	// Globe.init(data);
	Curate.init(data);
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
		offset: 0.67
	});

	resize();
}

function assignCategoryRandom(counts) {
	const pool = [].concat(...counts.map((d, i) => d3.range(d).map(() => i)));
	const shuffled = Shuffle(pool);
	return badgePos.map((d, i) => ({
		...d,
		category: categories[shuffled[i]] ? categories[shuffled[i]].cat : 'd'
	}));
}

function assignCategoryLayer(counts) {
	let tally = 0;
	const thresh = counts.map(d => {
		const t = tally;
		tally += d;
		return t;
	});

	thresh.reverse();
	// console.log(thresh, badgePos.length);
	return badgePos.map((d, i) => {
		const index = thresh.findIndex(t => t <= i);
		return {
			...d,
			category: categories[categories.length - 1 - index].cat
		};
	});
}

function loadData() {
	return new Promise(resolve => {
		const sum = d3.sum(categories, d => d.count);

		const counts = categories.map(d => {
			const percent = d.count / sum;
			return Math.floor(percent * badgePos.length);
		});

		// const withCat = assignCategoryLayer(counts);
		const withCat = assignCategoryRandom(counts);

		resolve(withCat);
	});
}

function svgToJSON() {
	const out = [];
	d3.select('.test')
		.selectAll('circle')
		.each((d, i, n) => {
			const c = d3.select(n[i]);
			out.push({
				cx: +c.at('cx'),
				cy: +c.at('cy'),
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
