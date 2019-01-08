import $ from './dom';

const REM = 16;
const PAD = REM * 4;

const $step = d3.selectAll('.intro__steps')
const $slide = d3.selectAll('.figure__dots')

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
	$tweet.append('div.tweet__image').attr("title","Picture of Carmen Sandiego");

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
	const yOffAm = -h * 1.35
	const drawW = chartW - PAD
	let marginLeft = 0;
	let marginTop = offset ? yOffAm : 0;
	let stepWidth = $step.node().offsetWidth

	if (section == 'explore'){
		let slideWidth = $slide.node().offsetWidth
		if(x + w >= slideWidth) marginLeft = -((x + w) - slideWidth)
		else if (x - w <= 0 ) marginLeft = (w - x)
		console.log({x, w, slideWidth, marginLeft})
	}
	else {
		if (x + w >= drawW) marginLeft = -((x + w) - drawW)
		else if (x + w >= drawW - stepWidth && pushLeft) marginLeft = -((x + w) - (drawW - stepWidth))
		else if (x - w <= PAD) marginLeft = (w - x) + PAD
	}

	//if (x + fullW >= drawW || pushLeft) marginLeft = drawW - fullW//-(w * 2);
	//if (x - w <= PAD) marginLeft = w;

	const boxTop = offset ? y + yOffAm : y

	if (boxTop <= h) marginTop = -(yOffAm)

	// if (y + (2 * h) >= chartH - PAD) marginTop += -h;
	// if (y - (2 * h) <= PAD) marginTop = h;
	$tweet.st({ marginLeft, marginTop });
	console.log({boxTop, w, h, x, y, chartW, chartH, marginLeft, marginTop})
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
