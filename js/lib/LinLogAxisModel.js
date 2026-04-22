var bqplot = require('bqplot');
var version = require('./version').version;

class LinLogAxisModel extends bqplot.AxisModel {
    defaults() {
        return {
            ...bqplot.AxisModel.prototype.defaults(),
            _model_name: 'LinLogAxisModel',
            _view_name: 'LinLogAxis',
            _model_module: 'bqplot-linlog',
            _view_module: 'bqplot-linlog',
            _model_module_version: version,
            _view_module_version: version,
        };
    }
}

module.exports = { LinLogAxisModel };
