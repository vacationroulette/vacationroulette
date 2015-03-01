module.exports = function(app) {
  return {
    flights: require('./flights')(app)
  };
};
