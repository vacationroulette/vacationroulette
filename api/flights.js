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
      var distanceFilteredResults = this.filterResultsByDistance(distance, results);
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
    if (price !== 0) {
      results = _.sortBy(results, 'LowestFare');
      results = _.chunk(results, Math.ceil(results.length / 3))[price - 1];
    }
    return results;
  };

  this.filterResultsByDistance = function(distance, results) {
    var airportHelper = require('../helpers/airport');

    if (distance !== 0) {
      // Calculate a distance for each of the airports.
      results.forEach(function (flight) {
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

  this.getKayakUrl = function(trip) {
    var dep = trip.DepartureDateTime.split('T')[0];
    var ret = trip.ReturnDateTime.split('T')[0];

    return 'http://www.kayak.com/flights/' + trip.OriginLocation
      + '-' + trip.DestinationLocation + '/' + dep + '/' + ret;
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
        theme: _.kebabCase(data.activity).toUpperCase(),
        location: "US"
      };

      // Include the activity if not #yolo.
      if (data.activity !== '???') {
        opt.activity = _.kebabCase(data.activity).toUpperCase();
      }

      this.sabreDestinationFinder(opt, function(err, innerData) {
        if (err) {
          console.log('Error: ' + err);
          return res.sendStatus(404);
        }

        var element = innerData.FareInfo;
        for (var a = 0; a < element.length; a++) {
          element[a].OriginLocation = innerData.OriginLocation;
          element[a].kayak = this.getKayakUrl(element[a]);

          if (element[a].CurrencyCode === 'N/A') {
            element.splice(a, 1);
          }
        }

        var filteredData = this.filterResults(data.price, data.distance, element);

        return res.status(200).send(filteredData);
      });
    });
  });
};
