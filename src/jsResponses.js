const fs = require('fs');
const util = fs.readFileSync(`${__dirname}/../client/util.js`);
const ge = fs.readFileSync(`${__dirname}/../client/ge.js`);
const autocomplete = fs.readFileSync(`${__dirname}/../client/autocompletelist.js`);

const getUtil = (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/javascript'});
    response.write(util);
    response.end();
}

const getGe = (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/javascript'});
    response.write(ge);
    response.end();
}

const getAutocomplete = (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/javascript'});
    response.write(autocomplete);
    response.end();
}

module.exports = {
    getUtil,
    getGe,
    getAutocomplete,
}