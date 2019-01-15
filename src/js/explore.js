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
let sectionWidth = null;

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

function loadMoreData() {
	const NUM_FILES = 25;
	const INDEX = Math.ceil(Math.random() * NUM_FILES);

	return new Promise((resolve, reject) => {
		d3.loadData(`assets/data/explore-${INDEX}.csv`, (err, response) => {
			if (err) reject(err);
			else resolve(response);
		});
	});
}

function setupData(response) {
	tweetData = d3.shuffle(response[0]);
	return tweetData;
}

function showTweet(forceMiddle) {
	let selRow = Math.floor(Math.random() * row);
	let selCol = Math.floor(Math.random() * col);

	if (forceMiddle) {
		selRow = Math.floor(row / 2);
		selCol = Math.floor(col / 2);
	}

	tweetCount += 1;
	const fileLength = tweetData.length;

	if (tweetCount === fileLength) {
		return new Promise((resolve, reject) => {
			loadMoreData()
				.then(setupData)
				.then(resolve)
				.catch(reject);
		});
	}

	// translate div
	const dotPos = selCol * diameter - diameter / 2;
	// center highlighted dot
	let posX = pageWidth / 2 - dotPos;
	// don't let slide div expose background
	if (dotPos < pageWidth / 2) posX = 0;
	const dif = sectionWidth - pageWidth / 2;
	console.log({ dotPos, pageWidth, sectionWidth, posX, dif });
	if (dotPos > dif) posX = -(sectionWidth - pageWidth);

	$slide.st('left', posX);

	setTimeout(d => {
		removeTweets();
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
			.st('opacity', 0)
			.st('height', d => d.diameter)
			.st('width', d => d.diameter)
			.st('border-radius', '50%')
			// .st('backgroundSize', d => `${diameter * (d + mult)}px ${diameter * (d + mult)}px`)
			.st('top', d => selRow * diameter - (d.diameter - diameter) / 2)
			.st('left', d => selCol * diameter - (d.diameter - diameter) / 2)
			.transition()
			.delay((d, i) => i * 50)
			.duration(500)
			.st('opacity', 1);

		exDot
			.st({
				height: diameter,
				width: diameter,
				backgroundSize: `${diameter}px ${diameter}px`,
				top: selRow * diameter,
				left: selCol * diameter,
				opacity: 0
			})
			.transition()
			.duration(200)
			.st('opacity', 1);

		Tweet.create({
			data: tweetData[tweetCount],
			x: selCol * diameter,
			y: selRow * diameter,
			fade: true,
			offset: true,
			section: 'explore'
		});
	}, 800);
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
	// number of dots of a certain size that can fit on the screen
	row = Math.floor(height / diameter);
	// number of col needed to add up to the total count with the calculated rows
	col = Math.floor(count / row);

	$dots.st({
		width: col * diameter,
		backgroundSize: `${radius * 2}px ${radius * 2}px`
	});

	sectionWidth = $dots.node().offsetWidth;
	$.exploreSec.classed('is-hidden', false);
}

function init(data) {
	tweetData = data.explore;
	$explore.select('button').on('click', showTweet);
	resize();
}

export default { init, resize, clear, enterSection };
