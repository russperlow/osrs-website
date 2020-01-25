const linesMargin = {
    left: 60,
    right: 20,
    between: 4,
    top: 20,
    bottom: 75
};
const w = window.innerWidth * 8 / 10, h = 800, yourKcColor = 'limegreen';
let doubleKills;

const makeChart = (dataset, currentKc) => {

    const chart = d3.select('#chart')
        .attr('width', w)
        .attr('height', h);

    chart.selectAll('*').remove();

    const yScale = d3.scaleLinear()
        .domain([d3.min(dataset, d => d.chance), d3.max(dataset, d => d.chance)])
        .range([h - linesMargin.bottom, linesMargin.top]);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => d.kc)])
        .range([linesMargin.left, w - linesMargin.right]);

    const line = d3.line()
        .x(d => xScale(d.kc))
        .y(d => yScale(d.chance));

    chart.append('path')
        .datum(dataset)
        .attr('class', 'line')
        .attr('d', line);

    // We use this fitlered dataset to not have thousands of dots and ticks
    let datasetfiltered = dataset.filter(function(d){return d.skipVal == 1});

    chart.selectAll('.dot')
        .data(datasetfiltered)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.kc))
        .attr('cy', d => yScale(d.chance))
        .attr('r', 4)
        .style('fill', function(d){return d.kc == currentKc ? yourKcColor : 'red'});

    chart.append('g')
        .attr('transform', `translate(0, ${h - linesMargin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(1000/datasetfiltered.length).tickFormat(d3.format('d')))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('class', 'dr-tick')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-90)');

    let formatPercent = d3.format(".0%");

    chart.append('g')
        .attr('transform', `translate(${linesMargin.left}, 0)`)
        .attr('font-size', '14px')
        .call(d3.axisLeft(yScale).tickFormat(formatPercent));

    dashedLines(chart, datasetfiltered, xScale, yScale);

    makeLegend(chart);
}

// Make the legend to clarify red vs green dot
const makeLegend = (chart) => {
  let legend = chart.append('g');
  legend.append('rect')
    .attr('class', 'legend')
    .attr('x', '100')
    .attr('y', '15')
    .attr('rx', '10')
    .attr('width', '150')
    .attr('height', '100')
    .style('fill', 'rgba(150, 150, 150, .7');

  legend.append('text')
    .attr('x', '140')
    .attr('y', '40')
    .attr('font-family', 'sans-serif')
    .attr('class', 'legend-title')
    .text('Legend');

  legend.append('circle')
    .attr('cx', '145')
    .attr('cy', '65')
    .attr('r', '4')
    .style('fill', 'red');

  legend.append('text')
    .attr('x', '155')
    .attr('y', '70')
    .attr('font-family', 'sans-serif')
    .attr('font-size', '14px')
    .text('Interval KC');

  legend.append('circle')
    .attr('cx', '145')
    .attr('cy', '90')
    .attr('r', '4')
    .style('fill', yourKcColor);

  legend.append('text')
    .attr('x', '155')
    .attr('y', '97')
    .attr('font-family', 'sans-serif')
    .attr('font-size', '14px')
    .text('Your KC');
}

const dashedLines = (chart, dataset, xScale, yScale) => {
  
    const focus = chart.append('g').style('display', 'none');
    
    focus.append('line')
      .attr('id', 'focusLineX')
      .attr('class', 'focusLine');
    focus.append('line')
      .attr('id', 'focusLineY')
      .attr('class', 'focusLine');
  
    const bisectKc = d3.bisector(function(d) {return d.kc;}).left;
    var xDomain = d3.extent(dataset, function(d) { return d.kc; })
    var yDomain = d3.extent(dataset, function(d) { return d.chance; });
    chart.append('rect')
      .attr('class', 'overlay-dashed')
      .attr('width', w)
      .attr('height', h)
      .on('mouseover', function() { focus.style('display', null); d3.select('#tooltip').classed('hidden', false);})
      .on('mouseout', function() { focus.style('display', 'none'); d3.select("#tooltip").classed("hidden", true); })
      .on('mousemove', function() { 
          var mouse = d3.mouse(this);
          var mouseDate = xScale.invert(mouse[0]);
          var i = bisectKc(dataset, mouseDate); // returns the index to the current data item
  
          var d0 = i == 0 ? dataset[i] : dataset[i - 1];
          var d1 = i == dataset.length ? dataset[i-1] : dataset[i];
  
          var d = mouseDate - d0.kc > d1.kc - mouseDate ? d1 : d0;
  
          var x = xScale(d.kc);
          var y = yScale(d.chance);
  
          focus.select('#focusCircle')
              .attr('cx', x)
              .attr('cy', y);
          focus.select('#focusLineX')
              .attr('x1', x).attr('y1', yScale(yDomain[0]))
              .attr('x2', x).attr('y2', yScale(yDomain[1]));
          focus.select('#focusLineY')
              .attr('x1', xScale(xDomain[0])).attr('y1', y)
              .attr('x2', xScale(xDomain[1])).attr('y2', y);
              
          d3.select('#tooltip')
              .style('left', `${x-85}px`)
              .style('top', `${y+75}px`)
              .select('#killcount')
              .text(d.kc);
          d3.select('#tooltip')
              .select('#probability')
              .text(`${Math.floor(d.chance * 100)}%`);
      });
  }

// We build the data set based on binomial calculations
const makeDataSet = (currentKc, drTop, drBot) => {
    const dataset = [];

    // Double kills is either double the drop rate or double the current kc, whichever is higher 
    doubleKills = Math.max(drBot, currentKc) * 2;

    // Loop through the double kills value making proper data for lines
    for(let i = 0; i < doubleKills; i++){
        let show = i % Math.round(doubleKills / 50) == 0 ? 1 : 0;

        let chance = calcDropRate(i, drTop, drBot);

        // If i is the current kill count we display to the user their percent chance in text and make sure it is shown on the graph
        if(i == currentKc){
            show = 1;
            let chanceFormatted = `${Math.floor(chance * 100)}%`
            document.getElementById('output').textContent = `Your chance of getting the drop so far is ${chanceFormatted}`;
            document.getElementById('quip').textContent = getDropRateQuip(chance);
        }

        dataset.push({
            'kc': i,
            'chance': chance,
            'skipVal': show
        });
    }
    
    // Once we have all our data we make the graph
    makeChart(dataset, currentKc);
}

// Binomial formula returning a percent
const calcDropRate = (kills, drTop, drBot) => {
    let dropRate = 1 - (drTop/drBot);
    let pow = Math.pow(dropRate, kills);
    let chance = 1 - pow;
    
    return chance;
}

// On submit button for manual calulation we just calculate and draw the graph
document.getElementById('submit-btn-general').addEventListener('click', function(e){
    e.preventDefault();
    let kills = parseInt(document.getElementById('kill-input').value);
    let drTop = parseInt(document.getElementById('drop-nume-input').value);
    let drBot = parseInt(document.getElementById('drop-denom-input').value);
    makeDataSet(kills, drTop, drBot);
    
});

// On submit button for look up we need to call the api to get the players kill count
document.getElementById('look-up-btn').addEventListener('click', function(e){
    e.preventDefault();
    let boss = document.getElementById('boss-select');
    let optionsObj = {
        method: 'GET',
        name: document.getElementById('player-name').value,
        boss: boss.options[boss.selectedIndex].value,
        lookup: 'boss',
    };
    getPlayer(optionsObj);
});

// On checkbox slider we change from manual to api look up or visa versa
document.getElementById('checkbox-slider').addEventListener('click', function(e){
    if(e.target.checked){
        addClassToElement('general-graph', 'hidden');
        removeClassFromElement('player-boss-lookup', 'hidden');
        enableBtn('look-up-btn');
        disableBtn('submit-btn-general');
    }else{
        addClassToElement('player-boss-lookup', 'hidden');
        removeClassFromElement('general-graph', 'hidden');
        enableBtn('submit-btn-general');
        disableBtn('look-up-btn');
    }
});

window.onload = function(){
    let select = document.getElementById('boss-select');
    Object.keys(petRates).forEach(function(key){
        let element = document.createElement('option');
        element.text = element.value = key;
        select.appendChild(element);
    });

    document.getElementById('submit-btn-general').click();

}

// List of fun text to display to the user based on their drop rate
const dropRateQuips = [
    'Did you really think you\'d have it by now?',
    'Not even 1/10th the way there. Keep grinding',
    'Keep going, it\'s a long grind',
    '1/4th of the way there! (hopefully)',
    'At least its not runecrafting',
    '92 is half of 99',
    'Bad RNG',
    'You are still grinding?',
    'How bad do you want it?',
    'You can almost feel it!',
    'The grind is almost over. Any time now!',
    'Probability is a bitch. You should have it by now.'

]

// Returns a quip from dropRateQuips depending on the users percentage
const getDropRateQuip = (percentage) => {
    if(percentage < 5){
        return dropRateQuips[0]
    }else if(percentage < 10){
        return dropRateQuips[1];
    }else if(percentage < 15){
        return dropRateQuips[2]
    }else if(percentage < 30){
        return dropRateQuips[3]
    }else if(percentage < 49){
        return dropRateQuips[4]
    }else if(percentage < 51){
        return dropRateQuips[5]
    }else if(percentage < 66){
        return dropRateQuips[6]
    }else if(percentage < 75){
        return dropRateQuips[7]
    }else if(percentage < 90){
        return dropRateQuips[8]
    }else if(percentage < 97){
        return dropRateQuips[9]
    }else if(percentage < 98){
        return dropRateQuips[10]
    }else{
        return dropRateQuips[11]
    }
}