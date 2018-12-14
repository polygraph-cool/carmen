import $ from './dom';

function createTweet(data, positionX, positionY){
  const tweet = $.chart.append('div.tweet__example')

  tweet.append('p.tweet__example-name').text(data[0].name)
  tweet.append('p.tweet__example-handle').text(data[0].handle)
  tweet.append('p.tweet__example-text').text(data[0].text)
  tweet.append('p.tweet__example-time').text(data[0].time)

  tweet
    .classed('is-active', true)
    .translate([positionX, positionY])
}

function clearTweets(){
  $.chart.selectAll('.tweet__example').remove()
}

export default {createTweet, clearTweets}
