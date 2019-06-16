const test = require('tape');
const { getCoordinateDistance, findClosestStore } = require('./index')

test('getCoordinateDistance', (t) => {
  const coor1 = { x: -117.195670, y: 34.056488 }
  const coor2 = { x: -92.168147, y: 46.808614 }

  t.equal(
    Math.round(getCoordinateDistance(coor1, coor2, 'KM')),
    2531
  )

  t.end()
})

test('findClosestStore', (t) => {
  const stores = [
    // 2531 km
    {
      'Store Name': 'Duluth',
      'Store Location': 'SEC Hwy 53 & Burning Tree Rd',
      Address: '1902 Miller Trunk Hwy',
      City: 'Duluth',
      State: 'MN',
      'Zip Code': '55811-1810',
      Latitude: '46.808614',
      Longitude: '-92.1681479',
      County: 'St Louis County'
    },
    // 2368 km
    {
      'Store Name': 'Crystal',
      'Store Location': 'SWC Broadway & Bass Lake Rd',
      Address: '5537 W Broadway Ave',
      City: 'Crystal',
      State: 'MN',
      'Zip Code': '55428-3507',
      Latitude: '45.0521539',
      Longitude: '-93.364854',
      County: 'Hennepin County'
    },
    // 2363 km
    {
      'Store Name': 'Bloomington',
      'Store Location': 'NWC 80th & Penn',
      Address: '2555 W 79th St',
      City: 'Bloomington',
      State: 'MN',
      'Zip Code': '55431-1250',
      Latitude: '44.8595041',
      Longitude: '-93.3112747',
      County: 'Hennepin County'
    },
  ]

  t.equal(
    findClosestStore({ x: -117.195670, y: 34.056488 }, stores)['Store Name'],
    'Bloomington'
  )

  t.end()
})
