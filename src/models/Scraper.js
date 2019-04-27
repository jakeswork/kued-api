const fetch = require('isomorphic-fetch');

const logger = require('../utils/logger');

class Scraper {
  constructor(props) {
    Object.assign(this, props);
  }

  async getWarmaneLadder() {
    try {
      logger.info(`Fetching ${this.url}`);

      const res = await fetch(this.url);
      const html = await res.text();
      const regex = /("\/team([^"]|"")*)/g;
      const teams = html.match(regex).map((team, i) => {
        const strings = team.split('/');

        return {
          name: strings[2].replace(/\+/g, ' '),
          realm: strings[3],
          rank: i + 1,
        };
      });

      return teams;
    } catch (err) {
      const error = new Error(err);

      logger.error(error);

      return error;
    }
  }
}

module.exports = Scraper;
