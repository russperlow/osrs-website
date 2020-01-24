import * as d3 from 'd3'

const parseDate = d3.timeParse('%Y-%m-%d');
const key = d => d.date;

const linesMargin = {
  left: 60,
  right: 20,
  between: 4,
  top: 60,
  bottom: 25
};

const linesMargin2 = {
  left: 60,
  right: 20,
  between: 4,
  top: 600,
  bottom: 50
}

const w = window.innerWidth * 6 / 10, h = 800, h2 = h - linesMargin2.top - (linesMargin2.bottom * 3);

// Variables decalred outside makeGraph to be used in brushed
let chart, yScale, xScale, yScale2, xScale2, xAxis, line, context, brush;

// Init item we have hard coded to start with
const startingItemId = 1079, startingItemVal = 'Rune platelegs';
let currentItem = startingItemVal; // Will store the current item for us to use for calcing alch values

// Make a graph for the given data (dataset - day to day prices) (average - trend of item)
const makeGraph = (dataset, average) => {

  chart = d3.select('#chart')
                .attr('width', w)
                .attr('height', h + h2 + (linesMargin2.bottom * 5/3));

  // Clear the chart, we are not currently using transitions
  chart.selectAll('*').remove();

  // Create a clipping path around the margins
  chart.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr('x', linesMargin.left)
    .attr('y', 0)
    .attr("width", w - linesMargin.left - linesMargin.right)
    .attr("height", h - linesMargin.bottom);

  // Y scale for main graph
  yScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d.value), d3.max(dataset, d => d.value)])
    .range([h - linesMargin.bottom, linesMargin.top]);
  
  // X scale for main graph
  xScale = d3.scaleTime()
    .domain(d3.extent(dataset, d => d.date))
    .range([linesMargin.left, w - linesMargin.right]);

  // X scale for brush area chart
  xScale2 = d3.scaleTime()
    .domain(d3.extent(dataset, d => d.date))
    .range([linesMargin.left, w - linesMargin.right]);
  
  // Y scale for brush area chart
  yScale2 = d3.scaleLinear()
    .domain([d3.min(dataset, d => d.value), d3.max(dataset, d => d.value)])
    .range([h2, 0]);

  // Line for the main line and data average
  line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value));
  
  // Create and save the average path for us to use in the animation
  const averagePath = chart.append('path')
    .datum(average)
    .attr('class', 'line-average')
    .attr('clip-path', 'url(#clip)')
    .attr('d', line);

  // Draw the main line
  chart.append('path')
    .datum(dataset)
    .attr('class', 'line')
    .attr('clip-path', 'url(#clip)')
    .attr('d', line);
  
  // Place orange nodes at each day on the line
  chart.selectAll('.dot')
    .data(dataset, key)
    .enter()
    .append('circle')
    .attr('class', 'dot')    
    .attr('clip-path', 'url(#clip)')
    .attr('cx', d => xScale(d.date))
    .attr('cy', d => yScale(d.value))
    .attr('r', 0)
    .transition()
    .delay(function(d, i){return i * 10})
    .attr('r', 3.5)
    .style('fill', 'orange');

  // Init xAxis, save for brushed
  xAxis = d3.axisBottom(xScale).ticks(dataset.length/30);
  
  // Draw x axis
  chart.append('g')
    .attr('transform', `translate(0, ${h - linesMargin.bottom})`)
    .attr('class', 'axis--x')
    .call(xAxis);

  // Format the y axis to be 3 digits with K, M, B (thousands, millions, billions)
  const formatValue = d3.format(".3s");

  // Draw y axis
  chart.append('g')
    .attr('transform', `translate(${linesMargin.left}, 0)`)
    .attr('font-size', '14px')
    .call(d3.axisLeft(yScale).tickFormat(function(d){return formatValue(d)}));

  // Create the brush area & the brush
  let brushArea = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d){return xScale2(d.date);})
    .y0(h2)
    .y1(function(d){return yScale2(d.value);});
  
  brush = d3.brushX()
    .extent([[linesMargin2.left,0], [w - linesMargin.right, h2]])
    .on('brush end', brushed);

  // Create a new g of context to hold our brush elements
  context = chart.append("g")
    .attr("class", "context")
    .attr('height', h2)
    .attr("transform", "translate(" + 0 + "," + (h + linesMargin2.bottom) + ")");

  // Add the area graph to context
  context.append('path')
    .datum(dataset)
    .attr('class', 'area')
    .attr('d', brushArea);

  // Add the brush to context
  context.append("g")
    .attr("class", "brush")
    .attr('width', w - linesMargin.right)
    .call(brush);
  
  let xAxis2 = d3.axisBottom(xScale2).ticks(dataset.length/30);
  context.append('g')
    .attr('transform', `translate(0, ${h2})`)
    .attr('class', 'axis--x2')
    .call(xAxis2);

  // Call the dashed lines method to init crosshairs. We do this here so it lays over everything
  dashedLines(chart, dataset, xScale, yScale);

  // Dash animation learned from https://www.visualcinnamon.com/2016/01/animating-dashed-line-d3.html
  const averagePathLength = averagePath.node().getTotalLength();
  const dashing = '6, 6';
  const dashLength = dashing.split(/[\s,]/)
    .map(a => parseFloat(a) || 0)
    .reduce((a, b) => a + b);

  let dashCount = Math.ceil(averagePathLength / dashLength);
  let newDashes = new Array(dashCount).join(dashing + ' ');
  let dashArray = `${newDashes} 0, ${averagePathLength}`;

  // Draw the average line as an animation
  averagePath.attr('stroke-dashoffset', averagePathLength)
    .attr('stroke-dasharray', dashArray)
    .transition().duration(3000).ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0)
    .transition().duration(1) // Second transition instantly to remove the averagePathLength from array. If not, it will not always appear on brush/zoom
    .attr('stroke-dasharray', `${newDashes}, 0`);

  makeLegend();
}

// Makes the legend for the dots and trend line
const makeLegend = () => {
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
    .style('fill', 'orange');

  legend.append('text')
    .attr('x', '155')
    .attr('y', '70')
    .attr('font-family', 'sans-serif')
    .attr('font-size', '14px')
    .text('Date');

  legend.append('rect')
    .attr('x', '140')
    .attr('y', '90')
    .attr('width', '8')
    .attr('height', '4')
    .style('fill', 'red');

  legend.append('text')
    .attr('x', '155')
    .attr('y', '97')
    .attr('font-family', 'sans-serif')
    .attr('font-size', '14px')
    .text('Trend');
}

// Moves the main graph based on the brushing on the bottom graph
const brushed = () => {
  if(d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;

  let s = d3.event.selection || xScale2.range();
  xScale.domain(s.map(xScale2.invert, xScale2));
  chart.select('.line').attr('d', line);
  chart.select('.line-average').attr('d', line);
  chart.selectAll('.dot').attr('cx', d =>  xScale(d.date));
  chart.select('.axis--x').call(xAxis);

}

// http://bl.ocks.org/mikehadlow/93b471e569e31af07cd3
const dashedLines = (chart, dataset, xScale, yScale) => {
  
  const focus = chart.append('g').style('display', 'none');
  
  // X and Y crosshair lines clipped to always be in the graph
  focus.append('line')
    .attr('id', 'focusLineX')
    .attr('class', 'focusLine')
    .attr('clip-path', 'url(#clip)');
  focus.append('line')
    .attr('id', 'focusLineY')
    .attr('class', 'focusLine')
    .attr('clip-path', 'url(#clip)');

  const bisectDate = d3.bisector(function(d) {return d.date;}).left;
  chart.append('rect')
    .attr('class', 'overlay-dashed')
    .attr('x', linesMargin.left)
    .attr('width', w - linesMargin.left - linesMargin.right)
    .attr('height', h)
    .on('mouseover', function() { focus.style('display', null); d3.select('#tooltip').classed('hidden', false);})
    .on('mouseout', function() { focus.style('display', 'none'); d3.select("#tooltip").classed("hidden", true); })
    .on('mousemove', function() { 
        var mouse = d3.mouse(this);
        var mouseDate = xScale.invert(mouse[0]);
        var i = bisectDate(dataset, mouseDate); // returns the index to the current data item


        var d0 = i == 0 ? dataset[i] : dataset[i - 1];
        var d1 = i == dataset.length ? dataset[i-1] : dataset[i];

        // work out which date value is closest to the mouse
        var d = mouseDate - d0.date > d1.date - mouseDate ? d1 : d0;
        var x = xScale(d.date);
        var y = yScale(d.value);

        // Update the domains every time in case we are brushed and zoomed
        var xDomain = xScale.domain();
        var yDomain = yScale.domain();

        focus.select('#focusCircle')
            .attr('cx', x)
            .attr('cy', y);
        focus.select('#focusLineX')
            .attr('x1', x).attr('y1', yScale(yDomain[0]))
            .attr('x2', x).attr('y2', yScale(yDomain[1]));
        focus.select('#focusLineY')
            .attr('x1', xScale(xDomain[0])).attr('y1', y)
            .attr('x2', xScale(xDomain[1])).attr('y2', y);
            
        // Reformat the date to be more human readable
        const format = d3.format(',');
        let formattedDate = new Date(d.date);
        formattedDate = `${formattedDate.getUTCMonth()+1}/${formattedDate.getUTCDate()}/${formattedDate.getUTCFullYear()}`;

        d3.select('#tooltip')
            .style('left', `${x-85}px`)
            .style('top', `${y+75}px`)
            .select('#price')
            .text(format(d.value));
        d3.select('#tooltip')
            .select('#date')
            .text(formattedDate);
    });
}

// Request send through my own cors anywhere to avoid cors issues
function doCORSRequest(options) {

  // Show the loading wheel while we pull info
  showLoadingWheel();

  var x = new XMLHttpRequest();
  x.open(options.method, cors_api_url + options.url);
  x.onload = x.onerror = function() {
    let response = JSON.parse(x.responseText);

    // If it is a GE type we make graphs, if not we make the info box on the side
    if(options.type === 'GE'){

      // Clean the datasets for daily and average paths then draw graph
      let daily = formatDailyData(response);
      let average = formatAverageData(response);
      makeGraph(daily, average);

      // Color coding and display for high and low alch values
      let haColor = itemkeys[currentItem].high_alch > daily[daily.length-1].value ? 'limegreen' : 'red';
      let laColor = itemkeys[currentItem].low_alch > daily[daily.length-1].value ? 'limegreen' : 'red';
      updateItemInfo('high-alch', itemkeys[currentItem].high_alch, '', haColor);
      updateItemInfo('low-alch', itemkeys[currentItem].low_alch, '', laColor);
      
      // We are doing loading, hide the wheel
      hideLoadingWheel();

    }else if(options.type === 'INFO'){

      let item = response.item;

      // Show the item image
      let image = document.getElementById('item-img');
      image.src = item.icon_large;    
      
      currentItem = item.name;

      // Edit HTML to display new item info
      updateItemInfo('item-name', item.name);
      updateItemInfo('description', item.description, 'Description: ')
      updateItemInfo('current-price', item.current.price, 'Current Price: ');
      updateItemInfo('trend-30', item.day30.change, '', getTrendColor(item.day30.change));
      updateItemInfo('trend-90', item.day90.change, '', getTrendColor(item.day90.change));
      updateItemInfo('trend-180', item.day180.change, '', getTrendColor(item.day180.change));
    }

  };
  if (/^POST/i.test(options.method)) {
    x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  }
  x.send(options.data);
}

let itemkeys; // item name to id for mapping once we connect to api
let itemdata; // will be removed, placeholder for data objects before we've got the api working

// When a new item is selected we make 2 api calls. One for GE graph data and one for item info panel
const itemUpdate = (id = startingItemId, val = startingItemVal) => {

  doCORSRequest({
    method: 'GET',
    url: `https://services.runescape.com/m=itemdb_oldschool/api/graph/${id}.json`,
    type: 'GE'
  });

  doCORSRequest({
    method: 'GET',
    url: `https://services.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=${id}`,
    type: 'INFO'
  })

}

// On submit, we change the graph
document.getElementById('submit-btn').addEventListener('click', function(e){
  e.preventDefault();

  let val = document.getElementById('itemInput').value;
  let id = itemkeys[val].id;

  itemUpdate(id, val);
});

d3.json('item-keys.json').then(function(data){
  //makeItemKeysPretty(data);
  itemkeys = data;
  itemUpdate();
});
