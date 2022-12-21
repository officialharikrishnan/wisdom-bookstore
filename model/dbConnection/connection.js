const mongoClient = require('mongodb').MongoClient;

const state = {
  db: null,
};

// eslint-disable-next-line func-names
module.exports.connect = function (done) {
  const url = 'mongodb://localhost:27017';
  const dbname = 'Wisdom';

  // eslint-disable-next-line consistent-return
  mongoClient.connect(url, (err, data) => {
    if (err) return done(err);
    state.db = data.db(dbname);
    done();
  });
};

module.exports.get = () => state.db;
