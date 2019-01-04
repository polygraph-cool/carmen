import $ from './dom';

const BADGE_W = 1400;
const BADGE_H = 1400;
const BADGE_R = 3;
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
		offsetW = Math.floor((w - imageW) / 2);
		offsetH = 0;
	} else {
		scale = w / BADGE_W;
		const imageH = scale * BADGE_H;
		offsetW = 0;
		offsetH = Math.floor((h - imageH) / 2);
	}
	// console.log({ scale, offsetW, offsetH });
	return { scale, offsetW, offsetH };
}

function resize() {
	width = $.chart.node().offsetWidth * DPR;
	height = $.chart.node().offsetHeight * DPR;
	$.canvasBg
		.at({ width, height })
		.st({ width: width / DPR, height: height / DPR });

	$.canvasFg
		.at({ width, height })
		.st({ width: width / DPR, height: height / DPR });

	$.canvasEx
		.at({ width, height })
		.st({ width: width / DPR, height: height / DPR });

	const globeW = width - d3.select('.globe__steps').node().offsetWidth * DPR;
	$.canvasGlobe
		.at({ width: globeW, height })
		.st({ width: globeW / DPR, height: height / DPR });

	const bgSize = getScale().scale * 30;

	$.chart.select(".chart__curate_purp")
		.st('background-image', 'url("assets/images/bg-dots-purp.png")')
		.st('background-size', `${bgSize}px ${bgSize}px`);

	$.chart
		.st('background-image', 'url("assets/images/bg-dots.png")')
		.st('background-size', `${bgSize}px ${bgSize}px`);
}

function createConcentric({ ringNum, ctx }) {
	const r = ringNum * 3 * DPR;
	console.log({ r });
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.strokeStyle = fill || d.fill;
	ctx.lineWidth = 2;
	ctx.stroke();
}

function dot({ d, ctx, fill, concentric }) {
	const x = d.x * DPR;
	const y = d.y * DPR;
	const r = d.r * DPR;
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	// console.log({fill})
	ctx.fillStyle = fill ? fill : d.fill; // || '#fff';
	ctx.fill();

	if (concentric === true) {
		// concentric 1
		const r1 = d.r * 2 * DPR;
		ctx.beginPath();
		ctx.moveTo(x + r1, y);
		ctx.arc(x, y, r1, 0, 2 * Math.PI);
		ctx.strokeStyle = fill || d.fill;
		ctx.lineWidth = 1;
		ctx.stroke();

		// concentric 2
		const r2 = d.r * 4 * DPR;
		ctx.beginPath();
		ctx.moveTo(x + r2, y);
		ctx.arc(x, y, r2, 0, 2 * Math.PI);
		ctx.strokeStyle = fill || d.fill;
		ctx.lineWidth = 1;
		ctx.stroke();

		// concentric 3
		const r3 = d.r * 8 * DPR;
		ctx.beginPath();
		ctx.moveTo(x + r3, y);
		ctx.arc(x, y, r3, 0, 2 * Math.PI);
		ctx.strokeStyle = fill || d.fill;
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	if (d.stroke) {
		ctx.strokeStyle = d.stroke;
		ctx.lineWidth = 2;
		ctx.stroke();
	}
}

function clear(ctx) {
	console.log("clear context running")
	ctx.clearRect(0, 0, width, height);
}

function getDPR() {
	return DPR;
}

export default {
	resize,
	dot,
	clear,
	getScale,
	getDPR
};
