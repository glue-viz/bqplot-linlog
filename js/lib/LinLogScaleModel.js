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

    // bqplot 0.12: ScaleModel.initialize calls set_init_state() then set_listeners().
    set_init_state() {
        this._installTypeGetter();
        this._updateGlobalMinMax();
    }

    set_listeners() {
        bqplot.LinearScaleModel.prototype.set_listeners.call(this);
        this.on('change:mode', this._mode_changed, this);
    }

    // bqplot 0.13 (bqscales): ScaleModel.initialize calls setListeners() only;
    // there is no set_init_state hook, so do that work here before delegating
    // so the parent's initial updateDomain sees the right global_min/max.
    setListeners() {
        this._installTypeGetter();
        this._updateGlobalMinMax();
        bqplot.LinearScaleModel.prototype.setListeners.call(this);
        this.on('change:mode', this._mode_changed, this);
    }

    _installTypeGetter() {
        Object.defineProperty(this, 'type', {
            get: () => this.get('mode') || 'linear',
            configurable: true,
        });
    }

    _updateGlobalMinMax() {
        var min = this.get('mode') === 'log'
            ? Number.MIN_VALUE
            : Number.NEGATIVE_INFINITY;
        var max = Number.POSITIVE_INFINITY;
        // Set both naming conventions so the right property is read in either API.
        this.global_min = min;
        this.global_max = max;
        this.globalMin = min;
        this.globalMax = max;
    }

    _mode_changed() {
        this._updateGlobalMinMax();
        // update_domain exists in 0.12 and as a deprecated alias in bqscales 0.13.
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
