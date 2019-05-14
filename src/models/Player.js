const fetch = require('isomorphic-fetch');
const { asyncPoll } = require('async-poll');

const logger = require('../utils/logger');

class Player {
  constructor(props) {
    Object.assign(this, props);

    this.url = `http://armory.warmane.com/character/${this.name}/${this.realm}`;
  }

  async getInfo() {
    try {
      const fn = async () => fetch(`http://armory.warmane.com/api/character/${this.name}/${this.realm}/summary`).then(r => r.json());
      /** Keep polling until the more than 100 `news` are received or `status` returns `complete` */
      const conditionFn = d => !d.error;
      /** Poll every 2 seconds */
      const interval = 3e3;
      /** Timeout after 30 seconds and returns end result */
      const timeout = 30e3;

      asyncPoll(fn, conditionFn, { interval, timeout })
        .catch(e => logger.error(new Error(e)));

      const resolved = await asyncPoll(fn, conditionFn, { interval, timeout });
      const withTalents = await this.getTalents();

      return {
        ...resolved,
        ...withTalents,
      };
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
}

module.exports = Player;
