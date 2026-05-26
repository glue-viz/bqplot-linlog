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
        // bqscales' LinearScaleModel declares `type = 'linear'` as a class
        // field initializer that runs after this.initialize completes, so a
        // getter-only property would crash with "Cannot set property type"
        // when the parent constructor body assigns to it. Use a no-op setter
        // so the parent's assignment is silently ignored and our getter wins.
        var self = this;
        Object.defineProperty(this, 'type', {
            get: function () { return self.get('mode') || 'linear'; },
            set: function () { /* parent class field init may write here */ },
            configurable: true,
        });
    }

    _updateGlobalMinMax() {
        // Same class-field-runs-late issue as `type`: bqscales' LinearScaleModel
        // initialises globalMin/globalMax to +/-Infinity after our setListeners
        // runs, so install accessors that compute from `mode` and ignore writes.
        var self = this;
        function logMode() { return self.get('mode') === 'log'; }
        Object.defineProperty(this, 'globalMin', {
            get: function () { return logMode() ? Number.MIN_VALUE : Number.NEGATIVE_INFINITY; },
            set: function () { /* parent class field init may write here */ },
            configurable: true,
        });
        Object.defineProperty(this, 'globalMax', {
            get: function () { return Number.POSITIVE_INFINITY; },
            set: function () { /* parent class field init may write here */ },
            configurable: true,
        });
        // bqplot 0.12 reads these as plain snake_case fields.
        this.global_min = logMode() ? Number.MIN_VALUE : Number.NEGATIVE_INFINITY;
        this.global_max = Number.POSITIVE_INFINITY;
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
