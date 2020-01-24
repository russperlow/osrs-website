// const makeItemKeysPretty = (data) => {
//   // const myarr = []

//   // debugger;
//   // Object.keys(data).forEach(function(key){
//   //   myarr.push(key);
//   // });
//   // console.log(JSON.stringify(myarr));
//   // const items = {};
//   // Object.keys(data).forEach(function(key){
//   //   items[data[key].name] = data[key].id;
//   // });
//   // console.log(JSON.stringify(items));
// }


// Load in the tbow as the first graph by default
// d3.json("data.json").then(function(data) {
//   itemdata = data;
//   let item = data[20997];
//   const daily = formatDailyData(item);
//   const average = formatAverageData(item);
//   makeGraph(daily, average);
	
// });


// Load in the item - id key value pairs so we can map the auto complete text to an id for calling the GE api
const updateItemInfo = (htmlId, itemInfo, prefix = '', color = 'black') => {
    let element = document.getElementById(htmlId);
    element.innerText = prefix + itemInfo;
    element.style.color = color;
}

// Adds a class to the given element by id
const addClassToElement = (elementId, className) => {
    document.getElementById(elementId).classList.add(className);
}

// Removes a class from the given element by id
const removeClassFromElement = (elementId, className) => {
    document.getElementById(elementId).classList.remove(className);
}

// Enables a button given by id
const enableBtn = (btnId) => {
    document.getElementById(btnId).disabled = false;
}

// Disables a button given by id
const disableBtn = (btnId) => {
    document.getElementById(btnId).disabled = true;
}

// Color scale for 30, 90 and 180 day trends red for 100% negative yellow for 0 green for 100% positive
const trendColorScale = d3.scaleLinear()
    .domain([-100, 0, 100])
    .range(['red', '#ffff7f', 'limegreen']);

// Given a percent, parses and returns the appropriate color
const getTrendColor = (trend) => {
    return trendColorScale(parseFloat(trend.split('%')));
}
  
// Update D3 format to be B instead of G for Billion
fcopy = d3.format;
function myFormat(){ 
        function_ret = fcopy.apply(d3, arguments) 
        return (function(args){return function (){ 
                return args.apply(d3, arguments).replace(/G/, "B");
        }})(function_ret) 
} 
d3.format = myFormat;

// List of the order player info is returned from the api hiscores
let playerInfo = [
    'Overall',
    'Attack',
    'Defence',
    'Strength',
    'Hitpoints',
    'Ranged',
    'Prayer',
    'Magic',
    'Cooking',
    'Woodcutting',
    'Fletching',
    'Fishing',
    'Firemaking',
    'Crafting',
    'Smithing',
    'Mining',
    'Herblore',
    'Agility',
    'Theiving',
    'Slayer',
    'Farming',
    'Runecraft',
    'Hunter',
    'Construction',
    'null', // Couldnt find what it is. not a skill, not total, maybe reserved for twisted league?
    'Bounty Hunter - Hunter',
    'Bounty Hunter - Rogue',
    'All Clues',
    'Beginner Clues',
    'Easy Clues',
    'Medium Clues',
    'Hard Clues',
    'Elite Clues',
    'Master Clues',
    'LMS',
    'Abyssal Sire',
    'Alchemical Hydra',
    'Barrows Chests',
    'Bryophyta',
    //'Callisto', // For some reason this boss isnt returned by hiscores
    //'Cerberus', // Also for some reason this boss isnt returned by hiscores
    'Chambers of Xeric',
    'Chambers of Xeric: Challenge Mode',
    'Chaos Elemental',
    'Chaos Fanatic',
    'Commander Zilyana',
    'Corporeal Beast',
    'Crazy Archaeologist',
    'Dagannoth Prime',
    'Dagannoth Rex',
    'Dagannoth Supreme',
    'Deranged Archaeologist',
    'General Graardor',
    'Giant Mole',
    'Grotesque Guardians',
    'Hespori',
    'Kalphite Queen',
    'King Black Dragon',
    'Kraken',
    'Kree\'Arra',
    'K\'ril Tsutsaroth',
    'Mimic',
    'Obor',
    'Sarachnis',
    'Scorpia',
    'Skotizo',
    'The Guantlet',
    'The Corrupted Gauntlet',
    'Theater of Blood',
    'Thermonuclear Smoke Devil',
    'TzKal-Zuk',
    'TzTok-Jad',
    'Venenatis',
    'Vet\'ion',
    'Vorkath',
    'Wintertodt',
    'Zalcano',
    'Zulrah',
];

// Hard coded pet rates from boss to their base drop number. Nothing for these bosses changes so its all static
const petRates = {
    'Abyssal Sire': 2560,
    'Alchemical Hydra': 3000,
    'Callisto': 2000,
    'Cerberus': 3000,
    'Chambers of Xeric': 53,
    'Chambers of Xeric: Challenge Mode': 53,
    'Chaos Elemental': 300,
    'Chaos Fanatic': 1000,
    'Commander Zilyana': 5000,
    'Corporeal Beast': 5000,
    'Dagannoth Prime': 5000,
    'Dagannoth Rex': 5000,
    'Dagannoth Supreme': 5000,
    'General Graardor': 5000,
    'Giant Mole': 3000,
    'Grotesque Guardians': 3000,
    'Hespori': 5375,
    'Kalphite Queen': 3000,
    'King Black Dragon': 3000,
    'Kraken': 3000,
    'Kree\'Arra': 5000,
    'K\'ril Tsutsaroth': 5000,
    'Mimic': 1000,
    'Sarachnis': 3000,
    'Scorpia': 2000,
    'Skotizo': 65,
    'The Guantlet': 2000,
    'The Corrupted Gauntlet': 800,
    'Theater of Blood': 650,
    'Thermonuclear Smoke Devil': 3000,
    'TzKal-Zuk': 100,
    'TzTok-Jad': 200,
    'Venenatis': 2000,
    'Vet\'ion': 2000,
    'Vorkath': 3000,
    'Wintertodt': 5000,
    'Zalcano': 3000,
    'Zulrah': 4000,
}

// Display the loading wheel on the current html page
const showLoadingWheel = () => {
    document.getElementById('lds-roller-id').style.display = 'block';
}

// Hide the loading wheel on the current html page
const hideLoadingWheel = () => {
    document.getElementById('lds-roller-id').style.display = 'none';
}

const cors_api_url = 'https://cors-anywhere-osrs.herokuapp.com/';
const player_url = 'http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=';
let player = {};

// Get the player for the given name
function getPlayer(options){

    // If the current player has already been pulled, no need to pull again. Save an API call
    if(player[options.name]){
        makeDataSet(player[options.name][options.boss], 1, petRates[options.boss]);
        return;
    }

    // Display loading wheel until we have results
    showLoadingWheel();

    let x = new XMLHttpRequest();
    x.open(options.method, cors_api_url + player_url + options.name);
    x.onload = x.onerror = function(){

        let responseArr = x.responseText.split(/(?:\r\n|\n|\r)/g);// Split response text on new lines or returns, we just get numbers in commas by new lines, very ugly
        responseArr.pop(); // Pop the last one since there is a training new line character with no following informatino

        // Loop through the array and create the player object Skill/Clue/Boss: level/count
        for(let i = 0; i < responseArr.length; i++){
            let splitArrItem = responseArr[i].split(',');
            if(splitArrItem.length > 2){
                responseArr[i] = `"${playerInfo[i]}": ${splitArrItem[2]}`;
            }else{
                let kc = parseInt(splitArrItem[1]) < 0 ? 0 : splitArrItem[1];
                responseArr[i] = `"${playerInfo[i]}": "${splitArrItem[1]}"`;
            }
        }

        // Add the players name the the array creating the player object
        let responseStr = `{"${options.name}":{${responseArr.toString()}}}`;
        player = JSON.parse(responseStr);
        
        makeDataSet(player[options.name][options.boss], 1, petRates[options.boss]);

        // We've made our chart no need to show loading anymore
        hideLoadingWheel();

    }
    if (/^POST/i.test(options.method)) {
        x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    x.send(options.data);
}


// Format the daily data we retrieve from the api into d3 readable information
const formatDailyData = (data) => {
    const daily = [];
  
    Object.keys(data.daily).forEach(function(key){
      let formattedDate = new Date(parseInt(key));
          formattedDate = `${formattedDate.getUTCFullYear()}-${formattedDate.getUTCMonth()+1}-${formattedDate.getUTCDate()}`;
      let value = data.daily[key];
      daily.push({date: parseDate(formattedDate), value: value});
    });
  
    return daily;
  }

  // Format the average data we retrieve from the api into d3 readable information
  const formatAverageData = (data) => {
    const average = [];
  
    Object.keys(data.average).forEach(function(key){
      let formattedDate = new Date(parseInt(key));
          formattedDate = `${formattedDate.getUTCFullYear()}-${formattedDate.getUTCMonth()+1}-${formattedDate.getUTCDate()}`;
      let value = data.average[key];
      average.push({date: parseDate(formattedDate), value: value});
    });
    
    return average;
  }