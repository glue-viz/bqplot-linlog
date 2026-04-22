var bqplot = require('bqplot');
var version = require('./version').version;

class LinLogScaleModel extends bqplot.LinearScaleModel {
    defaults() {
        return {
            ...bqplot.LinearScaleModel.prototype.defaults(),
            _model_name: 'LinLogScaleModel',
            _view_name: 'LinLogScale',
            _model_module: 'bqplot-linlog',
            _view_module: 'bqplot-linlog',
            _model_module_version: version,
            _view_module_version: version,
            mode: 'linear',
        };
    }

    set_init_state() {
        // Override: make type dynamic based on mode
        Object.defineProperty(this, 'type', {
            get: () => this.get('mode') || 'linear',
            configurable: true,
        });
        this._update_global_min_max();
    }

    set_listeners() {
        bqplot.LinearScaleModel.prototype.set_listeners.call(this);
        this.on('change:mode', this._mode_changed, this);
    }

    _update_global_min_max() {
        if (this.get('mode') === 'log') {
            this.global_min = Number.MIN_VALUE;
        } else {
            this.global_min = Number.NEGATIVE_INFINITY;
        }
        this.global_max = Number.POSITIVE_INFINITY;
    }

    _mode_changed() {
        this._update_global_min_max();
        this.update_domain();
        // Ensure domain is valid for log mode
        if (this.get('mode') === 'log' && this.domain.length >= 2) {
            var dmin = Math.min(this.domain[0], this.domain[1]);
            if (dmin <= 0) {
                var dmax = Math.max(this.domain[0], this.domain[1]);
                var newMin = dmax > 0 ? dmax / 1000 : 1;
                var newMax = dmax > 0 ? dmax : 10;
                this.domain = this.reverse ? [newMax, newMin] : [newMin, newMax];
                this.trigger('domain_changed', this.domain);
            }
        }
    }
}

module.exports = { LinLogScaleModel };
