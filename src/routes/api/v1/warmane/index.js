const express = require('express');

const asyncMiddleware = require('../../../../middleware/asyncMiddleware');
const Scraper = require('../../../../models/Scraper');
const Team = require('../../../../models/Team');
const Player = require('../../../../models/Player');

const router = express.Router();

const getTeams = url => (
  asyncMiddleware(async (req, res) => {
    const scraper = new Scraper({ url });
    const teams = await scraper.getWarmaneLadder()
      .catch(err => res.status(400).send(err));
    const resolvedTeams = teams.map(async (team) => {
      const newTeam = new Team(team);
      const teamInfo = await newTeam.getInfo();

      return teamInfo;
    });

    return Promise.all(resolvedTeams).then(data => res.send(data));
  })
);

router.post('/players', asyncMiddleware(async (req, res) => {
  const { players } = req.body;
  const resolvedPlayers = players.map(async (player) => {
    const newPlayer = new Player(player);
    const withTalents = await newPlayer.getTalents()
      .catch(err => err);

    return withTalents;
  });

  return Promise.all(resolvedPlayers).then(data => res.send(data));
}));

router.get('/wotlk/2v2', getTeams('http://armory.warmane.com/ladder/2v2/Icecrown'));

router.get('/wotlk/3v3', getTeams('http://armory.warmane.com/ladder/3v3/Icecrown'));

router.get('/tbc/2v2', getTeams('http://armory.warmane.com/ladder/2v2/Outland'));

router.get('/tbc/3v3', getTeams('http://armory.warmane.com/ladder/3v3/Outland'));

module.exports = router;
