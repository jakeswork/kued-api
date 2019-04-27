const fetch = require('isomorphic-fetch');
const FormData = require('form-data');

const logger = require('../utils/logger');
const { genderMap, raceMap, classMap } = require('../utils/maps');

class Team {
  constructor(props) {
    Object.assign(this, props);

    this.url = `http://armory.warmane.com/team/${this.name}/${this.realm}`;
  }

  async getInfo() {
    try {
      const teamURL = await fetch(`${this.url}/match-history`);
      const html = await teamURL.text();
      const lastGame = html.split('<td><a href="/').pop().split('<td class="dt-center');
      const lastPlayed = {
        opponent: lastGame[0].split('team/')[1].split('/')[0].replace(/\+/g, ' '),
        outcome: lastGame[1].split('">')[1].split('<')[0],
        rating: lastGame[2].split('">')[1].split(' ')[0],
        time: lastGame[3].split('>')[1].split('<')[0],
        id: lastGame[6].split('data-gameid="')[1].split('"')[0],
      };
      const body = new FormData();

      body.append('matchinfo', lastPlayed.id);

      const history = await fetch(`${this.url}/match-history`, {
        method: 'POST',
        body,
      });
      const json = await history.json();
      const players = json
        .filter(player => player.teamnamerich.indexOf(this.name) > -1)
        .map(matchedPlayer => ({
          ...matchedPlayer,
          race: raceMap[this.race],
          class: classMap[this.class],
          gender: genderMap[this.gender],
        }));

      return {
        ...this,
        players,
        lastPlayed,
      };
    } catch (err) {
      const error = new Error(err);

      logger.error(error, `Error loading ${this.url}.`);

      return error;
    }
  }
}

module.exports = Team;
