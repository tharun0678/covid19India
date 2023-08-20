const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");
let db = null;

const intializeAndConnectDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is running at http://localhost:3000`);
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};

intializeAndConnectDb();

function convertAllStatesObjectToArray(object) {
  return {
    stateId: object.state_id,
    stateName: object.state_name,
    population: object.population,
  };
}
//API-1 GET list of states
app.get("/states/", async (request, response) => {
  const getAllStates = `select * from state order by state_id;`;
  const states = await db.all(getAllStates);
  response.send(
    states.map((eachState) => {
      return convertAllStatesObjectToArray(eachState);
    })
  );
});

//API-2 GET STATE BY ID
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getState = `select * from state
    where state_id=${stateId}`;
  const state = await db.get(getState);
  const result = convertAllStatesObjectToArray(state);
  response.send(result);
});

//API-3 CREATE NEW DISTRICT IN DISTRICT TABLE
app.post("/districts/", async (request, response) => {
  const disrictDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = disrictDetails;
  const addNewDistrict = `insert into district(district_name,
    state_id,cases, cured, active, deaths) values (
        '${districtName}',
        ${stateId},
        ${cases},
        ${cured},
        ${active},
        ${deaths}
    );`;
  await db.run(addNewDistrict);
  response.send(`District Successfully Added`);
});

function covertDistrictToArray(object) {
  return {
    districtId: object.district_id,
    districtName: object.district_name,
    stateId: object.state_id,
    cases: object.cases,
    cured: object.cured,
    active: object.active,
    deaths: object.deaths,
  };
}

//API-4 GET DISTRCIT BY districtId
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrict = `
    select * from district where district_id=${districtId};`;

  const district = await db.get(getDistrict);
  const result = covertDistrictToArray(district);
  response.send(result);
});

//API - 5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const del = `Delete from district where district_id = ${districtId};`;

  await db.run(del);

  response.send(`District Removed`);
});

module.exports = app;
