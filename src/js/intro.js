import $ from './dom';
import Tweet from './tweet';
import tweetPos from './tweet-pos';
import Render from './render';

const BADGE_W = 1280;
const BADGE_H = 1024;
const BADGE_R = 2.5;

const $intro = d3.select('#intro');
const $introHed = $intro.select('.intro__hed');
const $title = $intro.selectAll('.intro__hed-text');
const $stepGroup = $intro.selectAll('.intro__steps');
const $step = $intro.selectAll('.step');

let badgeData = [];
let width = null;
let height = null;
let timeout = null;

let currentStep = null;

const exampleTweet = {
	name: 'The Pudding',
	handle: '@puddingviz',
	text: 'We ❤️ Carmen Sandiego',
	time: '11/14/18 12:39 PM'
};

function hideTitle() {
	const titleWidth = $intro.select('.intro__hed').node().offsetWidth;
	$introHed.classed('is-hidden', true);
	$title
		.transition()
		.duration(500)
		.delay((d, i) => i * 50)
		.translate([-titleWidth, 0]);

	$intro
		.select('.carmen-crouch')
		.transition()
		.duration(500)
		.translate([-titleWidth, 20]);
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
}

function triggerExample() {
	const delay = 4000;
	const r = Math.floor(Math.random() * badgeData.length);
	const d = badgeData[r];
	const { x, y } = d;

	d.fill = '#f30';

	Tweet.clear({ section: 'intro' });
	Render.clear($.contextEx);
	Render.dot({ d, ctx: $.contextEx });
	Tweet.create({
		data: exampleTweet,
		x,
		y,
		fade: true,
		offset: true,
		section: 'intro'
	});
	timeout = setTimeout(triggerExample, delay);
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
		d.fill = '#000';
		Render.dot({ d, ctx: $.contextFg });
	});
}

function runTitle() {
	showTitle();
	Render.clear($.contextEx);
	Tweet.clear({ section: 'intro' });
	revealDots();
}

function runExamples() {
	hideTitle();
	triggerExample();
}

function enter(step) {
	if (timeout) clearTimeout(timeout);
	currentStep = step;
	if (currentStep === 'title') runTitle();
	else if (currentStep === 'examples') runExamples();
}

function exit(step) {
	if (timeout) clearTimeout(timeout);
	currentStep = step === 'examples' ? 'title' : 'examples';
	if (currentStep === 'title') runTitle();
}

function handoff(direction) {}

function clear() {
	Tweet.clear({ section: 'intro' });
	Render.clear($.contextEx);
	if (timeout) clearTimeout(timeout);
}

function resize() {
	width = $.chart.node().offsetWidth;
	height = $.chart.node().offsetHeight;

	const { scale, offsetW, offsetH } = Render.getScale();
	// console.log({ width, height, scale, offsetW, offsetH });
	badgeData.forEach(b => {
		b.x = scale * b.cx + offsetW;
		b.y = scale * b.cy + offsetH;
		b.r = scale * BADGE_R;
	});

	// someTweets.forEach(t => {
	// 	t.x = scale * t.cx + offsetW;
	// 	t.y = scale * t.cy + offsetH;
	// 	t.r = scale * BADGE_R;
	// });

	const stepHeight = window.innerHeight;

	const stepSize = $step.size();
	$step
		.st('height', (d, i) => stepHeight * (i === stepSize - 1 ? 2 : 1))
		.classed('is-visible', true);

	// const radius = Math.floor((BADGE_R * width) / BADGE_W);

	// const sz = Math.floor((radius * 4 * 7) / 5)

	const radius = scale * BADGE_R;

	$.chartTweets.st('width', width).st('height', height);
	const unit = (radius + scale) * 2;

	const area = width * height;
	const unitSQ = unit * unit;

	let numDots = Math.ceil(area / unitSQ);

	const col = Math.ceil(width / unit) + 1;

	numDots += col * 2;

	const bgData = d3.range(numDots).map(i => ({
		d: {
			x: (i % col) * unit,
			y: Math.floor(i / col) * unit,
			r: scale * BADGE_R,
			fill: '#333'
		},
		ctx: $.contextBg
	}));

	Render.clear($.contextBg);
	bgData.forEach(Render.dot);
	enter(currentStep);
}

function init(data) {
	badgeData = data.map(d => ({ ...d }));
}

export default { init, resize, enter, exit, handoff, clear };
