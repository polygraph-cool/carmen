const NUM_FILES = 12;
const INDEX = Math.ceil(Math.random() * NUM_FILES);

function loadData() {
	return new Promise((resolve, reject) => {
		d3.loadData(
			'assets/data/curate.csv',
			'assets/data/explore-special.csv',
			`assets/data/explore-${INDEX}.csv`,
			(err, response) => {
				if (err) reject(err);
				else resolve(response);
			}
		);
	});
}

function setupData(response) {
	const curateData = d3.shuffle(response[0]);
	const special = d3.shuffle(response[1]);
	const nonSpecial = d3.shuffle(response[2]);
	const exploreData = special.concat(nonSpecial);

	return { curate: curateData, explore: exploreData };
}

function init() {
	return new Promise((resolve, reject) => {
		loadData()
			.then(setupData)
			.then(resolve)
			.catch(reject);
	});
}

export default init;
