d3.json("application.json", function (json) {
    'use strict';
    var colorScale = ['#719bce', '#7a51ef', '#b768e7', '#f3458a', '#f9513f', '#feba3f', '#ffdf33', '#23b20d', '#0ba368', '#28b9aa'];
    var timeFormat = d3.time.format.iso;
    var width = window.innerWidth * 0.9;


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
        var assigned = ["assigned", "assigned.terminated"];
        var active = ["active", "active.evaluated", "active.in_progress", "active.needs_discussion", "active.new"];
        var inactive = ["inactive", "inactive.denied", "inactive.double", "inactive.invalid", "inactive.recall", "inactive.withdrawn"];
        if (assigned.indexOf(cur.line) > -1) {
            acc["assigned"] = (acc["assigned"] || 0) + 1;
        } else if (active.indexOf(cur.line) > -1) {
            acc["active"] = (acc["active"] || 0) + 1;
        } else if (inactive.indexOf(cur.line) > -1) {
            acc["inactive"] = (acc["inactive"] || 0) + 1;
        } else {
            acc[cur.line] = (acc[cur.line] || 0) + 1;
        }
        return acc;
    }, function (acc, cur) {
        var assigned = ["assigned", "assigned.terminated"];
        var active = ["active", "active.evaluated", "active.in_progress", "active.needs_discussion", "active.new"];
        var inactive = ["inactive", "inactive.denied", "inactive.double", "inactive.invalid", "inactive.recall", "inactive.withdrawn"];
        if (assigned.indexOf(cur.line) > -1) {
            acc["assigned"] = (acc["assigned"] || 0) - 1;
        } else if (active.indexOf(cur.line) > -1) {
            acc["active"] = (acc["active"] || 0) - 1;
        } else if (inactive.indexOf(cur.line) > -1) {
            acc["inactive"] = (acc["inactive"] || 0) - 1;
        } else {
            acc[cur.line] = (acc[cur.line] || 0) - 1;
        }
        return acc;
    }, function () {
        return {};
    });

    console.log( /*JSON.stringify(lineValuesByDate.top(Infinity)),*/ lineValuesByDate.top(Infinity).filter(function (c) {
        return c.value.active;
    }).length);

    var lineDim = data.dimension(function (d) {
        var assigned = ["assigned", "assigned.terminated"];
        var active = ["active", "active.evaluated", "active.in_progress", "active.needs_discussion", "active.new"];
        var inactive = ["inactive", "inactive.denied", "inactive.double", "inactive.invalid", "inactive.recall", "inactive.withdrawn"];
        if (assigned.indexOf(d.line) > -1) {
            return "assigned";
        } else if (active.indexOf(d.line) > -1) {
            return "active";
        } else if (inactive.indexOf(d.line) > -1) {
            return "inactive";
        }
        return d.line;
    });

    var lineValues = lineDim.group().reduceCount(function (d) {
        return d.value;
    });

    var carDim = data.dimension(function (d) {
        return d.car;
    });

    var carValues = carDim.group().reduceCount(function (d) {
        return d.value;
    });

    var buildingDim = data.dimension(function (d) {
        return d.building;
    });

    var buildingValues = buildingDim.group().reduceCount(function (d) {
        return d.value;
    });

    var phaseDim = data.dimension(function (d) {
        return d.phase;
    });

    var phaseValues = phaseDim.group().reduceCount(function (d) {
        return d.value;
    });

    var incomeDim = data.dimension(function (d) {
        return d.income;
    });

    var incomeValues = incomeDim.group().reduceCount(function (d) {
        return d.value;
    });

    var roomsDim = data.dimension(function (d) {
        return d.rooms;
    });

    var roomsValues = roomsDim.group().reduceCount(function (d) {
        return d.value;
    });

    var periodDim = data.dimension(function (d) {
        return d.period;
    });

    var periodValues = periodDim.group().reduceCount(function (d) {
        return d.value;
    });

    var personChart = dc.lineChart("#graph");
    personChart
        .turnOnControls(true)
        .width(width).height(350)
        .dimension(days)
        .group(lineValuesByDate, "active")
        .valueAccessor(function (d) {
            return d.value.active || 0;
        })
        .stack(lineValuesByDate, "completed", function (d) {
            return d.value.completed || 0;
        })
        .stack(lineValuesByDate, "evaluated", function (d) {
            return d.value.evaluated || 0;
        })
        .stack(lineValuesByDate, "assigned", function (d) {
            return d.value.assigned || 0;
        })
        .stack(lineValuesByDate, "inactive", function (d) {
            return d.value.inactive || 0;
        })
        .stack(lineValuesByDate, "new", function (d) {
            return d.value.new || 0;
        })
        .stack(lineValuesByDate, "temp", function (d) {
            return d.value.temp || 0;
        })
        .renderArea(true)
        .elasticY(true)
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

    var carChart = dc.pieChart("#car");
    carChart
        .width(150).height(150)
        .dimension(carDim)
        .group(carValues)
        .innerRadius(35)
        .ordinalColors(colorScale)
        .legend(dc.legend().x(0).y(150).gap(5))
        .renderLabel(false);

    carChart.on('pretransition', function (chart) {
        chart.select("svg").attr("height", 250);
    });

    var phaseChart = dc.rowChart("#phase");
    phaseChart
        .width(400).height(250)
        .dimension(phaseDim)
        .group(phaseValues)
        .elasticX(true)
        .label(function (d) {
            return d.key.split("_").join(' ');
        })
        .ordinalColors(colorScale);

    var incomeChart = dc.rowChart("#income");
    incomeChart
        .width(400).height(250)
        .dimension(incomeDim)
        .group(incomeValues)
        .elasticX(true)
        .ordering(function (d) {
            return +d.key.split("_")[0];
        })
        .label(function (d) {
            return d.key.split("_").join(' - ');
        })
        .ordinalColors(colorScale);

    var periodChart = dc.rowChart("#period");
    periodChart
        .width(400).height(250)
        .dimension(periodDim)
        .group(periodValues)
        .elasticX(true)
        .ordering(function (d) {
            return +d.key.split("_")[0];
        })
        .label(function (d) {
            return d.key.split("_").join(' - ');
        })
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