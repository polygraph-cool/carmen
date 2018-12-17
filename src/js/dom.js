const section = d3.selectAll('section');
const chart = d3.select('#chart');
const svg = chart.select('svg');
const g = svg.select('g');
const map = g.select('.g-map');
const nodes = g.select('.g-nodes');
const introDots = d3.select('.intro__dots');
const chartTweets = chart.select('.chart__tweets');
const exploreNav = d3.select('.explore__nav');
const header = d3.select('header');

export default {
	section,
	chart,
	svg,
	g,
	map,
	nodes,
	introDots,
	chartTweets,
	exploreNav,
	header
};
