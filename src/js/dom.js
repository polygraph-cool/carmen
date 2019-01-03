const section = d3.selectAll('section');
const chart = d3.select('#chart');
const canvasBg = chart.select('.canvas__bg');
const contextBg = canvasBg.node().getContext('2d');
const canvasFg = chart.select('.canvas__fg');
const contextFg = canvasFg.node().getContext('2d');
const canvasEx = chart.select('.canvas__ex');
const contextEx = canvasEx.node().getContext('2d');
const canvasGlobe = chart.select('.canvas__globe');
const contextGlobe = canvasGlobe.node().getContext('2d');
const overlay = chart.select('.chart__overlay');

const svg = chart.select('svg');
const g = svg.select('g');
const globe = g.select('.g-globe');
const nodes = g.select('.g-nodes');
const vor = g.select('.g-voronoi');

const chartTweets = chart.select('.chart__tweets');
const exploreTweets = d3.select('.figure__tweets');
const exploreNav = d3.select('.explore__nav');
const header = d3.select('header');

export default {
	section,
	chart,
	canvasBg,
	contextBg,
	canvasFg,
	contextFg,
	canvasEx,
	contextEx,
	canvasGlobe,
	contextGlobe,
	overlay,
	svg,
	g,
	globe,
	nodes,
	vor,
	chartTweets,
	exploreTweets,
	exploreNav,
	header
};
