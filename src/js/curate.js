import $ from './dom';

let simulation = null;

const $curate = d3.select('#curate');
const $p = $curate.select('p');

let tweetData = [];
let nodes = [];

let centerX = 0;
let centerY = 0;
let minR = 0;
let maxR = 0;

const scaleFollowers = d3.scalePow().exponent(0.5);
const scaleStrength = d3.scaleLinear();

function handleTick() {
	$.tweets.selectAll('.tweet').translate(d => [d.x, d.y]);
}

function runSim() {
	// const alphaDecay = 0.0227;
	// const alphaMin = 0.001;
	// const alphaTarget = 0.0;
	// const velocityDecay = 0.4;
	const alpha = 0.1;
	const alphaDecay = 0.005;
	const alphaMin = 0.0;
	const alphaTarget = 0.0001;
	const velocityDecay = 0.5;
	const manyBodyStrength = -15;

	simulation = d3
		.forceSimulation(nodes)
		.on('tick', handleTick)
		.alpha(alpha)
		.alphaDecay(alphaDecay)
		.alphaMin(alphaMin)
		.alphaTarget(alphaTarget)
		.velocityDecay(velocityDecay)
		.force('center', d3.forceCenter(centerX, centerY))
		.force(
			'collide',
			d3
				.forceCollide()
				.radius(d => scaleFollowers(d.followers) + 2)
				.strength(1)
			// .iterations(2)
		)
		.force('x', d3.forceX(centerX).strength(d => scaleStrength(d.followers)))
		.force('y', d3.forceY(centerY).strength(d => scaleStrength(d.followers)));
	// .force('charge', d3.forceManyBody().strength(manyBodyStrength));
	// .force('x', d3.forceX(centerX))
	// .force('y', d3.forceY(centerY));
}

function handoff(direction) {
	nodes = tweetData.filter(d => d.category === 'a');

	const followerMax = d3.max(nodes, n => n.followers);
	scaleFollowers.domain([0, followerMax]).range([minR, maxR]);

	scaleStrength.domain([0, followerMax]).range([0.1, 0.33]);

	const $tweet = $.tweets.selectAll('.tweet').data(nodes, d => d.category);

	const $tweetEnter = $tweet
		.enter()
		.append('g')
		.at('class', d => `tweet tweet-${d.category} is-active`);

	$tweetEnter.each((d, i, n) => {
		if (d.chosen) {
			d3.select(n[i]).append('circle.outer');
			d3.select(n[i]).append('circle.mid');
		}
	});

	$tweetEnter.append('circle.inner').at({
		cx: 0,
		cy: 0,
		r: 0
	});

	$tweet.exit().remove();

	const $tweetMerge = $tweetEnter.merge($tweet);

	$tweetMerge
		.transition()
		.duration(500)
		.select('.inner')
		.at('r', d => scaleFollowers(d.followers));
	runSim();
}

function resize() {
	centerX = $.chart.node().offsetWidth / 2;
	centerY = $.chart.node().offsetHeight / 2;
	$p.st('height', window.innerHeight);

	minR = 4;
	maxR = 16;
}

function init(data) {
	tweetData = data;
}

export default { init, resize, handoff };
