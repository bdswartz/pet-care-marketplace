let nodeGeocoder = require('node-geocoder');
let options = { provider: 'openstreetmap'};
let geoCoder = nodeGeocoder(options);


const codeLatLong = (addString) => {
     try { 
       const results = geoCoder.geocode(addString);
          console.log(results);
          return results;
        // console.log(res[0].latitude);
        // console.log(res[0].longitude);
      }
      catch(err) {
        console.log(err);
      };
};

module.exports = codeLatLong;