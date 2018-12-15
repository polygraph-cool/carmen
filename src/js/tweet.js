import $ from './dom';

function createTweet({ data, x, y }) {
	const $tweet = $.chartTweets.append('div.tweet');

	const { name, handle, text, time } = data;
	$tweet.append('p.tweet__name').text(name);
	$tweet.append('p.tweet__handle').text(handle);
	$tweet.append('p.tweet__text').text(text);
	$tweet.append('p.tweet__time').text(time);

	$tweet.st({ top: y, left: x });

	$tweet.classed('is-center', true);
}

function clearTweets() {
	$.chartTweets.selectAll('.tweet').remove();
}

export default { createTweet, clearTweets };
