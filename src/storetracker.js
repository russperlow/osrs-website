const fs = require('fs');

const writePlayerUpdate = (name, overall, response) => {
    debugger;
    let filePath = `./players/${name}.txt`;
    try{
        if(fs.existsSync(filePath)){
            fs.appendFile(filePath, `${overall},`, function(err){
                if(err) throw err;
                console.log(`${name} has been updated`);
            });
        }else{
            fs.appendFile(filePath, `${name}: ${overall},`, function(err){
                if(err) throw err;
                console.log(`${name} has been created`);
            });
        }
    }catch(err){
        fs.appendFile(filePath, `${name}: ${overall},`, function(err){
            if(err) throw err;
            console.log(`${name} has been created`);
        });
    }finally{

        fs.readFile(filePath, function(err, data){
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(data);
            response.end();
        });
    }
}

module.exports = {
    writePlayerUpdate,
}