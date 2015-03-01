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

  app.post('/api/flights', function(req, res) {
    this.verifyRequest(req, function(err, data) {
      if (err) return res.status(400).send(err.msg);

      return res.status(200).send('ok');
    });
  });
};
