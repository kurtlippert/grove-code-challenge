const fetch = require('node-fetch')
const csv = require('csvtojson')
const path = require('path')
const util = require('util')

const geocodingEndpoint = addressOrZip =>
  encodeURI(
    'http://geocode.arcgis.com/' +
    'arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=' +
    addressOrZip + 
    '&f=pjson')

// Extension for 'Math'
Math.radians = (degrees) =>
	degrees * Math.PI / 180;

/**
 * 
 * @param {x: number, y: number} coor1 The first x/y coordinate we're comparing
 * @param {x: number, y: number} coor2 The second x/y coordinate we're comparing
 * @param {string} units Miles or Kilometers respectively
 * 
 * @returns {number} The distance between the coordinates
 */
const getCoordinateDistance = (coor1, coor2, units='MI') => {
  var R = units === 'KM' ? 6371 : 3958.8

  var φ1 = Math.radians(coor1.y);
  var φ2 = Math.radians(coor2.y);
  var Δφ = Math.radians(coor2.y-coor1.y);
  var Δλ = Math.radians(coor2.x-coor1.x);

  var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  
  return R * c
}

/**
 * 
 * @param {x: number, y: number} gisAddressCoordinates The address coordinates we get from the GIS endpoint
 * @param {*} stores See the 'store-locations.csv' file for the structure
 * @returns {*} A 'store' object. The one closest to the GIS address
 */
const findClosestStore = (gisAddressCoordinates, stores) =>
  // a reduce function preserves calcluations from the previous iteration
  // perfect for trying to find the best match in an array of things
  stores.reduce((previousStore, currentStore) => {
    // the winner is the new closest store (and will be compared to the next store during the next iteration)
    const currentStoreCoordinates = { x: currentStore.Longitude, y: currentStore.Latitude }
    const previousStoreCoordinates = { x: previousStore.Longitude, y: previousStore.Latitude }
    return getCoordinateDistance(gisAddressCoordinates, currentStoreCoordinates) <
            getCoordinateDistance(gisAddressCoordinates, previousStoreCoordinates)
      ? currentStore
      : previousStore
  })

// Ignore any arguments we (likely) don't care about
const args = process.argv
  .filter((_, index) => index > 1)
  .filter(arg => arg.startsWith('--address=') || arg.startsWith('--zip='))
  .filter(arg => arg.split('=')[1])
  .map(arg => {
    const [k, v] = arg.split('=')
    return { [k.substring(2)]: v }
  })

// run
if (process.env.npm_lifecycle_event !== 'test') {
  if (args.length < 1) {
    console.log(
      `Usage:
      find_store --address="<address>"
      find_store --address="<address>" [--units=(mi|km)] [--output=text|json]
      find_store --zip=<zip>
      find_store --zip=<zip> [--units=(mi|km)] [--output=text|json]`)
  }
  else {
    Promise.all([
      csv().fromFile(path.resolve(process.cwd(), 'store-locations.csv')),
      fetch(geocodingEndpoint('380 New York Street, Redlands, CA 92373'))
        .then(res => res.json())
    ])
    .then(res => {
      const [stores, gisRes] = res
      // console.log(stores)
      console.log(args)

      // the first candidate from the GIS endpoint is usually the best match
      // 'cadidates' object from the gis endpoint:
      // candidates:
      //  [ { address: '380 New York St, Redlands, California, 92373',
      //      location: { x: -117.1956703176181, y: 34.05648811930892 },
      //      score: 100,
      //      attributes: {},
      //      extent:
      //      ...
      //  } ]
      const gisAddressCoordinates = gisRes.candidates[0].location

      const closestStore = findClosestStore(gisAddressCoordinates, stores)

      console.log(closestStore)
    })
  }
}

module.exports = {
  getCoordinateDistance,
  findClosestStore
}