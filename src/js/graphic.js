/* global d3 */
import EnterView from 'enter-view';
import Shuffle from 'lodash.shuffle';
import $ from './dom';
import Intro from './intro';
import Globe from './globe';
import Curate from './curate';
import Explore from './explore';
import Render from './render';

import loadData from './load-data';
import badgePos from './badge-pos';
import culturePos from './culture-pos';
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
	Globe.resize();
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

	// console.log('section', id);
	$.chart.classed('is-behind', false);
	$.chart.classed('is-hidden', false);
	$.exploreNav.classed('is-hidden', true);
	$.globe.classed('is-hidden', true);
	$.canvasBg.classed('is-hidden', true);
	$.canvasFg.classed('is-hidden', true);
	$.canvasGlobe.classed('is-hidden', true);
	$.overlay.classed('is-hidden', true);
	$.chartCurate.classed('is-hidden', true);
	$.vor.classed('is-hidden', true);
	$.chartTweets.classed('globe-tweets', false);

	Intro.clear();
	Curate.clear();
	Explore.clear();
	Globe.clear();

	switch (id) {
	case 'intro':
		$.canvasBg.classed('is-hidden', false);
		$.canvasFg.classed('is-hidden', false);
		$.vor.classed('is-hidden', false);
		// $.overlay.classed('is-hidden', false);
		Intro.enterSection();
		Curate.enterSection(true);
		break;
	case 'globe':
		$.canvasGlobe.classed('is-hidden', false);
		$.globe.classed('is-hidden', false);
		$.chartTweets.classed('globe-tweets', true);
		$.chart.classed('is-behind', true);
		Globe.enterSection();
		break;
	case 'curate':
		$.canvasFg.classed('is-hidden', false);
		$.vor.classed('is-hidden', false);
		Curate.enterSection();
		break;

	case 'explore':
		$.canvasEx.classed('is-hidden', false);
		$.chart.classed('is-hidden', true);
		$.exploreNav.classed('is-hidden', false);
		Explore.enterSection();
		break;

	case 'outro':
		$.canvasEx.classed('is-hidden', false);
		$.chart.classed('is-hidden', true);
		$.exploreNav.classed('is-hidden', true);
		break;

	default:
		break;
	}
}

function onGlobeStepEnter(el) {
	const index = +d3.select(el).at('data-index');
	if(index < 2){
		Globe.step(index);
	}
}

function onGlobeStepExit(el) {
	const index = +d3.select(el).at('data-index');
	Globe.step(Math.max(0, index - 1));
}

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
	Curate.init(data);
	Globe.init(data);
	Explore.init(data);
	resize();
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
			// console.log({ el });
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
		// exit: onGlobeStepExit,
		offset: 0.67
	});
	EnterView({
		selector: '#curate .step',
		enter: onCurateStepEnter,
		exit: onCurateStepExit,
		offset: 0.67
	});
}

function assignCategoryRandom(counts) {
	// console.log(badgePos.length);
	const pool = [].concat(...counts.map((d, i) => d3.range(d).map(() => i)));
	const shuffled = Shuffle(pool);
	return badgePos.map((d, i) => ({
		...d,
		category: categories[shuffled[i]] ? categories[shuffled[i]].cat : 'fashion'
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

	return badgePos.map((d, i) => {
		const index = thresh.findIndex(t => t <= i);
		return {
			...d,
			category: categories[categories.length - 1 - index].cat
		};
	});
}

function prepareData() {
	return new Promise(resolve => {
		const sum = d3.sum(categories, d => d.count);

		const counts = categories.map(d => {
			const percent = d.count / sum;
			return Math.floor(percent * badgePos.length);
		});

		const culture = culturePos.map(d => ({
			...d,
			category: 'cultural-icon'
		}));

		loadData()
			.then(results => {
				const withCat = assignCategoryRandom(counts);
				// const fullBadge = withCat.concat(culture);
				const fullBadge = withCat;
				const curateData = results.curate;
				const exploreData = results.explore;
				const allData = {
					badgeOnly: withCat,
					fullBadge,
					curate: curateData,
					explore: exploreData
				};
				resolve(allData);
			})
			.catch(console.log);
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
				cy: +c.at('cy')
			});
		});
	window.output = JSON.stringify(out);
}

function init() {
	prepareData().then(setup);
	// svgToJSON();
}

export default { init, resize };
