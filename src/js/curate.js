import $ from './dom';

const simulation = d3.forceSimulation();

const $curate = d3.select('#curate');
const $p = $curate.select('p');

let tweetData = [];
let nodes = [];

function handleTick() {
	$.tweets.selectAll('.tweet').translate(d => [d.x, d.y]);
}

function runSim() {
	const alphaDecay = 0.0228;
	const alphaMin = 0.001;
	const alphaTarget = 0;
	const velocityDecay = 0.4;
	const manyBodyStrength = -5;

	// const forceX = d => {
	// 	const { x } = d.pos ? d.pos : { x: 0.5 };
	// 	const px = x * width;
	// 	const offset = d.offscreen ? radius : radius;
	// 	if (d.qIndex === 0) return px - offset * 2;
	// 	if (d.qIndex === 1) return px - offset;
	// 	if (d.qIndex === 2) return px + offset;
	// 	if (d.qIndex === 3) return px + offset * 2;
	// 	return px;
	// };

	// const forceY = d => {
	// 	const { y } = d.pos ? d.pos : { y: 0.5 };
	// 	return y * height;
	// };

	// const forceR = () => Math.min(width, height) * 0.33;

	simulation
		.alphaDecay(alphaDecay)
		.alphaMin(alphaMin)
		.alphaTarget(alphaTarget)
		.velocityDecay(velocityDecay)
		.force('charge', d3.forceManyBody().strength(manyBodyStrength))
		// .force(
		// 	'collide',
		// 	d3
		// 		.forceCollide()
		// 		.radius(2)
		// 		.strength(1)
		// )
		.force('x', d3.forceX(500))
		.force('y', d3.forceY(500))
		.on('tick', handleTick);

	simulation.nodes(nodes);
}

function handoff(direction) {
	nodes = tweetData.filter(d => d.category === 'a');

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
		r: 2,
		cx: 0,
		cy: 0
	});

	$tweet.exit().remove();

	const $tweetMerge = $tweetEnter.merge($tweet);
	runSim();
}

function resize() {
	$p.st('height', window.innerHeight);
}

function init(data) {
	tweetData = data;
}

export default { init, resize, handoff };
