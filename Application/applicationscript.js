d3.json("application.json", function (json) {
    'use strict';
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

    var assignedByDate = days.group().reduceSum(function (d) {
        var filt = ["assigned", "assigned.terminated"];
        if (filt.indexOf(d.line) > -1) {
            return 1;
        }
        return 0;
    });


    var activeByDate = days.group().reduceSum(function (d) {
        var filt = ["active", "active.evaluated", "active.in_progress", "active.needs_discussion", "active.new"];
        if (filt.indexOf(d.line) > -1) {
            return 1;
        }
        return 0;
    });

    var inactiveByDate = days.group().reduceSum(function (d) {
        var filt = ["inactive", "inactive.denied", "inactive.double", "inactive.invalid", "inactive.recall", "inactive.withdrawn"];
        if (filt.indexOf(d.line) > -1) {
            return 1;
        }
        return 0;
    });

    var tempByDate = days.group().reduceSum(function (d) {
        var filt = ["temp"];
        if (filt.indexOf(d.line) > -1) {
            return 1;
        }
        return 0;
    });

    var newByDate = days.group().reduceSum(function (d) {
        var filt = ["new"];
        if (filt.indexOf(d.line) > -1) {
            return 1;
        }
        return 0;
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
        .group(assignedByDate, "assigned")
        .stack(inactiveByDate, "inactive")
        .stack(activeByDate, "active")
        .stack(tempByDate, "temp")
        .stack(newByDate, "new")
        .renderArea(true)
        .elasticY(true)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .legend(dc.legend().x(50).y(10).itemHeight(13).gap(5).horizontal(true));

    var carChart = dc.pieChart("#car");
    carChart
        .width(150).height(150)
        .dimension(carDim)
        .group(carValues)
        .innerRadius(35)
        .colors(d3.scale.category10());

    var phaseChart = dc.rowChart("#phase");
    phaseChart
        .width(400).height(250)
        .dimension(phaseDim)
        .group(phaseValues)
        .elasticX(true)
        .label(function (d) {
            return d.key.split("_").join(' ');
        })
        .colors(d3.scale.category10());

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
        .colors(d3.scale.category10());

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
        .colors(d3.scale.category10());

    var buildingChart = dc.barChart("#building");
    buildingChart
        .width(400).height(250)
        .dimension(buildingDim)
        .group(buildingValues)
        .elasticY(true)
        .gap(5)
        .x(d3.scale.ordinal().domain(buildingDim))
        .xUnits(dc.units.ordinal)
        .colors(d3.scale.category10())
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
        .colors(d3.scale.category10())
        .colorAccessor(function (d) {
            return d.key;
        });

    dc.renderAll();
});