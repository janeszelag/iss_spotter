const request = require('request');
//returns your public ip from ipify and uses it in the callback function
const fetchMyIP = function(callback) {
  
  request(`https://api.ipify.org?format=json`, (error, response, body) => {
    
    if (error) {

      callback(error);
      return;

    } else if (response.statusCode !== 200) {

      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;

    } else {

      const ip = JSON.parse(body).ip;
      callback(null, ip);

    }
  });
};

//Our next function, fetchCoordsByIP will be one that takes in an IP address
//and returns the latitude and longitude for it.
//https://ipvigilante.com/8.8.8.8
const fetchCoordsByIP = function(ip, callback) {
  
  request(`https://ipvigilante.com/${ip}`, (error, response, body) => {
    
    if (error) {

      callback(error);
      return;

    } else if (response.statusCode !== 200) {

      const msg = `Status Code ${response.statusCode} when fetching coords. Response: ${body}`;
      callback(Error(msg), null);
      return;

    } else {
      let geoObj = {latitude: '', longitude: ''};
      let lat = JSON.parse(body).data.latitude;
      let log = JSON.parse(body).data.longitude;
      geoObj['latitude'] = lat;
      geoObj['longitude'] = log;
      
      callback(null, geoObj);

    }
  });
};



const fetchISSFlyOverTimes = function(coords, callback) {
  
  let latNum = coords.latitude;
  let lonNum = coords.longitude;

  request(`http://api.open-notify.org/iss-pass.json?lat=${latNum}&lon=${lonNum}`, (error, response, body) => {
    
    if (error) {

      callback(error);
      return;

    } else if (response.statusCode !== 200) {

      const msg = `Status Code ${response.statusCode} when fetching coords. Response: ${body}`;
      callback(Error(msg), null);
      return;

    } else {
      let passTimes =  JSON.parse(body).response;
      
      callback(null, passTimes);

    }
  });

};

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results. 
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */ 

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};



module.exports = {
  nextISSTimesForMyLocation
};