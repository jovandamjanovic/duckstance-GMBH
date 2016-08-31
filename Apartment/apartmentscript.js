d3.json("apartment.json", function (json) {
    'use strict';
    var colorScale = ['#719bce', '#7a51ef', '#b768e7', '#f3458a', '#f9513f', '#feba3f', '#ffdf33', '#23b20d', '#0ba368', '#28b9aa'];
    var timeFormat = d3.time.format.iso;
    var width = window.innerWidth * 0.9;

    json = json.map(function (c) {
        var reserved = {};
        Object.keys(c).forEach(function (k) {
            if (k === "date") {
                reserved[k] = timeFormat.parse(c[k]);
            } else if (!(c[k] === 0)) {
                reserved[k.split("_")[0]] = k.split("_").slice(1).join("_");
            }
        });
        return reserved;
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

    var applicationsDim = data.dimension(function (d) {
        return d.applications;
    });

    var applicationsValues = applicationsDim.group().reduceCount(function (d) {
        return d.value;
    });

    var buildingDim = data.dimension(function (d) {
        return d.building;
    });

    var buildingValues = buildingDim.group().reduceCount(function (d) {
        return d.value;
    });

    var periodDim = data.dimension(function (d) {
        return d.period;
    });

    var periodValues = periodDim.group().reduceCount(function (d) {
        return d.value;
    });

    var floorDim = data.dimension(function (d) {
        return d.floor;
    });

    var floorValues = floorDim.group().reduceCount(function (d) {
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
        .dimension(days).group(lineValuesByDate, "assigned")
        .valueAccessor(function (d) {
            return d.value.assigned || 0;
        })
        .stack(lineValuesByDate, "active", function (d) {
            return d.value.active || 0;
        })
        .stack(lineValuesByDate, "inactive", function (d) {
            return d.value.inactive || 0;
        })
        .stack(lineValuesByDate, "advertised", function (d) {
            return d.value.advertised || 0;
        })
        .stack(lineValuesByDate, "reserved", function (d) {
            return d.value.reserved || 0;
        })
        .stack(lineValuesByDate, "vacant", function (d) {
            return d.value.vacant || 0;
        }).elasticY(true)
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

    var applicationsChart = dc.pieChart("#applications");
    applicationsChart
        .width(150).height(150)
        .dimension(applicationsDim)
        .group(applicationsValues)
        .innerRadius(35)
        .ordinalColors(colorScale)
        .legend(dc.legend().x(0).y(150).gap(5))
        .renderLabel(false);

    applicationsChart.on('pretransition', function (chart) {
        chart.select("svg").attr("height", 250);
    });

    var periodChart = dc.rowChart("#period");
    periodChart
        .width(400).height(250)
        .dimension(periodDim)
        .group(periodValues)
        .elasticX(true)
        .ordering(function (d) {
            return +d.key.split("_")[0];
        })
        .label(function (c) {
            return c.key.split('_').join(' - ');
        })
        .ordinalColors(colorScale);

    var floorChart = dc.barChart("#floor");
    floorChart
        .width(400).height(250)
        .dimension(floorDim)
        .group(floorValues)
        .elasticY(true)
        .gap(5)
        .x(d3.scale.ordinal().domain(floorDim))
        .xUnits(dc.units.ordinal)
        .ordinalColors(colorScale)
        .colorAccessor(function (d) {
            return d.key;
        });

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