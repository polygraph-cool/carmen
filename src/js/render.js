import $ from './dom';

const DPR = window.devicePixelRatio ? Math.min(window.devicePixelRatio, 2) : 1;

let width = 0;
let height = 0;

function resize() {
	width = $.chart.node().offsetWidth * DPR;
	height = $.chart.node().offsetHeight * DPR;
	$.canvasBg
		.at({ width: width * DPR, height: height * DPR })
		.st({ width, height });

	$.canvasFg
		.at({ width: width * DPR, height: height * DPR })
		.st({ width, height });

	$.canvasEx
		.at({ width: width * DPR, height: height * DPR })
		.st({ width, height });
}

function dot({ d, ctx }) {
	const x = d.x * DPR;
	const y = d.y * DPR;
	const r = d.r * DPR;
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.fillStyle = d.fill || '#f30';
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
