import $ from './dom';
import Tweet from './tweet';

const ORIG_W = 1280;
const ORIG_H = 1024;
const DEFAULT_R = 2.5;

const $explore = d3.select('#explore');
const $dots = $explore.select('.figure__dots');
const $tweets = $explore.select('.figure__tweets');
const $figure = $explore.select('.explore__figure')
const $slide = $explore.select('.figure__slide')

let row = null
let col = null
let diameter = null
let pageWidth = null

const exampleTweet = {
	name: 'The Pudding',
	handle: '@puddingviz',
	text: 'We ❤️ Carmen Sandiego',
	time: '11/14/18 12:39 PM'
};

function handoff(direction) {}

function removeTweets(){
	Tweet.clear('explore')
	$tweets.selectAll('.figure__tweets-dot').remove()
}

function showTweet() {
	removeTweets()
	const selRow = Math.floor(Math.random() * row)
	const selCol = Math.floor(Math.random() * col)

	console.log({col, row, selRow, selCol})
	const exDot = $tweets.append('div.figure__tweets-dot')

	exDot
		.st({
			height: diameter,
			width: diameter,
			backgroundSize: `${diameter}px ${diameter}px`,
			top: selRow * diameter,
			left: selCol * diameter
		})

	// translate div

	// center highlighted dot
	const posX = (pageWidth / 2) - (selCol * diameter) - (diameter / 2)
	console.log({pageWidth})
	console.log({posX})

	$slide
		.translate([posX, 0])
		.st('transition', 'transform .2s ease-in-out')

	Tweet.create({ data: exampleTweet, x: selCol * diameter, y: selRow * diameter, fade: true, offset: true, section: 'explore' });
}

function resize() {
	const headerH = $.header.node().offsetHeight;
	const height = window.innerHeight - headerH;
	$figure.st('height', height)

	pageWidth = $explore.node().offsetWidth

	const count = 130000;
	const radius = Math.ceil((DEFAULT_R * height) / ORIG_H);
	diameter = radius * 2
	row = Math.floor(count / height);
	col = Math.floor(count / row);


	$dots.st({
		height: height,
		width: col * diameter,
		backgroundSize: `${radius * 2}px ${radius * 2}px`
	});
}

function init() {
	$explore.select('button').on('click', showTweet);
	resize()
}

export default { init, resize, handoff };
