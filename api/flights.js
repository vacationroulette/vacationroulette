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
      if (err) return res.status(400).send(err.msg);

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

      this.sabreDestinationFinder(opt, function(err, data) {
        if (err) {
          console.log('Error: ' + err);
          return res.sendStatus(400);
        }

        return res.status(200).send(data.FareInfo);
      });
    });
  });
};
