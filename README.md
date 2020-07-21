# grove-code-challenge
[Grove Collaborative](https://github.com/groveco) coding challenge (06/14/2019)  

### The Challenge
See the [repo](https://github.com/groveco/code-challenge)  

### How to run
- `yarn test` will run all tests via node
- `yarn start` will run the app
- `yarn build` will generate the executable
- `./find-store [--options]` will run the executable

### How does it work?
So the idea here is to create a few key functions we need to accomplish the Acceptance Criteria, and compose them to create the solution we're looking for. Good Unit Testing of the functions that comprise the flow should then give us some degree of confidence of quality.  

The functions:  
- `getCoordinateDistance`
  - This is the actual distance algorithm I lifted from [this webpage](https://www.movable-type.co.uk/scripts/latlong.html).  
    Note here that I used that website's **haversine** formula, which is the first of the three on that page that calculate distance
  - I modified the algorithm a bit to work with objects that contain lat and long (or y and x) instead of exploding them out.  
    Note that I did have the option to destructure these, but I thought the way I wrote it easier to read.
  - By default, the algorithm calculates the distance in meters. I added a conditional to make it use miles by default, and kilometers if specified.
  - The `Math` js module doesn't include a function to convert degrees to radians (and degrees is the unit I get from the `store-locations.csv` file as well as the arcGIS endpoint) so I added an extension to it called `radians` and used this in place of the `toRadians()` function the algorithm on the web page uses (which incidentally doesn't exist in node)
- `findClosestStore`  
  - We're basically comparing coordinate distance (using the above `getCoordinateDistance` formula) for the JS object we get back from the GIS geocoding endpoint with the list of stores (that include long and lat).
  - Depending on the results from `getCoordinateDistance`, depends on how we find the best match:
    - If the current store's distance between the address the user specified is less than the previous store's distance, we return the current (otherwise, the previous). Since this store will then get carried over to the next iteration of the `reduce` function, we can compare the next store with the previous winner.
    - And so on and so forth. Effectively getting us the store with the best match  

Though it is worth mentioning the `args` function I create:
- We filter out all the stuff we don't care about
- We reform the array into a javascript object (that `reduce` bit at the end)  

**Parsing command-line arguments**  
- Following the flow of the filter statements:
  - There must be at least one flag (otherwise we don't pass, and never process any stores)
  - Of the flags, they must look like one of the following: 
    - `--address=`
    - `--zip=`
    - `--units=`
    - `--output=`
  - Not all of these are required, but there must be `--address=` or `--zip=` for the program to run

**Reading from csv and converting to JSON**  
- `csvtojson` library
- Because the `csv().fromFile()` function returns a promise (or this libraries version of a `Promise`? Looks like they call it a `Converter` type) we have to handle this asynchronously. Hence the `Promose.all([])`  

**Geocoding address/zip**  
- API endpoint (see the `geocodingEndpoint` variable)
- `node-fetch` to asynchronously reach out to that endpoint and obtain the top `candidates`
- compare the first candidate with each **store** (we do this using the `findClosestStore` function)

**Print to console**  
- `console.log()` to straight up print to the console if explicitly specify `--output="json"` flag
- `printPrettyStore()` uses this [EasyTable](https://github.com/eldargab/easy-table) js lib to print something friendly to the console

### Notes and caveats
- I used the [ArcGIS Geocoding Services](https://developers.arcgis.com/rest/geocode/api-reference/geocoding-find-address-candidates.htm#) for geocoding addresses and zip codes (they appear to do it for free?) 
  - The endpoint geocodes addresses to coordinates and zip to coordinates which takes care of the AC given by Grove
- There are libs that calc distance b/t coordinates, but the requirements stipulate I roll my own
- If the user specifies both an `--address` and `--zip` flag, the program just uses the `--address` specified
- In order to run the executable, you need to append `./` (regardless of OS I believe). There are a few ways to avoid this, but didn't believe it worth the effort given it wasn't within the AC given by Grove.
- I likely didn't cover every single use case and possible path the user could take, but tried to take into account the common scenarios (not including the address or zip flag, etc.)
- Did not test the run function because testing a function like that would require some additional libraries to handle promises and asynchronous concerns that I thought might not be worth it if I tested the constituent functions well enough. Definately a way to improve things would be to have the function return some promise, and ensure that `run()` function handles it's inputs appropriately.
- We always throw away the first two entries in the js `process.argv` array because the first two elements refer to the `process.execPath` and the path to the file being executed (see [here](https://nodejs.org/docs/latest/api/process.html#process_process_argv) for more info).
