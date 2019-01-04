import $ from './dom';
import Tweet from './tweet';

const BADGE_W = 1400;
const BADGE_H = 1400;
const BADGE_R = 3;

const $explore = d3.select('#explore');
const $dots = $explore.select('.figure__dots');
const $tweets = $explore.select('.figure__tweets');
const $figure = $explore.select('.explore__figure');
const $slide = $explore.select('.figure__slide');

let row = null;
let col = null;
let diameter = null;
let pageWidth = null;

let tweetCount = -1;

let tweetData = null;

const exampleTweet = {
	name: 'The Pudding',
	handle: '@puddingviz',
	text: 'We ❤️ Carmen Sandiego',
	time: '11/14/18 12:39 PM'
};

function removeTweets() {
	Tweet.clear({ section: 'explore', delay: true });
	$tweets.selectAll('.figure__tweets-g').remove();
}

function showTweet(forceMiddle) {
	removeTweets();
	let selRow = Math.floor(Math.random() * row);
	let selCol = Math.floor(Math.random() * col);

	if (forceMiddle) {
		selRow = Math.floor(row / 2);
		selCol = Math.floor(col / 2);
	}

	tweetCount += 1;
	console.log({ tweetCount });

	// console.log({col, row, selRow, selCol})
	const gExDot = $tweets.append('div.figure__tweets-g');

	const exDot = gExDot.append('div.figure__tweets-dot');

	const concentric = [0, 1, 2];
	const mult = [2, 4, 8];
	const mapDia = concentric.map(d => {
		const dia = mult[d] * diameter;
		return { ...d, diameter: dia };
	});

	const exConc = gExDot
		.selectAll('.figure__tweets-conc')
		.data(mapDia)
		.enter()
		.append('div.figure__tweets-conc')
		.st('height', d => d.diameter)
		.st('width', d => d.diameter)
		.st('border-radius', '50%')
		// .st('backgroundSize', d => `${diameter * (d + mult)}px ${diameter * (d + mult)}px`)
		.st('top', d => selRow * diameter - (d.diameter - diameter) / 2)
		.st('left', d => selCol * diameter - (d.diameter - diameter) / 2);

	exDot.st({
		height: diameter,
		width: diameter,
		backgroundSize: `${diameter}px ${diameter}px`,
		top: selRow * diameter,
		left: selCol * diameter
	});

	// translate div

	// center highlighted dot
	const posX = pageWidth / 2 - selCol * diameter - diameter / 2;
	// console.log({pageWidth})
	// console.log({posX})

	$slide.st('left', posX);

	Tweet.create({
		data: tweetData[tweetCount],
		x: selCol * diameter,
		y: selRow * diameter,
		fade: true,
		offset: true,
		section: 'explore'
	});
}

function clear() {
	Tweet.clear({ section: 'explore' });
}

function enterSection() {
	showTweet(true);
}

function resize() {
	const headerH = $.header.node().offsetHeight;
	const height = window.innerHeight - headerH;
	$figure.st('height', height);

	pageWidth = $explore.node().offsetWidth;

	const count = 130000;
	const radius = Math.ceil((BADGE_R * height) / BADGE_H);
	diameter = radius * 2;
	row = Math.floor(count / height);
	col = Math.floor(count / row);

	$dots.st({
		width: col * diameter,
		backgroundSize: `${radius * 2}px ${radius * 2}px`
	});
}

function init(data) {
	tweetData = data.explore;
	// console.log({tweetData})
	$explore.select('button').on('click', showTweet);
	resize();
}

export default { init, resize, clear, enterSection };
