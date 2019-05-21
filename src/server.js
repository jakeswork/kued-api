const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');

const whitelistedUrls = [
  'http://localhost:3000',
  'https://kued.ml',
];

app.use(cors({ origin: whitelistedUrls }));

app.use(bodyParser.json());

app.use('/api/v1/warmane', require('./routes/api/v1/warmane'));

app.listen(process.env.PORT || 5000);
