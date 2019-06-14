// import { stringify } from 'querystring'
// import fetch from 'node-fetch'
// import * as fs from 'fs'
import * as path from 'path'
// import * as https from 'https'
import * as csv from 'csvtojson'

// settings
// const adpLoginOptions = {
//     agent: adpAgentOption,
//     method: 'POST',
//     headers: {
//         'Authorization': `Basic ${Buffer.from(process.env.ADP_CLIENT_ID + ':' + process.env.ADP_CLIENT_SECRET).toString('base64')}`,
//         'Content-Type': 'application/x-www-form-urlencoded'
//     }
// }

// helpers
csv()
  .fromFile(path.resolve(process.cwd(), 'store-locations.csv'))
  .then(res => console.log(res))
  // .then((jsonObj: any)=> {
  //   console.log(jsonObj)
  // })

// start...
console.log('...\n')

Promise.all([
])
