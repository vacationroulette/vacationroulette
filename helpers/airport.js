var _ = require('lodash');
module.exports = {

  /**
   * Returns the city of the airport specified.
   *
   * @param airportCode
   *  The airport code to get the city of.
   *
   * @returns String
   *  The city of the airport specified.
   */
  getCityByAirportCode: function(airportCode) {
    var fileSystem = require('fs');
    var airportDataJson = fileSystem.readFileSync('./airports.min.json');
    var airportData = JSON.parse(airportDataJson);
    var city = _.filter(airportData, { 'code': airportCode })[0].city;
    return city;
  },

  /**
   * Returns the location of the airport specified.
   *
   * @param airportCode
   *  The airport code to get the location of.
   *
   * @returns Object
   *  An object containing the longitude and latitude of the airport.
   */
  getLocationByAirportCode: function(airportCode) {
    var fileSystem = require('fs');
    var airportDataJson = fileSystem.readFileSync('./airports.min.json');
    var airportData = JSON.parse(airportDataJson);
    var airport = _.filter(airportData, { 'code': airportCode })[0];
    var longitude = airport.longitude;
    var latitude = airport.latitude;
    return {
      longitude: longitude,
      latitude: latitude
    };
  },

  /**
   * Returns the distance between two airports in miles.
   *
   * @param airportCode1
   *  The airport code for the first airport.
   * @param airportCode2
   *  The airport code for the second airport.
   *
   * @returns int
   *  The distance in miles between the two airports.
   */
  getDistanceBetweenAirports: function(airportCode1, airportCode2) {
    var haversine = require('haversine');
    return haversine(
        this.getLocationByAirportCode(airportCode1),
        this.getLocationByAirportCode(airportCode2),
        { unit: "miles" }
    );
  }
};
