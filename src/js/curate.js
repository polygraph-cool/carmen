import $ from './dom';
import Tweet from './tweet';
import Render from './render';
import Categories from './categories';
import Colors from './colors';

const BADGE_R = 3;
const DURATION = 1000;


const exampleTweet = {
	name: 'The Pudding',
	handle: '@puddingviz',
	text: 'We ❤️ Carmen Sandiego',
	time: '11/14/18 12:39 PM'
};

let sampleSize = 0;
let simulation = null;
let cat = 'edutainment';
let active = false;
const $curate = d3.select('#curate');
const $nav = $curate.select('nav');
const $step = $curate.selectAll('.step');
const $fade = $step.selectAll('.step__fade')

let badgeData = [];
let tweetData = [];
let nodes = [];
let filteredTweets = [];

let width = 0;
let height = 0;
let centerX = 0;
let centerY = 0;
let radius = 0;
let currentStep = null;
let timer = null;
let triggeredVor = false;
let mobile = false
let BP = 800

const ease = d3.easeCubicOut;

const voronoi = d3.voronoi();

function handleVorEnter({ data }) {
	let { x, y, index } = data;
	y = y + 20;
	nodes.forEach(d => {
		if (d.index === index) d.stroke = '#fff';
		else d.stroke = '#000';
		Render.dot({ d, ctx: $.contextFg, concentric: false });
	});

	Tweet.clear({ section: 'curate' });

	// console.log(filteredTweets[index]);

	Tweet.create({
		data: filteredTweets[index] ? filteredTweets[index] : exampleTweet,
		x,
		y,
		offset: true,
		section: 'curate',
		category: filteredTweets[index].category,
	});
}

function handleNavClick() {
	$nav.selectAll('button').classed('is-active', false);
	const $button = d3.select(this);
	$button.classed('is-active', true);
	cat = $button.at('data-id');

	// console.log({ cat, tweetData });

	runNav(cat);
}

function handleEnd() {
	// VORONOI
	voronoi
		.x(d => d.x)
		.y(d => d.y)
		.extent([[0, 0], [width, height]]);

	let $vorPath = $.vor.selectAll('path');
	d3.select(".g-voronoi").selectAll("path").remove();

	const polygons = voronoi.polygons(nodes);

	var vorPaths = d3.select(".g-voronoi").selectAll("path")
		.data(polygons)
		.enter()
		.append('path')
		;

	// $vorPath = $vorPath
	// 	.data(polygons)
	// 	.enter()
	// 	.append('path')
	// 	.merge($vorPath);

	vorPaths.at('d', d => (d ? `M${d.join('L')}Z` : null));

	// $vorPath.at('d', d => (d ? `M${d.join('L')}Z` : null));
	vorPaths.on('mouseenter', handleVorEnter);
	// $vorPath.on('mouseenter', handleVorEnter);
	// $vorPath.on('mouseout', handleVorE);
	// else $vorPath.on('mouseenter', handleVorEnter);
}

function handleTick() {

	const a = simulation.alpha();

	// console.log(a, triggeredVor);

	if (!triggeredVor && a < 0.5) {
		triggeredVor = true;
		handleEnd();
	}
	if(currentStep == "nav"){
		Render.clear($.contextFg);
		nodes.forEach(d => {
			Render.dot({ d, ctx: $.contextFg });
		});
	}

}

function runSim() {
	// const alpha = 1;
	// const alphaDecay = 0.0227;
	// const alphaMin = 0.001;
	// const alphaTarget = 0.0;
	// const velocityDecay = 0.4;
	const alphaDecay = 0.0227;
	const alphaMin = 0.001;
	const alphaTarget = 0.0;
	const velocityDecay = 0.4;
	const manyBodyStrength = -radius * 1.5;

	// disable mouse interaction while it sim is running
	$.vor.selectAll('path').on('mouseenter', () => {});

	// reset trigger for rendering voronoi
	triggeredVor = false;

	simulation = d3
		.forceSimulation(nodes)
		.on('tick', handleTick)
		.alphaDecay(alphaDecay)
		.alphaMin(alphaMin)
		.alphaTarget(alphaTarget)
		.velocityDecay(velocityDecay)
		.force('x', d3.forceX(centerX))
		.force('y', d3.forceY(centerY))
		.force('charge', d3.forceManyBody().strength(manyBodyStrength));
	// .on('end', handleEnd);
}

function runNav(cat) {

	console.log("runningnav");
	// unhide text and buttons
	$fade.classed('is-hidden', false)
	const roleModelCat = ['latina', 'inspiration', 'role-model', 'feminism']
	filteredTweets = tweetData.filter(d => cat === 'role-model' ? roleModelCat.includes(d.category) : d.category === cat);
	// 100 tweets for edutainment
	Tweet.clear({ section: 'curate' });
	const c = Categories.find(c => c.cat === cat);
	const sample = Math.floor(c.count * sampleSize);

	badgeData.forEach(n => {
		n.x = n.ox;
		n.y = n.oy;
		n.r = n.or;
	});

	function getRandom(arr, n) {
	    var result = new Array(n),
	        len = arr.length,
	        taken = new Array(len);
	    if (n > len)
	        throw new RangeError("getRandom: more elements taken than available");
	    while (n--) {
	        var x = Math.floor(Math.random() * len);
	        result[n] = arr[x in taken ? taken[x] : x];
	        taken[x] = --len in taken ? taken[len] : len;
	    }
	    return result;
	}

	var filteredBadgedData = badgeData
		.filter(d => d.category === cat);

	nodes = getRandom(filteredBadgedData, filteredTweets.length);
	// nodes = badgeData
	// 	.filter(d => d.category === cat)
	// 	.slice(0, filteredTweets.length);

	nodes.forEach(d => {
		d.stroke = '#000';
		d.sr = d.or;
		d.tr = radius;
	});

	// transition scale
	if (timer) timer.stop();

	timer = d3.timer(elapsed => {
		// compute how far through the animation we are (0 to 1)
		const t = Math.min(1, ease((elapsed / DURATION) * 0.5));

		// update point positions (interpolate between source and target)
		nodes.forEach(d => {
			d.r = d.sr * (1 - t) + d.tr * t;
		});

		// if this animation is over
		if (t === 1) {
			console.log("timer stopped");
			// stop this timer for this layout and start a new one
			timer.stop();
		}
	});

	// console.log({ sample });
	runSim();
}

function runIntro() {
	console.log(simulation);
	console.log("runningIntro");
	$.chart.select(".chart__curate_purp").classed('is-hidden',false);

	// hide hover text and buttons
	$fade.classed('is-hidden', true)
	// disable mouse interaction while it sim is running
	$.vor.selectAll('path').on('mouseenter', () => {});

	// reset trigger for rendering voronoi
	triggeredVor = false;

	if (simulation) simulation.stop();
	if (timer) timer.stop();

	Render.clear($.contextBg);
	Render.clear($.contextFg);

	nodes = badgeData;

	nodes.forEach(d => {
		d.sx = d.x;
		d.sy = d.y;
		d.tx = d.ox;
		d.ty = d.oy;
		d.sr = d.r;
		d.tr = d.or;
		d.fill = Colors[d.category];
		d.stroke = null;
	});

	var extentX = d3.extent(nodes,function(d){return d.tx});
	var extentY = d3.extent(nodes,function(d){return d.ty});

	var xRangeBefore = d3.scaleLinear().domain([0,1]).range([0,extentX[0]])
	var yRangeBefore = d3.scaleLinear().domain([0,1]).range([0,height])

	var xRangeAfter = d3.scaleLinear().domain([0,1]).range([extentX[1],width])
	var yRangeAfter = d3.scaleLinear().domain([0,1]).range([0,height])

	var extraNodes = [];

	for (var dot in d3.range(200)){
		extraNodes.push({x:xRangeBefore(Math.random()),y:yRangeBefore(Math.random()),r:nodes[0].r,fill:Colors["cultural-icon"],stroke:null});
		extraNodes.push({x:xRangeAfter(Math.random()),y:yRangeAfter(Math.random()),r:nodes[0].r,fill:Colors["cultural-icon"],stroke:null});
	}

	timer = d3.timer(elapsed => {
		// compute how far through the animation we are (0 to 1)
		const t = Math.min(1, ease(elapsed / DURATION));

		// update point positions (interpolate between source and target)
		nodes.forEach(d => {
			d.x = d.sx * (1 - t) + d.tx * t;
			d.y = d.sy * (1 - t) + d.ty * t;
			d.r = d.sr * (1 - t) + d.tr * t;
		});

		// console.log(nodes[0]);
		// update what is drawn on screen
		Render.clear($.contextFg);

		nodes.forEach(d => {
			Render.dot({ d, ctx: $.contextFg });
		});

		// var thing = {x:50,y:50,r:20,fill:"purple",stroke:null};
		extraNodes.forEach(d => {
			// Render.dot({ d:thing, ctx: $.contextFg });
			d.r = nodes[0].tr;
			Render.dot({ d:d, ctx: $.contextFg });
		});


		// if this animation is over
		if (t === 1) {
			console.log("timer stopped");
			// stop this timer for this layout and start a new one
			timer.stop();

			if(active){
				$.chartCurate.classed('is-hidden', false);
			}

		}
	});
}

function enterSection() {
	Render.clear($.contextFg);
	active = true;
}

function enter(step) {
	Tweet.clear({ section: 'curate' });
	currentStep = step;

	$.chartCurate.classed('is-hidden', true);

	$step.filter(function(d,i){
		return d3.select(this).attr("data-step") == step
	}).classed("is-visible",true);

	console.log(currentStep);
	if (currentStep === 'intro') runIntro();
	else if (currentStep === 'nav') {
		runNav('edutainment');
		$.chart.select(".chart__curate_purp").classed('is-hidden',true);
		$nav.selectAll('button').classed('is-active', (d, i) => i === 0);
	}
}

function exit(step) {
	Tweet.clear({ section: 'curate' });
	if(step == "nav"){
		runIntro();
		currentStep = "intro"
	}
	// currentStep = step === 'nav' ? 'intro' : 'nav';
	// console.log(step,currentStep);
}

function clear() {
	Tweet.clear({ section: 'curate' });
	active = false;
}

function resize() {
	sampleSize = 0.05;
	width = $.chart.node().offsetWidth;
	height = $.chart.node().offsetHeight;
	mobile = width < BP
	centerX = width / 2;
	centerY = mobile ? height * 2/3 : height / 2;

	const stepSize = $step.size();
	const stepHeight = window.innerHeight;
	$step.st('height', stepHeight)//.classed('is-visible', true);
	// .st('height', (d, i) => stepHeight * (i === stepSize - 1 ? 2 : 1))

	const { scale, offsetW, offsetH } = Render.getScale();

	badgeData.forEach(b => {
		b.ox = scale * b.cx + offsetW;
		b.oy = scale * b.cy + offsetH;
		b.or = scale * BADGE_R;
		b.x = centerX;
		b.y = centerY;
		b.r = 0;
	});

	radius = BADGE_R * 3;

	$.chart
		.select('.chart__curate')
		.selectAll('.curate__label')
		.st('left', d => scale * d.cx + offsetW)
		.st('top', d => scale * d.cy + offsetH);

	enter(currentStep);
}

function setupLabels() {
	const $label = $.chart
		.select('.chart__curate')
		.selectAll('div.curate__label')
		.data(Categories)
		.enter()
		.append('div')
		.at('class', d => `curate__label ${d.cat}`);
	$label.append('p').text(d => d.label);
}

function init(data) {
	badgeData = data.fullBadge.map(d => ({
		...d
	}));
	tweetData = data.curate;
	$nav.selectAll('button').on('click', handleNavClick);
	setupLabels();
}

export default { init, resize, enter, enterSection, exit, clear };
