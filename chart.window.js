var windowPlugin = Chart.PluginBase.extend({
    beforeInit: function(chartCtrlr) {
        var chart = chartCtrlr.chart;
        if (typeof chart.config.window == 'undefined') {
            chart.config.window = { _enabled: false };
        }
        var config = chart.config.window;
        if ((typeof config.role == 'undefined') || (typeof config.windowSize == 'undefined')) {
            config._enabled = false;
            return;
        }
        config._enabled = true;
        config._initialized = false;

        config._halfWindowSize = moment.duration((config.windowSize.asMilliseconds() / 2), 'milliseconds');

        if (config.role == 'preview') {
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

                var windowMin = this.scales['x-axis-0'].firstTick;
                var windowMax = this.scales['x-axis-0'].lastTick;

                var windowSize = this.config.window.windowSize;
                var halfWindowSize = this.config.window._halfWindowSize;
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
        }
    },
    afterInit: function(chartCtrlr) {
        var config = chartCtrlr.chart.config.window;
        config._initialized = true;

        if (!config._enabled) {
            return;
        }

        var chart = chartCtrlr.chart;
        if (config.role == 'window') {
            // Set the window on the large chart
            var windowEnd = chartCtrlr.scales['x-axis-0'].lastTick;
            var windowStart = windowEnd.clone().subtract(config.windowSize);
            chart.config.options.scales.xAxes[0].time.min = windowStart;
            chart.config.options.scales.xAxes[0].time.max = windowEnd;
        }
    },
    afterUpdate: function(chartCtrlr) {
        var chart = chartCtrlr.chart;
        var config = chart.config.window;
        if (! (config._enabled && config._initialized)) {
            return;
        }
        if (config._updating) {
            return;
        }
        config._updating = true;

        // Tell the preview chart what the currently viewed window is
        if (config.role == 'window') {
            if (typeof chartCtrlr.scales == 'undefined') {
                return;
            }

            var windowStart = chartCtrlr.scales['x-axis-0'].options.time.min;
            var windowEnd = chartCtrlr.scales['x-axis-0'].options.time.max;
            if (typeof windowStart == 'undefined') {
                return;
            }

            var linkedChart = chart.config.linkedChart;
            linkedChart.config.window.start = windowStart;
            linkedChart.config.window.end = windowEnd;
            linkedChart.update();
        }

        config._updating = false;
    },
    afterDraw: function(chartCtrlr, easing) {
        var chart = chartCtrlr.chart;
        var config = chart.config.window;
        if (! (config._enabled && config._initialized)) {
            return;
        }

        // Draws the window rectangle onto the preview chart, using the values set in afterUpdate by the window chart
        if (config.role == 'preview') {
            var windowStart = config.start;
            var windowEnd = config.end;
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
