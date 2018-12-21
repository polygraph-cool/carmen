import $ from './dom';

const BADGE_W = 1280;
const BADGE_H = 1024;
const BADGE_R = 2.5;
const BADGE_RATIO = BADGE_W / BADGE_H;
const DPR = window.devicePixelRatio ? Math.min(window.devicePixelRatio, 2) : 1;

let width = 0;
let height = 0;

function getScale() {
	const w = width / DPR;
	const h = height / DPR;
	const screenRatio = w / h;

	let scale = 0;
	let offsetW = 0;
	let offsetH = 0;

	if (screenRatio > BADGE_RATIO) {
		scale = h / BADGE_H;
		const imageW = scale * BADGE_W;
		offsetW = (w - imageW) / 2;
		offsetH = 0;
	} else {
		scale = w / BADGE_W;
		const imageH = scale * BADGE_H;
		offsetW = 0;
		offsetH = (h - imageH) / 2;
	}
	// console.log({ scale, offsetW, offsetH });
	return { scale, offsetW, offsetH };
}

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
	clear,
	getScale
};
