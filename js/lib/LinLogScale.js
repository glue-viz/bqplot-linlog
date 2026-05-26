var d3 = require('d3');
var bqplot = require('bqplot');

class LinLogScale extends bqplot.LinearScale {
    render() {
        this._create_d3_scale();
        if (this.model.domain.length > 0) {
            this.scale.domain(this.model.domain);
        }
        this.offset = 0;
        this.create_event_listeners();
    }

    _create_d3_scale() {
        if (this.model.get('mode') === 'log') {
            this.scale = d3.scaleLog();
        } else {
            this.scale = d3.scaleLinear();
        }
    }

    create_event_listeners() {
        // bqplot 0.13 (bqscales) renamed create_event_listeners to createEventListeners.
        var parentProto = bqplot.Scale.prototype;
        if (typeof parentProto.createEventListeners === 'function') {
            parentProto.createEventListeners.call(this);
        } else {
            parentProto.create_event_listeners.call(this);
        }
        this.listenTo(this.model, 'change:mode', this._mode_changed);
    }

    _mode_changed() {
        var range = this.scale.range();
        this._create_d3_scale();
        this.scale.range(range);
        if (this.model.domain.length > 0) {
            this.scale.domain(this.model.domain);
        }
        this.trigger('domain_changed');
    }
}

module.exports = { LinLogScale };
