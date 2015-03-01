var _ = require('lodash');
var Sabre = require('sabre-dev-studio/lib/sabre-dev-studio-flight');

module.exports = function(app) {
  var sabre = new Sabre({
    client_id: app.config.client_id,
    client_secret: app.config.client_secret,
    uri: app.config.uri
  });

  this.is_empty = function(key) {
    if (key === null || key === '' || key === 'undefined') {
      return true;
    } else {
      return false;
    }
  };

  this.verifyRequest = function(req, cb) {

    if (this.is_empty(req.body.departureDate)) {
      return cb({msg: 'Departure date must be included.'}, null);
    }
    if (this.is_empty(req.body.departureLocation)) {
      return cb({msg: 'Departure location must be included.'}, null);
    }
    if (this.is_empty(req.body.returnDate)) {
      return cb({msg: 'Return date must be included.'}, null);
    }
    if (this.is_empty(req.body.distance)) {
      return cb({msg: 'Distance must be included.'}, null);
    }
    if (this.is_empty(req.body.price)) {
      return cb({msg: 'Price range must be included.'}, null);
    }
    if (this.is_empty(req.body.activity)) {
      return cb({msg: 'Activity type must be included.'}, null);
    }

    var data = {
      departureDate: req.body.departureDate,
      departureLocation: req.body.departureLocation,
      returnDate: req.body.returnDate,
      distance: req.body.distance,
      price: req.body.price,
      activity: req.body.activity
    };

    cb(null, data);
  };

  this.filterResults = function(price, distance, results) {
    // If we have 3 or less results, ignore the filter.
    if (results.length > 3) {
      // If the price filter is set, divide the results dataset into 3 groups
      // and take the group requested.
      var priceFilteredResults = this.filterResultsByPrice(price, results);
      var distanceFilteredResults = this.filterResultsByDistance(price, results);
      var intersectedResults = _.intersection(priceFilteredResults, distanceFilteredResults);

      // Ensure we actually have a result to return.
      if (!(intersectedResults.length > 0)) {
        // Disregard the distance filter, it is less important than price.
        return priceFilteredResults;
      }
      return intersectedResults;
    }
    return results;
  };

  this.filterResultsByPrice = function(price, results) {
    var _ = require('lodash');

    if (price !== 0) {
      results = _.sortBy(results, 'price');
      results = _.chunk(results, Math.ceil(results.length / 3))[price - 1];
    }
    return results;
  };

  this.filterResultsByDistance = function(distance, results) {
    console.log("In filterResultsByDistance with parameters distance = " + distance + " and results = " + JSON.stringify(results));
    var _ = require('lodash');
    var airportHelper = require('../helpers/airport');

    if (distance !== 0) {
      // Calculate a distance for each of the airports.
      results.forEach(function (flight) {
        console.log("\n\nFlight:" + JSON.stringify(flight));
        flight['distance'] = airportHelper.getDistanceBetweenAirports(flight['OriginLocation'], flight['DestinationLocation']);
      });

      // Sort and chunk the results.
      results = _.sortBy(results, 'distance');
      results = _.chunk(results, Math.ceil(results.length / 3))[distance - 1];

      // Remove the distance from the results.
      _.forEach(results, function (flight) {
        delete flight['distance'];
      });
      return results;
    }

    return results;
  };

  this.convertDate = function(input) {
    var date = new Date(input);
    var m = _.padLeft((date.getMonth() + 1), 2, '0');
    var d = _.padLeft(date.getDate(), 2, '0');

    return date.getFullYear() + '-' + m + '-' + d;
  };

  this.sabreDestinationFinder = function(options, cb) {
    sabre.destination_finder(options, function(err, data) {
      if (err) return cb(err, null);

      cb(null, JSON.parse(data));
    });
  };

  app.post('/api/flights', function(req, res) {
    this.verifyRequest(req, function(err, data) {

      if (err) {
        res.status(400).send(err.msg);
        return;
      }

      // Fix our dates to be the desired sabre format.
      data.departureDate = this.convertDate(data.departureDate);
      data.returnDate = this.convertDate(data.returnDate);

      // The filter options for the saber api call.
      var opt = {
        origin: data.departureLocation,
        departuredate: data.departureDate,
        returndate: data.returnDate,
        theme: data.activity
      };

      this.sabreDestinationFinder(opt, function(err, data2) {

        if (err) {
          console.log('Error: ' + err);
          return res.sendStatus(400);
        }

        data2.FareInfo.forEach(function(element) {
          element["DepartureLocation"] = opt["origin"];
        });


        var filteredFareInfo = this.filterResults(data.price, data.distance, data2.FareInfo);

        return res.status(200).send(filteredFareInfo);
      });
    });
  });
};
