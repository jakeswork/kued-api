const fetch = require('isomorphic-fetch');

const logger = require('../utils/logger');

class Player {
  constructor(props) {
    Object.assign(this, props);

    this.url = `http://armory.warmane.com/character/${this.charname}/${this.realm}`;
  }

  async getFallbackSpec() {
    try {
      logger.info(`Only one set of talents found. Fetching ${this.url}/profile`);

      const playerURL = await fetch(`${this.url}/profile`);
      const html = await playerURL.text();

      return html.split('<div class="text">')[4].split('<')[0].trim();
    } catch (err) {
      const error = new Error(err);

      logger.error(error);

      return error;
    }
  }

  async getTalents() {
    try {
      const talentsURL = await fetch(`${this.url}/talents`);
      const html = await talentsURL.text();
      const playerHasDualSpec = html.split('td class="selected"')[1];

      if (playerHasDualSpec) {
        logger.info(`Has dual spec. Fetched ${this.url}/talents`);

        return {
          spec: playerHasDualSpec.split('</a>')[0].split('alt="')[1].split('"')[0].trim(),
          ...this,
        };
      }

      const fallbackSpec = await this.getFallbackSpec();

      return {
        spec: fallbackSpec,
        ...this,
      };
    } catch (err) {
      const error = new Error(err);

      logger.error(error);

      return error;
    }
  }
}

module.exports = Player;
