import $ from './dom';

const REM = 16;
const PAD = REM;

function create({ data, x, y, fade, offset }) {
	const $tweet = $.chartTweets.append('div.tweet');

	const { name, handle, text, time } = data;
	$tweet.append('p.tweet__name').text(name);
	$tweet.append('p.tweet__handle').text(handle);
	$tweet.append('p.tweet__text').text(text);
	$tweet.append('p.tweet__time').text(time);

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
	let marginTop = offset ? -h * 1.25 : 0;
	if (x + w >= chartW - PAD) marginLeft = -w;
	if (x - w <= PAD) marginLeft = w;

	if (y + h >= chartH - PAD) marginTop += -h;
	if (y - h <= PAD) marginTop = h;
	$tweet.st({ marginLeft, marginTop });
}

function clear() {
	$.chartTweets.selectAll('.tweet').remove();
}

export default { create, clear };
