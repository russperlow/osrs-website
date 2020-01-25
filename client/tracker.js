const linesMargin = {
    left: 60,
    right: 20,
    between: 4,
    top: 20,
    bottom: 75
};

const w = window.innerWidth * 8 / 10, h = 800;

const makeChart = (dataset) => {
    const chart = d3.select('#chart')
        .attr('width', w)
        .attr('height', h);

    const yScale = d3.scaleLinear()
        .domain([0, 200000000])
        .range([h - linesMarign.bottom, linesMargin.top]);
    
    const xScale = d3.scaleLinear()
        .domain([0, 30])
        .range([linesMargin.left, w - linesMargin.right]);

    const line = d3.line()
        .x(d => xScale())
        .y(d => yScale());
    
    chart.append('path')
        .datum(dataset)
        .attr('class', 'line')
        .attr('d', line);   
    
}

const handleResponse = (xhr, parseResponse) => {
    debugger;
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

window.onload = function(){
    let optionsObj = {
        method: 'GET',
        name: 'OldMiami',
        boss: null,
        lookup: 'skill',
    };
    getPlayer(optionsObj);
}