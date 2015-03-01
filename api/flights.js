module.exports = function(app) {
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
    var _ = require('lodash');
    var airportHelper = require('../helpers/airport');

    if (distance !== 0) {
      // Calculate a distance for each of the airports.
      _.forEach(results, function(flight) {
        flight['distance'] = airportHelper.getDistanceBetweenAirports(flight['departureLocation'], flight['arrivalLocation']);
      });

      // Sort and chunk the results.
      results = _.sortBy(results, 'distance');
      results = _.chunk(results, Math.ceil(results.length / 3))[distance - 1];

      // Remove the distance from the results.
      _.forEach(results, function(flight) {
        delete flight['distance'];
      });
      return results;
    }
  };

  app.post('/api/flights', function(req, res) {
    this.verifyRequest(req, function(err, data) {
      if (err) return res.status(400).send(err.msg);

      return res.status(200).send('ok');
    });
  });
};
