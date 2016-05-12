var windowPlugin = Chart.PluginBase.extend({
    beforeInit: function(chartCtrlr) {
        var chart = chartCtrlr.chart;
        if (typeof chart.config.window == 'undefined') {
            chart.config.window = { _enabled: false };
        }
        if ((typeof chart.config.window.role == 'undefined') || (typeof chart.config.window.windowSize == 'undefined')) {
            chart.config.window._enabled = false;
            return;
        }
        chart.config.window._enabled = true;
        chart.config.window._initialized = false;
        if (chart.config.window.role == 'preview') {
            chart.config.options.onClick = function (event, elementsAtEvent)
            {
                var dataPoint = {x: null, y: null};
                for (var scaleName in this.scales) {
                    var scale = this.scales[scaleName];
                    if (scale.isHorizontal()) {
                        dataPoint.x = scale.getValueForPixel(event.offsetX);
                    } else {
                        dataPoint.y = scale.getValueForPixel(event.offsetY);
                    }
                }

                var windowMin = moment(this.data.labels[0], moment.ISO_8601);
                var windowMax = moment(this.data.labels[this.data.labels.length - 1], moment.ISO_8601);

                var windowSize = this.config.window.windowSize;
                var halfWindowSize = moment.duration((windowSize.asMilliseconds() / 2), 'milliseconds');
                var windowStart = dataPoint.x.clone().subtract(halfWindowSize);
                if (windowStart < windowMin) {
                    windowStart = windowMin;
                }
                var windowEnd = windowStart.clone().add(windowSize);
                if (windowEnd > windowMax) {
                    windowEnd = windowMax;
                    windowStart = windowMax.clone().subtract(windowSize);
                }

                this.config.linkedChart.scales['x-axis-0'].options.time.min = windowStart;
                this.config.linkedChart.scales['x-axis-0'].options.time.max = windowEnd;
                this.config.linkedChart.update();
            };
        } else if (chart.config.window.role == 'window') {
            // Set the window on the large chart
            var lastLabel = chart.config.data.labels[chart.config.data.labels.length - 1];
            var windowEnd = moment(lastLabel, moment.ISO_8601);
            var windowStart = windowEnd.clone().subtract(chart.config.window.windowSize);
            chart.config.options.scales.xAxes[0].time.min = windowStart;
            chart.config.options.scales.xAxes[0].time.max = windowEnd;
        }
    },
    afterInit: function(chartCtrlr) {
        chartCtrlr.chart.config.window._initialized = true;
    },
    afterUpdate: function(chartCtrlr) {
        var chart = chartCtrlr.chart;
        if (! (chart.config.window._enabled && chart.config.window._initialized)) {
            return;
        }

        // Tell the preview chart what the currently viewed window is
        if (chart.config.window.role == 'window') {
            var windowStart = null, windowEnd = null;
            var linkedChart = chart.config.linkedChart;

            if (typeof chartCtrlr.scales == 'undefined') {
                return;
            }

            windowStart = chartCtrlr.scales['x-axis-0'].options.time.min;
            windowEnd = chartCtrlr.scales['x-axis-0'].options.time.max;
            if (typeof windowStart == 'undefined') {
                return;
            }

            linkedChart.config.window.start = windowStart;
            linkedChart.config.window.end = windowEnd;
            linkedChart.update();
        }
    },
    afterDraw: function(chartCtrlr, easing) {
        var chart = chartCtrlr.chart;
        if (! (chart.config.window._enabled && chart.config.window._initialized)) {
            return;
        }

        // Draws the window rectangle onto the preview chart, using the values set in afterUpdate by the window chart
        if (chart.config.window.role == 'preview') {
            var windowStart = chart.config.window.start;
            var windowEnd = chart.config.window.end;
            var windowStartPx = null;
            var windowEndPx = null;
            var topPx = null;
            var bottomPx = null;

            for (var scaleName in chartCtrlr.scales) {
                var scale = chartCtrlr.scales[scaleName];
                if (scale.isHorizontal()) {
                    windowStartPx = scale.getPixelForValue(windowStart);
                    windowEndPx = scale.getPixelForValue(windowEnd);
                } else {
                    topPx = scale.getPixelForValue(scale.max);
                    bottomPx = scale.getPixelForValue(scale.min);
                }
            }

            var w = (windowEndPx - windowStartPx);
            var h = (bottomPx - topPx);
            chart.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            chart.ctx.fillRect(windowStartPx, topPx, w, h);
        }
    }
});
Chart.pluginService.register(new windowPlugin());
