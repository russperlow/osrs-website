const linesMargin = {
    left: 60,
    right: 20,
    between: 4,
    top: 20,
    bottom: 75
};

const colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
		  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
		  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
		  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
		  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
		  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
		  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
		  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
		  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
          '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];
let currentColor = 0;

const w = window.innerWidth * 8 / 10, h = 800;

const yScale = d3.scaleLinear()
.domain([25000000, 400000000])
.range([h - linesMargin.bottom, linesMargin.top]);

const xScale = d3.scaleLinear()
.domain([0, 30])
.range([linesMargin.left, w - linesMargin.right]);

let chart, legend;

const makeChart = () => {
    chart = d3.select('#chart')
        .attr('width', w)
        .attr('height', h);

    chart.append('g')
            .attr('transform', `translate(0, ${h - linesMargin.bottom})`)
            .call(d3.axisBottom(xScale));
    
    const formatValue = d3.format('.3s');

    chart.append('g')
        .attr('transform', `translate(${linesMargin.left},0)`)
        .attr('font-size', '14px')
        .call(d3.axisLeft(yScale).tickFormat(function(d){return formatValue(d)}));
    
    legend = chart.append('g');
    legend.append('rect')
        .attr('class', 'legend')
        .attr('x', '100')
        .attr('y', '15')
        .attr('rx', '10')
        .attr('width', '150')
        .attr('height', '100')
        .style('fill', 'rgba(150, 150, 150, .7');
}

const drawPath = (dataset, name) => {
    const line = d3.line()
    .x(d => xScale(d.interval))
    .y(d => yScale(d.totalxp));

    chart.append('path')
        .datum(dataset)
        .attr('class', 'line')
        .attr('d', line)
        .style('stroke', colorArray[currentColor]);
    
    legend.append('text')
        .attr('x', 140)
        .attr('y', 40 + (currentColor * 14))
        .attr('font-family', 'sans-serif')
        .attr('class', 'cc-member-name')
        .style('fill', colorArray[currentColor])
        .text(name);
}

let ccDataset = [];

const handleResponse = (xhr, parseResponse) => {
    let str = xhr.response;
    let split = str.split(':');
    let name = split[0];
    let arr = split[1].split(',');
    arr.pop();
    
    debugger;
    let dataset = [];

    for(let i = 0; i < arr.length; i++){
        dataset.push({'interval': i, 'totalxp': arr[i]});
    }

    ccDataset.push({name: dataset});
    drawPath(dataset, name);
    currentColor++;
}


const makeDataSet = (name, player) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', "/storetracker");
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onload = () => handleResponse(xhr, true);
    const data = `name=${name}&overall=${player[name].Overall}`;
    xhr.send(data);
}

const makeDataSetFromFile = (name, player) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', "/storetrackerread");
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onload = () => handleResponse(xhr, true);
    debugger;
    const data = `name=${name}&overall=${player[name].Overall}`;
    xhr.send(data);
}

let ccMembers = [
    'OldMiami',
    'Rut ger',
    'Mea Inferno'
    // 'Arc',
    // 'Xann Frank',
    // 'Pizza Gate',
    // 'Dark Truths',
    // 'Tantza',
    // 'Mouseyyy'
];
window.onload = function(){
    for(let i = 0; i < ccMembers.length; i++){
        let optionsObj = {
            method: 'GET',
            name: ccMembers[i],
            boss: null,
            lookup: 'file-read',
        };
        getPlayer(optionsObj);
    }

    makeChart();
}