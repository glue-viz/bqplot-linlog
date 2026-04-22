var bqplot_linlog = require('./index');
var base = require('@jupyter-widgets/base');

module.exports = {
  id: 'bqplot-linlog',
  requires: [base.IJupyterWidgetRegistry],
  activate: function(app, widgets) {
      widgets.registerWidget({
          name: 'bqplot-linlog',
          version: bqplot_linlog.version,
          exports: bqplot_linlog
      });
  },
  autoStart: true
};
