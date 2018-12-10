const chart = d3.select('#chart');
const svg = chart.select('svg');
const g = svg.select('g');
const map = g.select('.g-map');
const tweets = g.select('.g-tweets');

export default {
	chart,
	svg,
	g,
	map,
	tweets
};
