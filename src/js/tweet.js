import $ from './dom';
import Colors from './colors';

const REM = 16;
const PAD = REM * 4;

const $step = d3.selectAll('.intro__steps');
const $slide = d3.selectAll('.figure__dots');

const svgIcon =
	'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#c9c9c9" stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-twitter"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>';

function create({
	data,
	x = 0,
	y = 0,
	fade,
	offset,
	pushLeft,
	section,
	category
}) {


	const $tweet =
		section === 'explore'
			? $.exploreTweets.append('div.tweet')
			: $.chartTweets.append('div.tweet');



	console.log({category})

	const { handle, text, time } = data;
	// $tweet.append('p.tweet__name').text(name);
	const top = $tweet.append('div.tweet__top');
	top.append('p.tweet__handle').text(handle);
	const $icon = top.append('div.tweet__icon').html(svgIcon);
	// const $line = $tweet.append('div.tweet__line');
	$tweet.append('p.tweet__text').text(text);
	$tweet.append('p.tweet__time').text(time);

	if (category) $icon.select('svg').st('fill', Colors[category]);
	else $icon.select('svg').st('fill', Colors.bg);
	const grabRandomImage = d3
		.scaleQuantize()
		.domain([0, 1])
		.range([1, 2, 3, 4, 5]);
	$tweet
		.append(`div.tweet__image-${grabRandomImage(Math.random())}`)
		.attr('title', 'Picture of Carmen Sandiego');

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
	const yOffAm = -h * 1.35;
	const drawW = chartW - PAD;
	let marginLeft = 0;
	let marginTop = offset ? yOffAm : 0;
	const stepWidth = $step.node().offsetWidth;

	if (section == 'explore') {
		const slideWidth = $slide.node().offsetWidth;
		if (x + w >= slideWidth) marginLeft = -(x + w - slideWidth);
		else if (x - w <= 0) marginLeft = w - x;
	} else if (x + w >= drawW) marginLeft = -(x + w - drawW);
	else if (x + w >= drawW - stepWidth && pushLeft)
		marginLeft = -(x + w - (drawW - stepWidth));
	else if (x - w <= PAD) marginLeft = w - x + PAD;

	// if (x + fullW >= drawW || pushLeft) marginLeft = drawW - fullW//-(w * 2);
	// if (x - w <= PAD) marginLeft = w;

	const boxTop = offset ? y + yOffAm : y;

	if (boxTop <= h) marginTop = -yOffAm;

	// if (y + (2 * h) >= chartH - PAD) marginTop += -h;
	// if (y - (2 * h) <= PAD) marginTop = h;
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
