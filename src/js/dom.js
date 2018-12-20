const section = d3.selectAll('section');
const chart = d3.select('#chart');
const canvas = chart.select('.chart__canvas');
const context = canvas.node().getContext('2d');
const bg = chart.select('.chart__bg');
const contextBg = bg.node().getContext('2d');
const svg = chart.select('svg');
const g = svg.select('g');
const globe = g.select('.g-globe');
const nodes = g.select('.g-nodes');
const introDots = d3.select('.intro__dots');
const chartTweets = chart.select('.chart__tweets');
const exploreNav = d3.select('.explore__nav');
const header = d3.select('header');

export default {
	section,
	chart,
	canvas,
	context,
	bg,
	contextBg,
	svg,
	g,
	globe,
	nodes,
	introDots,
	chartTweets,
	exploreNav,
	header
};
