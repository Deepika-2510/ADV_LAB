// Load the data
d3.csv('forest_cover_data.csv').then(function(data) {
    // Helper function to format the data
    function formatData(data) {
      return data.map(d => ({
        country: d.country,
        subnational1: d.subnational1,
        threshold: +d.threshold,
        area_ha: +d.area_ha,
        extent_2000_ha: +d.extent_2000_ha,
        extent_2010_ha: +d.extent_2010_ha,
        gain_2000_2020_ha: +d.gain_2000-2020_ha,
        tc_loss_by_year: Object.keys(d)
          .filter(key => key.startsWith('tc_loss_ha_'))
          .map(key => ({
            year: +key.split('_')[3],
            loss_ha: +d[key]
          }))
      }));
    }
  
    const formattedData = formatData(data);
  
    // Bar Chart
    function createBarChart(data) {
      const width = 800;
      const height = 600;
      const margin = { top: 20, right: 20, bottom: 60, left: 80 };
  
      const svg = d3.select('#bar-chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
  
      const x = d3.scaleBand()
        .range([margin.left, width - margin.right])
        .padding(0.1);
      const y = d3.scaleLinear()
        .range([height - margin.bottom, margin.top]);
  
      x.domain(data.map(d => d.country));
      y.domain([0, d3.max(data, d => d.area_ha)]);
  
      svg.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.country))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d.area_ha))
        .attr('height', d => y(0) - y(d.area_ha));
  
      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));
  
      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
  
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .style('text-anchor', 'middle')
        .text('Country');
  
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 10)
        .attr('x', -height / 2)
        .style('text-anchor', 'middle')
        .text('Forest Area (ha)');
  
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .style('text-anchor', 'middle')
        .text('Total Forest Area by Country');
    }
  
    // Pie Chart
    function createPieChart(data) {
      const width = 600;
      const height = 600;
      const radius = Math.min(width, height) / 2 - 40;
  
      const svg = d3.select('#pie-chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);
  
      const pie = d3.pie()
        .value(d => d.area_ha);
  
      const arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(0);
  
      const pieData = data
        .sort((a, b) => b.area_ha - a.area_ha)
        .slice(0, 10);
  
      const slices = svg.selectAll('.slice')
        .data(pie(pieData))
        .enter()
        .append('g')
        .attr('class', 'slice');
  
      slices.append('path')
        .attr('d', arc)
        .attr('fill', (_, i) => d3.schemeCategory10[i]);
  
      slices.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('dy', '0.35em')
        .text(d => d.data.country);
    }
  
    // Histogram
    function createHistogram(data) {
      const width = 800;
      const height = 600;
      const margin = { top: 20, right: 20, bottom: 60, left: 80 };
  
      const svg = d3.select('#histogram')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
  
      const x = d3.scaleLinear()
        .range([margin.left, width - margin.right]);
      const y = d3.scaleLinear()
        .range([height - margin.bottom, margin.top]);
  
      const bins = d3.histogram()
        .value(d => d.gain_2000_2020_ha)
        .thresholds(20)(data);
  
      x.domain([0, d3.max(bins, d => d.x1)]);
      y.domain([0, d3.max(bins, d => d.length)]);
  
      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));
  
      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
  
      svg.selectAll('.bar')
        .data(bins)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.x0))
        .attr('width', d => x(d.x1) - x(d.x0))
        .attr('y', d => y(d.length))
        .attr('height', d => y(0) - y(d.length));
  
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .style('text-anchor', 'middle')
        .text('Forest Area Gain (2000-2020 ha)');
  
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 10)
        .attr('x', -height / 2)
        .style('text-anchor', 'middle')
        .text('Count');
  
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .style('text-anchor', 'middle')
        .text('Distribution of Forest Area Gain (2000-2020)');
    }
  
    // Timeline Chart
    function createTimelineChart(data) {
      const width = 800;
      const height = 600;
      const margin = { top: 20, right: 80, bottom: 60, left: 80 };
  
      const svg = d3.select('#timeline-chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
  
      const x = d3.scaleLinear()
        .range([margin.left, width - margin.right]);
      const y = d3.scaleLinear()
        .range([height - margin.bottom, margin.top]);
  
      const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.loss_ha));
  
      const countries = d3.unique(data, d => d.country);
  
      x.domain([2001, 2022]);
      y.domain([0, d3.max(data, d => d3.max(d.tc_loss_by_year, c => c.loss_ha))]);
  
      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));
  
      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
  
      svg.selectAll('.line')
        .data(countries)
        .enter()
        .append('path')
        .attr('class', 'line')
        .attr('d', country => line(formattedData.find(d => d.country === country).tc_loss_by_year))
        .attr('stroke', (_, i) => d3.schemeCategory10[i]);
  
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .style('text-anchor', 'middle')
        .text('Year');
  
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 10)
        .attr('x', -height / 2)
        .style('text-anchor', 'middle')
        .text('Forest Cover Loss (ha)');
  
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .style('text-anchor', 'middle')
        .text('Forest Cover Loss by Country Over Time');
    }
  
    // Scatter Plot
    function createScatterPlot(data) {
      const width = 800;
      const height = 600;
      const margin = { top: 20, right: 20, bottom: 60, left: 80 };
  
      const svg = d3.select('#scatter-plot')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
  
      const x = d3.scaleLinear()
        .range([margin.left, width - margin.right]);
      const y = d3.scaleLinear()
        .range([height - margin.bottom, margin.top]);
  
      x.domain([0, d3.max(data, d => d.extent_2000_ha)]);
      y.domain([0, d3.max(data, d => d.extent_2010_ha)]);
  
      svg.selectAll('.dot')
        .data(data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('r', 5)
        .attr('cx', d => x(d.extent_2000_ha))
        .attr('cy', d => y(d.extent_2010_ha));
  
      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));
  
      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
  
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .style('text-anchor', 'middle')
        .text('Forest Extent in 2000 (ha)');
  
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 10)
        .attr('x', -height / 2)
        .style('text-anchor', 'middle')
        .text('Forest Extent in 2010 (ha)');
  
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .style('text-anchor', 'middle')
        .text('Forest Extent in 2000 vs 2010');
    }
  
    // Bubble Plot
    function createBubblePlot(data) {
      const width = 800;
      const height = 600;
      const margin = { top: 20, right: 20, bottom: 60, left: 80 };
  
      const svg = d3.select('#bubble-plot')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
  
      const x = d3.scaleLinear()
        .range([margin.left, width - margin.right]);
      const y = d3.scaleLinear()
        .range([height - margin.bottom, margin.top]);
      const r = d3.scaleLinear()
        .range([5, 30]);
  
      x.domain([0, d3.max(data, d => d.extent_2000_ha)]);
      y.domain([0, d3.max(data, d => d.extent_2010_ha)]);
      r.domain([0, d3.max(data, d => d.area_ha)]);
  
      svg.selectAll('.bubble')
        .data(data)
        .enter().append('circle')
        .attr('class', 'bubble')
        .attr('cx', d => x(d.extent_2000_ha))
        .attr('cy', d => y(d.extent_2010_ha))
        .attr('r', d => r(d.area_ha) / 1000)
        .attr('fill', (_, i) => d3.schemeCategory10[i % 10]);
  
      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));
  
      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
  
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .style('text-anchor', 'middle')
        .text('Forest Extent in 2000 (ha)');
  
      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 10)
        .attr('x', -height / 2)
        .style('text-anchor', 'middle')
        .text('Forest Extent in 2010 (ha)');
  
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .style('text-anchor', 'middle')
        .text('Forest Extent in 2000 vs 2010 (Bubble Size = Total Area)');
    }
  
    // Call the chart functions
    createBarChart(formattedData);
    createPieChart(formattedData);
    createHistogram(formattedData);
    createTimelineChart(formattedData);
    createScatterPlot(formattedData);
    createBubblePlot(formattedData);
  });