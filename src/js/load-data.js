let curateData = null
let exploreData = null
let exploreNum = d3.round(Math.random() * 11, 0)

function loadData(){
  const extraFP = `assets/data/explore-${exploreNum}.csv`

  return new Promise((resolve, reject) => {
    d3.loadData(
      'assets/data/curate.csv',
      'assets/data/explore-special.csv',
      `assets/data/explore-${exploreNum}.csv`,
      (err, response) => {
        if (err) reject(err)
        else resolve (response)
      })
  })
}

function setupData(response){
  let curateData = d3.shuffle(response[0])
  const special = d3.shuffle(response[1])
  const nonSpecial = d3.shuffle(response[2])
  let exploreData = d3.merge([special, nonSpecial])

  return {curate: curateData, explore: exploreData}
}

function handleError(error){
  console.error(error)
}


function init(){
  return new Promise ((resolve, reject) => {
    loadData()
      .then(response => {
        resolve(setupData(response))
      })
      .catch(handleError)
  })
}

export default init
