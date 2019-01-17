import $ from './dom';
import Tweet from './tweet';
import Render from './render';
import specialTweets from './intro-tweets.json';

const BADGE_R = 3;
const REM = 16;
const BP = 800;

const $intro = d3.select('#intro');
const $introHed = $intro.select('.intro__hed');
const $title = $intro.selectAll('.intro__hed-text, .intro__watch');
const $swing = $intro.selectAll('.carmen-swing');
const $step = $intro.selectAll('.step');
const $watch = $intro.selectAll('.intro__watch');

let badgeData = [];
let tweetData = [];
let width = 0;
let height = 0;
let stepWidth = 0;
let timeout = null;
let currentStep = null;
let exampleCounter = 0;
let mobile = false;
let active = true;
let disabled = false;

function hideTitle() {
	const titleWidth = $intro.select('.intro__hed').node().offsetWidth;
	$introHed.classed('is-hidden', true);
	
	$title
		.transition()
		.duration(500)
		.delay((d, i) => i * 50)
		.translate([-titleWidth, 0]);

	$intro.select('.intro__desktop')
		.transition()
		.duration(500)
		.delay(200)
		.translate([-titleWidth, 0]);

	$intro
		.select('.carmen-crouch')
		.transition()
		.duration(500)
		.translate([-titleWidth, 20]);

	$swing
		.transition()
		.duration(500)
		.translate([-width, 0]);

	
}

function showTitle() {
	$introHed.classed('is-hidden', false);
	$intro
		.select('.carmen-crouch')
		.transition()
		.duration(500)
		.translate([0, 20]);

	$title
		.transition()
		.duration(500)
		.delay((d, i) => i * 50)
		.translate([0, 0]);


	$intro.select('.intro__desktop')
		.transition()
		.duration(500)
		.delay(200)
		.translate([0, 0]);

	$watch
		.transition()
		.duration(500)
		.translate([0, 0]);

	$swing
		.transition()
		.duration(500)
		.translate([0, 0]);
}

function chooseTweet() {
	if (exampleCounter < specialTweets.length) {
		return specialTweets[exampleCounter];
	}
	const ranIndex = Math.floor(Math.random() * tweetData.length);
	return tweetData[ranIndex];
}

function chooseBadge() {
	let found = false;
	while (!found) {
		const ranPos = Math.floor(Math.random() * badgeData.length);
		const d = badgeData[ranPos];
		if (mobile || d.x < width - (stepWidth + REM)) {
			found = d;
		}
	}
	return found;
}

function triggerExample() {
	if (active) {
		const data = chooseTweet();

		const d = chooseBadge();

		const delay = data.text.length * 50;

		// d.fill = '#fff';

		Tweet.clear({ section: 'intro' });
		Render.clear($.contextEx);
		Render.dot({ d, ctx: $.contextEx, fill: '#fff', concentric: true });
		Tweet.create({
			data,
			x: d.x,
			y: d.y,
			fade: true,
			offset: true,
			pushLeft: !mobile,
			section: 'intro'
		});
		exampleCounter += 1;
		timeout = setTimeout(triggerExample, delay);
	}
}

// function revealTick() {
// 	Render.clear($.contextFg);
// 	let notDone = false;
// 	badgeData.forEach(d => {
// 		d.fill = `rgba(${d.l}, ${d.l}, ${d.l})`;
// 		Render.dot({ d, ctx: $.contextFg });
// 		// inc lightness
// 		if (d.l < d.target) {
// 			notDone = true;
// 			d.l = Math.min(d.target, d.l + d.rate);
// 		}
// 	});
// 	if (currentStep === 'title' && notDone) requestAnimationFrame(revealTick);
// 	else console.log('done');
// }

function revealDots() {
	badgeData.forEach(d => {
		// d.l = 0;
		// d.target = 128;
		// d.rate = 1 + Math.random() * 10;
		d.fill = d.fill || '#e50914';
		Render.dot({ d, ctx: $.contextFg });
	});
}

function runTitle() {
	showTitle();
	// Render.clear($.contextEx);
	// Tweet.clear({ section: 'intro' });
	// revealDots();
}

function runExamples() {
	hideTitle();
	triggerExample();
}

function enterSection() {
	// Render.clear($.contextFg);
	// revealDots();
	if (!disabled) active = true;
}

function enter(step) {
	if (timeout) clearTimeout(timeout);
	currentStep = step;
	if (currentStep === 'title') {
		runTitle();
		setTimeout(triggerExample, 1000);
	} else if (currentStep === 'examples') hideTitle();
	// runExamples();
}

function exit(step) {
	if (timeout) clearTimeout(timeout);
	currentStep = step === 'examples' ? 'title' : 'examples';
	if (currentStep === 'title') runTitle();
}

function clear() {
	active = false;
	Tweet.clear({ section: 'intro' });
	Render.clear($.contextEx);
	if (timeout) clearTimeout(timeout);
}

function resize() {
	width = $.chart.node().offsetWidth;
	height = $.chart.node().offsetHeight;
	stepWidth = $step.node().offsetWidth;
	mobile = width < BP;

	const { scale, offsetW, offsetH } = Render.getScale();

	const stepHeight = window.innerHeight;

	const stepSize = $step.size();
	$step
		.st('height', (d, i) => stepHeight * (i === stepSize - 1 ? 2 : 1))
		.classed('is-visible', true);

	$.chartTweets.st('width', width).st('height', height);

	badgeData.forEach(b => {
		b.x = scale * b.cx + offsetW;
		b.y = scale * b.cy + offsetH;
		b.r = scale * BADGE_R;
	});

	Render.clear($.contextBg);
	enter(currentStep);
}

function disable() {
	active = false;
	disabled = true;
	clear();
}

function init(data) {
	badgeData = data.badgeOnly.map(d => ({ ...d }));
	tweetData = data.curate;
	$.canvasEx.classed('is-hidden', false);
}

export default { init, resize, enter, enterSection, exit, clear, disable };
