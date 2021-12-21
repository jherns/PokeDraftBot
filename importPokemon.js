const csvtojson = require('csvtojson');
const mysql = require('mysql');

const importPokemon = (databaseCredentials) => {
  // Establish connection to the database
  let con = mysql.createConnection({
    host: databaseCredentials.hostName,
    user: databaseCredentials.username,
    password: databaseCredentials.password,
    database: databaseCredentials.database,
  });

  const insertMon = (insertStatement, items) => {
    if (items[0] !== '') {
      con.query(insertStatement, items, (err, results, fields) => {
        if (err) {
          // console.log('Unable to insert item at row ', i + 1);
          return console.log(err);
        }
      });
    }
  };

  con.connect((err) => {
    if (err) return console.error('error: ' + err.message);

    //con.query('DROP TABLE pokemon', () => {
    // Query to create table "sample"
    var createStatament =
      'CREATE TABLE IF NOT EXISTS pokemon (id SMALLINT NOT NULL AUTO_INCREMENT, name VARCHAR(255) NOT NULL, tier VARCHAR(255) NOT NULL, PRIMARY KEY (id))';

    // Creating table "sample"
    con.query(createStatament, (err, result) => {
      if (err) console.log('ERROR: ', err);
    });
    //});
  });

  // CSV file name
  const fileName = 'Season7Tiers.csv';

  csvtojson()
    .fromFile(fileName)
    .then((source) => {
      // Fetching the data from each row
      // and inserting to the table "sample"
      for (var i = 0; i < source.length; i++) {
        const ou1Mon = source[i]['OU1'];
        const ou2Mon = source[i]['OU2'];
        const uuMon = source[i]['UU'];
        const ruMon = source[i]['RU'];
        const nuMon = source[i]['NU'];
        const puMon = source[i]['PU'];
        var insertStatement = `INSERT INTO pokemon (name, tier) VALUES (?, ?)`;
        insertMon(insertStatement, [ou1Mon, 'OU1']);
        insertMon(insertStatement, [ou2Mon, 'OU2']);
        insertMon(insertStatement, [uuMon, 'UU']);
        insertMon(insertStatement, [ruMon, 'RU']);
        insertMon(insertStatement, [nuMon, 'NU']);
        insertMon(insertStatement, [puMon, 'PU']);
      }
      console.log('All items stored into database successfully');
    });
};

importPokemon({
  hostname: 'localhost',
  username: 'root',
  password: 'PokemonDatabase',
  database: 'pokemon',
});
