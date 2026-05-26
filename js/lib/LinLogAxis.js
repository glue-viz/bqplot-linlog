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
        // For log scales without explicit tick_format, use 10^n notation.
        // The exponent is emitted as ASCII "10^N" here and converted to an
        // SVG <tspan baseline-shift="super"> by _render_tick_superscripts,
        // because chromium's default headless font is missing Unicode
        // superscript glyphs above U+2073.
        if (this.axis_scale && this.axis_scale.model.type === 'log' &&
            !this.model.get('tick_format')) {
            this.tick_format = function(d) {
                var exp = Math.round(Math.log10(d));
                if (exp >= -1 && exp <= 1) return String(d);
                return '10^' + exp;
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

    _render_tick_superscripts() {
        if (!this.g_axisline) return;
        var SVG_NS = 'http://www.w3.org/2000/svg';
        this.g_axisline.selectAll('.tick text').each(function () {
            var match = /^10\^(-?\d+)$/.exec(this.textContent);
            if (!match) return;
            while (this.firstChild) this.removeChild(this.firstChild);
            this.appendChild(document.createTextNode('10'));
            var tspan = document.createElementNS(SVG_NS, 'tspan');
            tspan.setAttribute('baseline-shift', 'super');
            tspan.setAttribute('font-size', '70%');
            tspan.textContent = match[1];
            this.appendChild(tspan);
        });
    }

    update_grid_lines(animate) {
        // Use longer major ticks (10px) when grid lines are off,
        // so they are clearly distinct from minor ticks (4px).
        var grid_type = this.model.get('grid_lines');
        if (grid_type === 'none') {
            this.axis.tickSize(10);
        }
        bqplot.Axis.prototype.update_grid_lines.call(this, animate);
    }

    apply_tick_styling() {
        bqplot.Axis.prototype.apply_tick_styling.call(this);
        this._render_tick_superscripts();
        this._install_superscript_observer();
        this._render_minor_ticks();
    }

    _install_superscript_observer() {
        // bqplot's getBBox and update_grid_lines re-render g_axisline without
        // going through apply_tick_styling, so our tspans get wiped. Watch the
        // axis for any change and re-apply only when a "10^N" marker reappears
        // (the guard prevents a feedback loop on our own mutations).
        if (this._superscript_observer || !this.g_axisline) return;
        var self = this;
        this._superscript_observer = new MutationObserver(function () {
            var nodes = self.g_axisline.selectAll('.tick text').nodes();
            for (var i = 0; i < nodes.length; i++) {
                if (/^10\^(-?\d+)$/.test(nodes[i].textContent)) {
                    self._render_tick_superscripts();
                    return;
                }
            }
        });
        this._superscript_observer.observe(this.g_axisline.node(), {
            childList: true, subtree: true, characterData: true,
        });
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
        var grid_lines = this.model.get('grid_lines');
        var hasGrid = grid_lines !== 'none';
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

        // When grid lines are present, draw minor grid lines spanning the
        // full plot area at half opacity. Otherwise draw short tick marks.
        var minorTickSize;
        if (hasGrid) {
            minorTickSize = is_vertical ? this.width : this.height;
        } else {
            minorTickSize = 4;
        }

        var color = this.model.get('color') || null;
        var minorGroup = this.g_axisline.append('g').attr('class', 'minor-ticks');

        // Read the actual style from the major grid lines so we match exactly
        var majorStroke = null;
        var majorOpacity = null;
        if (hasGrid) {
            var majorLine = this.g_axisline.select('.tick line');
            if (!majorLine.empty()) {
                majorStroke = majorLine.style('stroke');
                majorOpacity = parseFloat(majorLine.style('opacity'));
                if (isNaN(majorOpacity)) majorOpacity = 1;
            }
        }

        for (var i = 0; i < minorPositions.length; i++) {
            var pixel = scale(minorPositions[i]);
            if (isNaN(pixel) || !isFinite(pixel)) continue;

            var line = minorGroup.append('line');

            if (is_vertical) {
                // Grid: extend into plot (right for left axis, left for right)
                // Ticks: extend away from plot
                var signX = hasGrid
                    ? (side === 'left' ? 1 : -1)
                    : (side === 'left' ? -1 : 1);
                line.attr('y1', pixel).attr('y2', pixel)
                    .attr('x1', 0).attr('x2', signX * minorTickSize);
            } else {
                // Grid: extend into plot (up for bottom axis, down for top)
                // Ticks: extend away from plot
                var signY = hasGrid
                    ? (side === 'bottom' ? -1 : 1)
                    : (side === 'top' ? -1 : 1);
                line.attr('x1', pixel).attr('x2', pixel)
                    .attr('y1', 0).attr('y2', signY * minorTickSize);
            }

            if (hasGrid) {
                line.style('stroke', majorStroke || '#000')
                    .style('opacity', (majorOpacity || 1) * 0.5)
                    .style('stroke-dasharray', grid_lines === 'dashed' ? '5, 5' : null);
            } else {
                line.attr('stroke', color || '#000');
            }
            line.attr('shape-rendering', 'crispEdges');
        }
    }
}

module.exports = { LinLogAxis };
