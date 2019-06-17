const fetch = require('node-fetch')
const csv = require('csvtojson')
const path = require('path')
const EasyTable = require('easy-table')

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
const getCoordinateDistance = (coor1, coor2, units='mi') => {
  var R = units === 'km' ? 6371 : 3958.8

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
const findClosestStore = (gisAddressCoordinates, stores, units) =>
  // a reduce function preserves calcluations from the previous iteration
  // perfect for trying to find the best match in an array of things
  stores.reduce((previousStore, currentStore) => {
    // the winner is the new closest store (and will be compared to the next store during the next iteration)
    const currentStoreCoordinates = { x: currentStore.Longitude, y: currentStore.Latitude }
    const previousStoreCoordinates = { x: previousStore.Longitude, y: previousStore.Latitude }
    const currentStoreDistance = getCoordinateDistance(gisAddressCoordinates, currentStoreCoordinates, units)
    const previousStoreDistance = getCoordinateDistance(gisAddressCoordinates, previousStoreCoordinates, units)
    return currentStoreDistance < previousStoreDistance
      ? { ...currentStore, Distance: currentStoreDistance }
      : { ...previousStore, Distance: previousStoreDistance }
  })

const prettyPrintStore = (store) => {
  const units = args.units === 'km' ? 'Kilometers' : 'Miles'
  const addressOrZip = args.address ? 'address' : 'zip code'
  console.log(`\nThe closest store is ~${Math.round(store.Distance)} ${units} away from that ${addressOrZip}\n`)
  console.log(EasyTable.print(store))
}

// Ignore any arguments we (likely) don't care about
// Then form the args we do into a new object
const args = 
  process.argv
    .filter((_, index) => index > 1)
    .filter(arg =>
      arg.startsWith('--address=') ||
      arg.startsWith('--zip=') || 
      arg.startsWith('--units=') || 
      arg.startsWith('--output=')
    )
    .filter(arg => arg.split('=')[1])
    .reduce((acc, cur) => {
      const [k, v] = cur.split('=')
      return { ...acc, [k.substring(2)]: v }
    }, {})

// run
if (process.env.npm_lifecycle_event !== 'test') {
  if (Object.keys(args) < 1) {
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
      // doesn't really matter if we have 'address' or 'zip', we form the call to the endpoint similarly
      fetch(geocodingEndpoint(args.address || args.zip))
        .then(res => res.json())
    ])
    .then(res => {
      const [stores, gisRes] = res

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

      const closestStore = findClosestStore(gisAddressCoordinates, stores, args.units === 'km' ? 'km' : 'mi')

      // Print results to stdout 'pretty' by default
      args.output === 'json'
        ? console.log(closestStore)
        : prettyPrintStore(closestStore)
    })
  }
}

// This bit is mainly for the test file to consume these functions (for testing)
module.exports = {
  getCoordinateDistance,
  findClosestStore
}