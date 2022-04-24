const csvtojson = require('csvtojson');
const fs = require('fs');

const importPokemon = (databaseCredentials) => {
  // CSV file name
  const fileName = 'PokemonTiers.csv';
  let writer = fs.createWriteStream('createPokemon.sql') ;
  writer.write('INSERT INTO pokemon (id, name, tier) VALUES ');
  let id = 0;
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
        if (ou1Mon) {
        writer.write(`(${id++},${ou1Mon},'OU1'),`);
        }
        if (ou2Mon) {
        writer.write(`(${id++},${ou2Mon},'OU2'),`);
        }
        if (uuMon) {
        writer.write(`(${id++},${uuMon},'UU'),`);
        }
        if (ruMon) {
        writer.write(`(${id++},${ruMon},'RU'),`);
        }
        if (nuMon) {
        writer.write(`(${id++},${nuMon},'NU'),`);
        }
        if (puMon) {
        writer.write(`(${id++},${puMon},'PU')${i === (source.length - 1) ? ';' : ','}\n`);
        }
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
