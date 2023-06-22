const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const dataBasePath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
app.use(express.json());
let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dataBasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
app.get("/players/", async (request, response) => {
  const getPlayersName = `
    SELECT 
    player_id as playerId,
    player_name as playerName
    FROM 
    player_details;`;
  const playersArray = await database.all(getPlayersName);
  response.send(playersArray);
});
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `
    SELECT 
    player_id as playerId,
    player_name as playerName
    FROM 
    player_details
    WHERE 
    player_id = ${playerId};`;
  const playersArray1 = await database.get(getPlayersQuery);
  response.send(playersArray1);
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchDetails = `
    SELECT 
    match_id as matchId,
    match as match,
    year as year
    FROM 
    match_details
    WHERE 
    match_id = ${matchId};
    `;
  const matchDetailsArray = await database.get(matchDetails);
  response.send(matchDetailsArray);
});
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const playerIdDetails = `
  SELECT 
    match_id as matchId,
    match as match,
    year as year
    FROM 
    player_match_score 
    NATURAL JOIN match_details 
    WHERE 
    player_id = ${playerId};
  `;
  const playerIdArray2 = await database.all(playerIdDetails);
  response.send(playerIdArray2);
});
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const matchIdDetails = `
    SELECT 
    player_details.player_id as playerId,
    player_details.player_name as playerName
    FROM 
    player_match_score NATURAL JOIN player_details
    WHERE 
        match_id = ${matchId};`;
  const matchIdArray = await database.all(matchIdDetails);
  response.send(matchIdArray);
});
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScored = `
  SELECT 
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(player_match_score.fours) AS totalFours,
    SUM(player_match_score.sixes) AS totalSixes
    FROM 
        player_details 
        INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
    WHERE player_match_score.player_id = ${playerId}
    GROUP BY playerId;`;
  const playerIdArray3 = await database.get(getPlayerScored);
  response.send(playerIdArray3);
});
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updateQueryDetails = `
  UPDATE 
     player_details
     SET 
      player_name = '${playerName}';
    WHERE 
    player_id = ${playerId};`;
  await database.run(updateQueryDetails);
  response.send("Player Details Updated");
});
module.exports = app;
