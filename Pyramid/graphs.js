var colorScale = ['#719bce', '#7a51ef', '#b768e7', '#f3458a', '#f9513f', '#feba3f', '#ffdf33', '#23b20d', '#0ba368', '#28b9aa'];

d3.json("nationality.json", function (json) {
    'use strict';
    var chartWidth = window.innerWidth * 0.4;
    var chartHeight = chartWidth;

    var data = crossfilter(json);

    var nationDim = data.dimension(function (d) {
        return d.key;
    });

    var nationValues = nationDim.group().reduce(function (acc, curr) {
        acc[curr.type] = (acc[curr.type] || 0) + +curr.number;
        return acc;
    }, function (acc, curr) {
        acc[curr.type] = (acc[curr.type] || 0) - +curr.number;
        return acc;
    }, function () {
        return {};
    });

    var nationChart = dc.compositeChart("#nation");

    var bewerbende = dc.barChart(nationChart)
        .gap(chartWidth * 0.1)
        .group(nationValues, "interresent_in")
        .valueAccessor(function (d) {
            return d.value["bewerbende"];
        })
        .useRightYAxis(true)
        .colors(colorScale[0]);

    var bewohnende = dc.barChart(nationChart)
        .gap(chartWidth * 0.1)
        .group(nationValues, "bewohner_in")
        .valueAccessor(function (d) {
            return d.value["bewohnende"];
        })
        .useRightYAxis(true)
        .colors(colorScale[1]);

    var referenz = dc.barChart(nationChart)
        .gap(chartWidth * 0.1)
        .group(nationValues, "referenz")
        .valueAccessor(function (d) {
            return d.value["referenz"];
        })
        .useRightYAxis(true)
        .colors(colorScale[2]);

    nationChart
        .width(chartWidth)
        .height(chartHeight)
        .dimension(nationDim)
        .group(nationValues)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(nationDim))
        .xUnits(dc.units.ordinal)
        .compose([referenz, bewohnende, bewerbende])
        .brushOn(true)
        .legend(dc.legend().x(0).y(0).itemHeight(10).gap(5));

    nationChart.margins().top = 90;

    nationChart.on("pretransition", function (c) {
        var delta = chartWidth * 0.02;
        var shift = chartWidth * (-0.055);
        c.selectAll("g.sub._0").attr("transform", "translate(" + ((delta + 1) * 3 + shift) + ", 0)");
        c.selectAll("g.sub._1").attr("transform", "translate(" + ((delta + 1) * 2 + shift) + ", 0)");
        c.selectAll("g.sub._2").attr("transform", "translate(" + ((delta + 1) * 1 + shift) + ", 0)");
        c.selectAll("#nation .x .tick").style("display", "none");
        c.selectAll("#nation .yr .tick text").attr("transform", function () {
            var coord = this.getBBox();
            var x = coord.x + (coord.width / 2),
                y = coord.y + (coord.height / 2);
            return "rotate(-90 " + x + " " + y + ")";
        });
        c.selectAll(".dc-legend").attr("transform", function () {
            var coord = this.getBBox();
            var x = coord.x + (coord.width / 2),
                y = coord.y + (coord.height / 2);
            return "translate(" + (chartWidth - 120) + ", " + 20 + ") rotate(-90 " + x + " " + y + ")";
        });
        c.selectAll("svg").style("transform", "rotate(90deg)");
    });

    dc.renderAll();
});

d3.json("mock_pyramid.json", function (json) {
    'use strict';
    var chartWidth = window.innerWidth * 0.4;
    var chartHeight = chartWidth;

    var men = json[0].filter(function (c) {
        return c.sex === 1;
    });

    var women = json[0].filter(function (c) {
        return c.sex === 2;
    });

    var dataMen = crossfilter(men);
    var dataWomen = crossfilter(women);

    var menDim = dataMen.dimension(function (d) {
        return d.age;
    });

    var menValues = menDim.group().reduce(function (acc, curr) {
        acc[curr.type] = (acc[curr.type] || 0) + +curr.people;
        return acc;
    }, function (acc, curr) {
        acc[curr.type] = (acc[curr.type] || 0) - +curr.people;
        return acc;
    }, function () {
        return {};
    });

    var womenDim = dataWomen.dimension(function (d) {
        return d.age;
    });

    var womenValues = womenDim.group().reduce(function (acc, curr) {
        acc[curr.type] = (acc[curr.type] || 0) + +curr.people;
        return acc;
    }, function (acc, curr) {
        acc[curr.type] = (acc[curr.type] || 0) - +curr.people;
        return acc;
    }, function () {
        return {};
    });

    var menChart = dc.compositeChart("#ageMen");
    var womenChart = dc.compositeChart("#ageWomen");

    var menBewerbende = dc.barChart(menChart)
        .gap(chartWidth * 0.0375)
        .group(menValues, "bewerbende")
        .valueAccessor(function (d) {
            return d.value["bewerbende"];
        })
        .useRightYAxis(true)
        .colors(colorScale[0]);

    var menBewohnende = dc.barChart(menChart)
        .gap(chartWidth * 0.0375)
        .group(menValues, "bewohnende")
        .valueAccessor(function (d) {
            return d.value["bewohnende"];
        })
        .useRightYAxis(true)
        .colors(colorScale[1]);

    var menReferenz = dc.barChart(menChart)
        .gap(chartWidth * 0.0375)
        .group(menValues, "referenz")
        .valueAccessor(function (d) {
            return d.value["referenz"];
        })
        .useRightYAxis(true)
        .colors(colorScale[2]);

    var womenBewerbende = dc.barChart(womenChart)
        .gap(chartWidth * 0.0375)
        .group(womenValues, "bewerbende")
        .valueAccessor(function (d) {
            return d.value["bewerbende"];
        })
        .useRightYAxis(true)
        .colors(colorScale[0]);

    var womenBewohnende = dc.barChart(womenChart)
        .gap(chartWidth * 0.0375)
        .group(womenValues, "bewohnende")
        .valueAccessor(function (d) {
            return d.value["bewohnende"];
        })
        .useRightYAxis(true)
        .colors(colorScale[1]);

    var womenReferenz = dc.barChart(womenChart)
        .gap(chartWidth * 0.0375)
        .group(womenValues, "referenz")
        .valueAccessor(function (d) {
            return d.value["referenz"];
        })
        .useRightYAxis(true)
        .colors(colorScale[2]);

    menChart
        .width(chartWidth)
        .height(chartHeight)
        .dimension(menDim)
        .group(menValues)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(menDim))
        .xUnits(dc.units.ordinal)
        .compose([menBewerbende, menBewohnende, menReferenz])
        .brushOn(true)
        .legend(dc.legend().x(0).y(0).itemHeight(10).gap(5));

    womenChart
        .width(chartWidth)
        .height(chartHeight)
        .dimension(womenDim)
        .group(womenValues)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(womenDim))
        .xUnits(dc.units.ordinal)
        .compose([womenBewerbende, womenBewohnende, womenReferenz])
        .brushOn(true);

    menChart.margins().top = 90;
    womenChart.margins().top = 90;

    menChart.on("pretransition", function (c) {
        var delta = chartWidth * 0.015;
        var shift = chartWidth * (-0.02);
        c.selectAll("g.sub._0").attr("transform", "translate(" + ((delta - 2.5) * 3 + shift) + ", 0)");
        c.selectAll("g.sub._1").attr("transform", "translate(" + ((delta - 2.5) * 2 + shift) + ", 0)");
        c.selectAll("g.sub._2").attr("transform", "translate(" + ((delta - 2.5) * 1 + shift) + ", 0)");
        c.selectAll(".x .tick line").style("display", "none");
        c.selectAll(".x .tick text").attr("transform", function () {
            var coord = this.getBBox();
            var x = coord.x + (coord.width / 2),
                y = coord.y + (coord.height / 2);
            return "rotate(-90 " + x + " " + y + ")";
        });
        c.selectAll(".dc-legend").attr("transform", function () {
            var coord = this.getBBox();
            var x = coord.x + (coord.width / 2),
                y = coord.y + (coord.height / 2);
            return "translate(" + (chartWidth - 120) + ", " + 20 + ")rotate(-90 " + x + " " + y + ")";
        });
        c.selectAll("svg").style("transform", "rotate(90deg)");
        c.selectAll("svg").attr("xmlns", "http://www.w3.org/2000/svg");
    });

    womenChart.on("pretransition", function (c) {
        var delta = chartWidth * 0.015;
        var shift = chartWidth * (-0.02);
        c.selectAll("g.sub._0").attr("transform", "translate(" + ((delta - 2.5) * 3 + shift) + ", 0)");
        c.selectAll("g.sub._1").attr("transform", "translate(" + ((delta - 2.5) * 2 + shift) + ", 0)");
        c.selectAll("g.sub._2").attr("transform", "translate(" + ((delta - 2.5) * 1 + shift) + ", 0)");
        c.selectAll(".x .tick").style("display", "none");
        c.selectAll("svg").style("transform", "rotate(90deg) scaleY(-1)");
        c.selectAll(".yr .tick text").style("transform", "scaleY(-1)");
        c.selectAll("svg").attr("xmlns", "http://www.w3.org/2000/svg");
    });

    dc.renderAll();
});

d3.json("donuts.json", function (json) {
    'use strict';
    json.forEach(function (current) {
        var pieName = Object.keys(current)[0];
        var preData = current[pieName];
        var fields = Object.keys(preData);
        var data = [];
        var i;
        fields.forEach(function (c) {
            for (i = 0; i < preData[c]; i += 1) {
                data.push({
                    "field": c
                });
            }
            if (preData[c] === 0) {
                data.push({
                    "field": c
                });
            }
        });
        var ndx = crossfilter(data);
        var pieDim = ndx.dimension(function (c) {
            return c.field;
        });
        var pieValues = pieDim.group().reduceCount(function (c) {
            return c.field;
        });

        var pieChart = dc.pieChart("#" + pieName);

        pieChart
            .width(150).height(150)
            .dimension(pieDim)
            .group(pieValues)
            .innerRadius(35)
            .ordinalColors(colorScale)
            .legend(dc.legend().x(0).y(150).gap(5))
            .renderLabel(false);

        pieChart.on('pretransition', function (chart) {
            chart.select("svg").attr("height", 200);
        });
    });
    dc.renderAll();
});