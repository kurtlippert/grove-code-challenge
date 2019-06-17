const test = require('tape');
const { getCoordinateDistance, findClosestStore, args } = require('./index')

test('getCoordinateDistance', (t) => {
  const coor1 = { x: -117.195670, y: 34.056488 }
  const coor2 = { x: -92.168147, y: 46.808614 }

  t.equal(
    Math.round(getCoordinateDistance(coor1, coor2, 'km')),
    2531
  )

  t.equal(
    Math.round(getCoordinateDistance(coor1, coor2)),
    1573
  )

  t.equal(
    Math.round(getCoordinateDistance(coor1, coor2, 'mi')),
    1573
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

test('args', (t) => {
  const args1 = []

  // note we add two extra throw away strings to this array because that's what the 
  // function does. `process.argv` includes `process.execPath` and the path to the file by default
  const args2 = [ '.../file/blah', '.../file/foo', '--address=blah', '--zip=foo' ]
  const args3 = [ '.../file/blah', '.../file/foo', '--zip=foo' ]
  const args4 = [ '.../file/blah', '.../file/foo', '--junk1=j1', '--junk2=j2', '--address=something' ]

  t.deepEqual(
    args(args1),
    {}
  )

  t.deepEqual(
    args(args2),
    { 'address': 'blah', 'zip': 'foo' }
  )

  t.deepEqual(
    args(args3),
    { 'zip': 'foo' }
  )

  t.deepEqual(
    args(args4),
    { 'address': 'something' },
  )

  t.end()
})
