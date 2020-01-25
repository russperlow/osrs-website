const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');
const jsHandler = require('./jsResponses');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const handlePost = (request, response, parsedUrl) => {
    if(parsedUrl.pathname === '/addUser'){
        const body = [];

        request.on('error', (err) => {
            console.log(err);
            response.statusCode = 400;
            response.end();
        });
        request.on('data', (data) => {
            console.log('data: ' + data);
            body.push(data)
        });
        request.on('end', () => {
            const bodyString = Buffer.concat(body).toString();
            const bodyParams = query.parse(bodyString);
            console.log('bodystring: ' + bodyString);
            jsonHandler.addUser(request, response, bodyParams);
        })
    }else{
        console.log('else on post');
        console.log(parsedUrl);
    }
};

const handleHead = (request, response, parsedUrl) => {
    if(parsedUrl.pathname === '/getUsers'){
        jsonHandler.getUsers(request, response);
    }else{
        jsonHandler.notReal(request, response);
    }
};

const handleGet = (request, response, parsedUrl) => {
    switch(parsedUrl.pathname){
        case '/main.css':
            htmlHandler.getCSS(request, response);
            break;
        case '/ge.html':
            htmlHandler.getGe(request, response);
            break;
        case '/droprate.html':
            htmlHandler.getDroprate(request, response);
            break;
        case '/util.js':
            jsHandler.getUtil(request, response);
            break;
        case '/ge.js':
            jsHandler.getGe(request, response);
            break;
        case '/droprate.js':
            jsHandler.getDroprate(request, response);
            break;
        case '/autocompletelist.js':
            jsHandler.getAutocomplete(request, response)
            break;
        case '/item-keys.json':
            jsonHandler.getItemKeys(request, response);
            break;
        case '/tracker.html':
            htmlHandler.getTracker(request, response);
            break;
        case '/tracker.js':
            jsHandler.getTracker(request, response);
            break;
        case '/logo.jpg':
            htmlHandler.getLogo(request, response);
            break;
        default:
            htmlHandler.getIndex(request, response);
            break;
    }

    //     jsonHandler.getUsers(request, response);
};

const onRequest = (request, response) => {
    const parsedUrl = url.parse(request.url);

    if(request.method === 'POST'){
        handlePost(request, response, parsedUrl);
    }else if(request.method === 'HEAD'){
        handleHead(request, response, parsedUrl);
    }else{
        handleGet(request, response, parsedUrl);
    }
};

http.createServer(onRequest).listen(port);
console.log(`Listening on 127.0.0.1: ${port}`);