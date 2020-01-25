const fs = require('fs');
const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const ge = fs.readFileSync(`${__dirname}/../client/ge.html`);
const droprate = fs.readFileSync(`${__dirname}/../client/droprate.html`);
const tracker = fs.readFileSync(`${__dirname}/../client/tracker.html`);
const css = fs.readFileSync(`${__dirname}/../client/main.css`);
const logo = fs.readFileSync(`${__dirname}/../client/logo.jpg`);
const getIndex = (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(index);
    response.end();
}

const getGe = (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(ge);
    response.end();
}

const getDroprate = (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(droprate);
    response.end();
}

const getTracker = (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(tracker);
    response.end();
}

const getCSS = (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/css'});
    response.write(css);
    response.end();
}

const getLogo = (request, response) => {
    response.writeHead(200, {'Content-Type': 'image/jpeg'});
    response.write(logo);
    response.end();
}

module.exports = {
    getIndex,
    getCSS,
    getGe,
    getDroprate,
    getTracker,
    getLogo,
};