import $ from './dom';

const origW = 1280
const origH = 1024
const radius = 2.5

const image = d3.selectAll('.bottom')

const circlePos = [{
  cat: 'a',
  cx: 833.5,
  cy: 253.5
}, {
  cat: 'b',
  cx: 609.5,
  cy: 316.5
}, {
  cat: 'c',
  cx: 385.5,
  cy: 407.5
}, {
  cat: 'd',
  cx: 854.5,
  cy: 568.5
}, {
  cat: 'e',
  cx: 462.5,
  cy: 582.5
}, {
  cat: 'f',
  cx: 651.5,
  cy: 610.5
}, {
  cat: 'g',
  cx: 826.5,
  cy: 757.5
}]

function setupCircles(){
  $.svg.selectAll('.circle')
    .data(circlePos)
    .enter()
    .append('circle')
    .attr('class', d => `circle circle-${d.cat}`)
}


function resize() {
  let width = image.node().offsetWidth
  let height = image.node().offsetHeight

  $.svg
    .style('width', width)
    .style('height', height)

  $.svg.selectAll('.circle')
    .attr('r', radius)
    .attr('cx', d => (d.cx * width) / origW)
    .attr('cy', d => (d.cy * height) / origH)
}

function init() {
  setupCircles()
  resize()
}

export default { init, resize };
