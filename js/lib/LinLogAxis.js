var d3 = require('d3');
var bqplot = require('bqplot');

class LinLogAxis extends bqplot.Axis {
    set_tick_values(animate) {
        // For log scales, use only powers of 10 as major ticks
        if (this.axis_scale && this.axis_scale.model.type === 'log') {
            var tick_values = this.model.get('tick_values');
            var num_ticks = this.model.get('num_ticks');

            if ((!tick_values || tick_values.length === 0) &&
                (num_ticks === undefined || num_ticks === null)) {
                var scale = this.axis_scale.scale;
                var domain = scale.domain();
                var domainMin = Math.min(domain[0], domain[1]);
                var domainMax = Math.max(domain[0], domain[1]);

                if (domainMin > 0 && domainMax > 0) {
                    var logMin = Math.ceil(Math.log10(domainMin));
                    var logMax = Math.floor(Math.log10(domainMax));
                    var ticks = [];
                    for (var exp = logMin; exp <= logMax; exp++) {
                        ticks.push(Math.pow(10, exp));
                    }
                    if (ticks.length > 0) {
                        this.axis.tickValues(ticks);
                        if (this.g_axisline) {
                            this.g_axisline
                                .transition('set_tick_values')
                                .duration(animate === true ? this.parent.model.get('animation_duration') : 0)
                                .call(this.axis);
                            this.apply_tick_styling();
                        }
                        return;
                    }
                }
            }
        }
        // For everything else, use parent implementation
        bqplot.Axis.prototype.set_tick_values.call(this, animate);
    }

    tickformat_changed() {
        // For log scales without explicit tick_format, use 10^n notation
        if (this.axis_scale && this.axis_scale.model.type === 'log' &&
            !this.model.get('tick_format')) {
            var superscripts = '\u2070\u00B9\u00B2\u00B3\u2074\u2075\u2076\u2077\u2078\u2079';
            this.tick_format = function(d) {
                var exp = Math.round(Math.log10(d));
                if (exp >= -1 && exp <= 1) return String(d);
                var s = String(Math.abs(exp)).split('').map(function(c) {
                    return superscripts[parseInt(c)];
                }).join('');
                return '10' + (exp < 0 ? '\u207B' : '') + s;
            };
            this.axis.tickFormat(this.tick_format);
            if (this.g_axisline) {
                this.g_axisline.call(this.axis);
            }
            this.apply_tick_styling();
        } else {
            bqplot.Axis.prototype.tickformat_changed.call(this);
        }
    }

    apply_tick_styling() {
        bqplot.Axis.prototype.apply_tick_styling.call(this);
        this._render_minor_ticks();
    }

    update_color() {
        bqplot.Axis.prototype.update_color.call(this);
        this._render_minor_ticks();
    }

    _render_minor_ticks() {
        if (!this.g_axisline || !this.axis_scale) return;

        this.g_axisline.selectAll('.minor-ticks').remove();

        var scale = this.axis_scale.scale;
        var domain = scale.domain();
        var is_vertical = ['left', 'right'].indexOf(this.model.get('side')) !== -1;
        var side = this.model.get('side');
        var scaleType = this.axis_scale.model.type;
        var domainMin = Math.min(domain[0], domain[1]);
        var domainMax = Math.max(domain[0], domain[1]);

        var minorPositions = [];

        if (scaleType === 'log' && domainMin > 0) {
            var logMin = Math.floor(Math.log10(domainMin));
            var logMax = Math.ceil(Math.log10(domainMax));
            for (var exp = logMin - 1; exp <= logMax; exp++) {
                for (var mult = 2; mult <= 9; mult++) {
                    var val = mult * Math.pow(10, exp);
                    if (val > domainMin && val < domainMax) {
                        minorPositions.push(val);
                    }
                }
            }
        } else if (scaleType === 'linear') {
            var majorTicks = this.axis.tickValues();
            if (majorTicks && majorTicks.length >= 2) {
                var step = Math.abs(majorTicks[1] - majorTicks[0]);
                if (step > 0) {
                    var minorStep = step / 5;
                    var start = majorTicks[0] - step;
                    var end = majorTicks[majorTicks.length - 1] + step;
                    for (var v = start; v <= end + minorStep * 0.01; v += minorStep) {
                        var isMajor = false;
                        for (var j = 0; j < majorTicks.length; j++) {
                            if (Math.abs(majorTicks[j] - v) / step < 0.01) {
                                isMajor = true;
                                break;
                            }
                        }
                        if (!isMajor && v >= domainMin && v <= domainMax) {
                            minorPositions.push(v);
                        }
                    }
                }
            }
        }

        if (minorPositions.length === 0) return;

        var minorTickSize = 4;
        var color = this.model.get('color') || null;
        var minorGroup = this.g_axisline.append('g').attr('class', 'minor-ticks');

        for (var i = 0; i < minorPositions.length; i++) {
            var pixel = scale(minorPositions[i]);
            if (isNaN(pixel) || !isFinite(pixel)) continue;

            var line = minorGroup.append('line');

            if (is_vertical) {
                var signX = side === 'left' ? -1 : 1;
                line.attr('y1', pixel).attr('y2', pixel)
                    .attr('x1', 0).attr('x2', signX * minorTickSize);
            } else {
                var signY = side === 'top' ? -1 : 1;
                line.attr('x1', pixel).attr('x2', pixel)
                    .attr('y1', 0).attr('y2', signY * minorTickSize);
            }

            line.attr('stroke', color || '#000')
                .attr('shape-rendering', 'crispEdges');
        }
    }
}

module.exports = { LinLogAxis };
