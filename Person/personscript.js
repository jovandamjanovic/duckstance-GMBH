d3.json("person.json", function (json) {
    'use strict';
    var colorScale = ['#719bce', '#7a51ef', '#b768e7', '#f3458a', '#f9513f', '#feba3f', '#ffdf33', '#23b20d', '#0ba368', '#28b9aa'];
    var width = window.innerWidth * 0.9;
    var timeFormat = d3.time.format.iso;
    json = json.map(function (c) {
        var temp = {};
        Object.keys(c).forEach(function (k) {
            if (k === "date") {
                temp[k] = timeFormat.parse(c[k]);
            } else if (!(c[k] === 0)) {
                temp[k.split("_")[0]] = k.split("_").slice(1).join("_");
            }
        });
        return temp;
    });

    var data = crossfilter(json);
    var days = data.dimension(function (d) {
        return d.date;
    });
    var minDate = days.bottom(1)[0].date;
    var maxDate = days.top(1)[0].date;

    var lineValuesByDate = days.group().reduce(function (acc, cur) {
        acc[cur.line] = (acc[cur.line] || 0) + 1
        return acc;
    }, function (acc, cur) {
        acc[cur.line] = (acc[cur.line] || 0) - 1
        return acc;
    }, function () {
        return {};
    });

    var lineDim = data.dimension(function (d) {
        return d.line;
    });

    var lineValues = lineDim.group().reduceCount(function (d) {
        return d.value;
    });

    var sexDim = data.dimension(function (d) {
        return d.sex;
    });

    var sexValues = sexDim.group().reduceCount(function (d) {
        return d.value;
    });

    var buildingDim = data.dimension(function (d) {
        return d.building;
    });

    var buildingValues = buildingDim.group().reduceCount(function (d) {
        return d.value;
    });

    var ageDim = data.dimension(function (d) {
        return d.age;
    });

    var ageValues = ageDim.group().reduceCount(function (d) {
        return d.value;
    });

    var nationDim = data.dimension(function (d) {
        return d.nation;
    });

    var nationValues = nationDim.group().reduceCount(function (d) {
        return d.value;
    });

    var roomsDim = data.dimension(function (d) {
        return d.rooms;
    });

    var roomsValues = roomsDim.group().reduceCount(function (d) {
        return d.value;
    });

    var personChart = dc.lineChart("#graph");
    personChart
        .turnOnControls(true)
        .width(width).height(350)
        .dimension(days)
        .group(lineValuesByDate, "completed")
        .valueAccessor(function (d) {
            return d.value.completed || 0;
        })
        .stack(lineValuesByDate, "assigned", function (d) {
            return d.value.assigned || 0;
        })
        .stack(lineValuesByDate, "inactive", function (d) {
            return d.value.inactive || 0;
        })
        .stack(lineValuesByDate, "active", function (d) {
            return d.value.active || 0;
        })
        .stack(lineValuesByDate, "new", function (d) {
            return d.value.new || 0;
        })
        .stack(lineValuesByDate, "temp", function (d) {
            return d.value.temp || 0;
        })
        .elasticY(true)
        .renderArea(true)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .ordinalColors(colorScale)
        .legend(dc.legend().x(50).y(10).itemHeight(13).gap(5).horizontal(true));

    var lineChart = dc.pieChart("#line");
    lineChart
        .width(150).height(150)
        .dimension(lineDim)
        .group(lineValues)
        .innerRadius(35)
        .ordinalColors(colorScale)
        .legend(dc.legend().x(0).y(150).gap(5))
        .renderLabel(false);

    lineChart.on('pretransition', function (chart) {
        chart.select("svg").attr("height", 250);
    });

    var sexChart = dc.pieChart("#sex");
    sexChart
        .width(150).height(150)
        .dimension(sexDim)
        .group(sexValues)
        .innerRadius(35)
        .ordinalColors(colorScale)
        .legend(dc.legend().x(0).y(150).gap(5))
        .renderLabel(false);

    sexChart.on('pretransition', function (chart) {
        chart.select("svg").attr("height", 250);
    });

    var ageChart = dc.rowChart("#age");
    ageChart
        .width(400).height(250)
        .dimension(ageDim)
        .group(ageValues)
        .elasticX(true)
        .label(function (d) {
            return d.key.split("_").join(" - ");
        })
        .ordering(function (d) {
            return +d.key.split("_")[0];
        })
        .ordinalColors(colorScale);

    var nationChart = dc.rowChart("#nation");
    nationChart
        .width(400).height(250)
        .dimension(nationDim)
        .group(nationValues)
        .elasticX(true)
        .ordinalColors(colorScale);

    var buildingChart = dc.barChart("#building");
    buildingChart
        .width(400).height(250)
        .dimension(buildingDim)
        .group(buildingValues)
        .elasticY(true)
        .gap(5)
        .x(d3.scale.ordinal().domain(buildingDim))
        .xUnits(dc.units.ordinal)
        .ordinalColors(colorScale)
        .colorAccessor(function (d) {
            return d.key;
        });

    var roomsChart = dc.barChart("#rooms");
    roomsChart
        .width(400).height(250)
        .dimension(roomsDim)
        .group(roomsValues)
        .elasticY(true)
        .gap(5)
        .x(d3.scale.ordinal().domain(roomsDim))
        .xUnits(dc.units.ordinal)
        .ordinalColors(colorScale)
        .colorAccessor(function (d) {
            return d.key;
        });

    dc.renderAll();
});