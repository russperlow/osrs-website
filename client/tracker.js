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

