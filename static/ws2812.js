
var data = [];

function render(nleds) {

  var di = 0;
  var colors = [];

  var svg = d3.select("#wssim").append("svg")
      .attr("width", 640)
      .attr("height", 400)
      .attr("class", "direct");

  var nodeData = [];
  var links = [];
  for (var i = 0; i < nleds; i++) {
      nodeData.push({});
      if (i > 0) {
          links.push({source: i-1, target:i});
      }
  }

  var force = d3.layout.force()
    .nodes(nodeData)
    .links(links)
      .size([640, 400])
      .linkStrength(1)
      .linkDistance(50)
      .charge(-300)
      .theta(.9)
      .alpha(0.9);

  var link = svg.selectAll(".link")
      .data(links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.selectAll(".node")
      .data(force.nodes())
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 15)
      .style("fill", function(d, i) { return data[di][i].rgb; })
      .call(force.drag);

  svg.selectAll(".node")
      .data(force.nodes())
      .style("fill", function(d, i) { return data[di][i].rgb; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
  });

  force.on("end", refresh);

  force.start();

  var now = +new Date();
  var next = now + data[di+1][0].ts;
  var refresh = function() {
      if (+new Date() < next) {
          return;
      }
      if (di+1 >= data.length) { di = 0; next += 1000; return }
      next = now + data[di+1][0].ts - data[di][0].ts;

      svg.selectAll(".node")
          .data(force.nodes())
          .style("fill", function(d, i) {
             var color = data[di][i] ? data[di][i].rgb : colors[i];
             colors[i] = color;
             return color;
          });

      di++;
  }

  d3.timer(refresh, 100);
}

d3.csv("/static/ws2812.csv", function(d) {
  return {
    ts: +d.ts,
    led: +d.led,
    rgb: d.rgb,
  }},
  function(error, rows) {
    var acc = [];
    var nleds = 0;
    console.log(rows);
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].led == 0 && acc.length > 0) {
        nleds = acc.length > nleds ? acc.length : nleds;
        data.push(acc);
        acc = [];
      }
      acc.push(rows[i]);
    }
    if (acc.length > 0) {
      data.push(acc);
    }
    console.log("parsed", rows.length, "rows to", data.length);
    render(nleds);
  });
