import $ from './dom';

// selections
const tweet = $.chart.selectAll('.tweet__example')
const name = tweet.select('.tweet__example-name')
const handle = tweet.select('.tweet__example-handle')
const text = tweet.select('.tweet__example-text')
const time = tweet.select('.tweet__example-time')


function showTweet(data, positionX, positionY){
  name.text(data[0].name)
  handle.text(data[0].handle)
  text.text(data[0].text)
  time.text(data[0].time)

  tweet
    .classed('is-active', true)
    .translate([positionX, positionY])
}

export default showTweet
