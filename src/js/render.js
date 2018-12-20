import $ from './dom';

let width = 0;
let height = 0;

function resize() {
	width = $.chart.node().offsetWidth;
	height = $.chart.node().offsetHeight;
}

function dot({ d, ctx }) {
	ctx.beginPath();
	ctx.moveTo(d.x + d.r, d.y);
	ctx.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
	ctx.fillStyle = d.fill || `rgba(255,255,255,${Math.random()})`;
	ctx.fill();
}

function clear(ctx) {
	ctx.clearRect(0, 0, width, height);
}

export default {
	resize,
	dot,
	clear
};
