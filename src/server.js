const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors({ origin: 'http://localhost:3000' }));

app.use(bodyParser.json());

app.use('/api/v1/warmane', require('./routes/api/v1/warmane'));

app.listen(4000);
