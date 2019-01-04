import $ from './dom';

const REM = 16;
const PAD = REM * 4;

function create({ data, x = 0, y = 0, fade, offset, pushLeft, section }) {
	const $tweet =
		section === 'explore'
			? $.exploreTweets.append('div.tweet')
			: $.chartTweets.append('div.tweet');

	const { handle, text, time } = data;
	// $tweet.append('p.tweet__name').text(name);
	$tweet.append('p.tweet__handle').text(handle);
	$tweet.append('p.tweet__text').text(text);
	$tweet.append('p.tweet__time').text(time);
	$tweet.append('div.tweet__image');

	$tweet
		.st({ top: y, left: x })
		.st('opacity', 0)
		.transition()
		.duration(fade ? 500 : 0)
		.st('opacity', 1);

	// adjust position
	const w = +$tweet.node().offsetWidth / 2;
	const h = +$tweet.node().offsetHeight / 2;
	const chartW = $.chartTweets.node().offsetWidth;
	const chartH = $.chartTweets.node().offsetHeight;
	let marginLeft = 0;
	let marginTop = offset ? -h * 1.35 : 0;
	if (x + w >= chartW - PAD || pushLeft) marginLeft = -w;
	if (x - w <= PAD) marginLeft = w;

	console.log({w, h, chartW, chartH, x, y})

	if (y + h >= chartH - PAD) marginTop += -h;
	if (y - h <= PAD) marginTop = h;
	$tweet.st({ marginLeft, marginTop });
}

function clear({ section, fade }) {
	const $t = section === 'explore' ? $.exploreTweets : $.chartTweets;
	$t.selectAll('.tweet')
		.transition()
		.delay(fade ? 250 : 0)
		.duration(fade ? 250 : 0)
		.st('opacity', 0)
		.remove();
}

export default { create, clear };
