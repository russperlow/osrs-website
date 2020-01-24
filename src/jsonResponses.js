const users = {}; // Stored in memory, cleared when heroku shuts down or local node is shut down
const fs = require('fs');
const itemkeys = fs.readFileSync(`${__dirname}/../client/item-keys.json`);

const respondJSON = (request, response, status, object) => {
    response.writeHead(status, {'Content-Type': 'application/json'});
    response.write(JSON.stringify(object));
    response.end();
} ;

const respondJSONMeta = (request, response, status) => {
    response.writeHead(status, {'Content-Type': 'application/json'});
    response.end();
};

const getUsers = (request, response) => {
    if(request.method === 'GET'){
        const responseJSON = {
            users,
        }
        respondJSON(request, response, 200, responseJSON);
    }else{
        respondJSONMeta(request, response, 200);  
    }
};

const addUser = (request, response, body) => {
    const responseJSON = {
        message: 'Name and age are both required',
    };

    if(!body.name || !body.age){
        console.log('missing params');
        responseJSON.id = 'missingParams';
        return respondJSONMeta(request, response, 400, responseJSON);
    }

    let responseCode = 201;

    if(users[body.name]){
        responseCode = 204;
    }else{
        users[body.name] = {};
    }

    users[body.name].name = body.name;
    users[body.name].age = body.age;

    if(responseCode === 201){
        responseJSON.message = 'Created Successfully!';
        return respondJSON(request, response, responseCode, responseJSON);
    }
    return respondJSONMeta(request, response, responseCode);
};

const notReal = (request, response) => {
    if(request.method === 'GET'){
        const responseJSON = {
            id: 'notFound',
            message: 'The page you are looking for was not found',
        };

        respondJSON(request, response, 404, responseJSON);

    }else{
        respondJSONMeta(request,response, 404);
    }
};

const getItemKeys = (request, response) => {
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.write(itemkeys);
    response.end();
}

module.exports = {
    getUsers,
    addUser,
    notReal,
    getItemKeys
};