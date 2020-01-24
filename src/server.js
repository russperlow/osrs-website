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
    if(parsedUrl.pathname === '/'){
        htmlHandler.getIndex(request, response);
    }else if(parsedUrl.pathname === '/main.css'){
        htmlHandler.getCSS(request, response)
    }else if(parsedUrl.pathname === '/getUsers'){
        jsonHandler.getUsers(request, response);
    }else if(parsedUrl.pathname === '/util.js'){
        jsHandler.getUtil(request, response)
    }else if(parsedUrl.pathname === '/ge.js'){
        jsHandler.getGe(request, response)
    }else if(parsedUrl.pathname === '/autocompletelist.js'){
        jsHandler.getAutocomplete(request, response)
    }else if(parsedUrl.pathname === '/item-keys.json'){
        jsonHandler.getItemKeys(request, response);
    }else{
        jsonHandler.notReal(request, response);
    }
};

const onRequest = (request, response) => {
    const parsedUrl = url.parse(request.url);
    //console.log(request);
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