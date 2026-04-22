from bqplot import Axis
from traitlets import Unicode

from ._version import __version__


class LinLogAxis(Axis):
    """An axis with minor tick support.

    When used with a log scale, major ticks are shown at powers of 10 only,
    with minor ticks at 2-9 times each power. When used with a linear scale,
    minor ticks subdivide major tick intervals.
    """

    _view_name = Unicode('LinLogAxis').tag(sync=True)
    _model_name = Unicode('LinLogAxisModel').tag(sync=True)
    _view_module = Unicode('bqplot-linlog').tag(sync=True)
    _model_module = Unicode('bqplot-linlog').tag(sync=True)
    _view_module_version = Unicode('^' + __version__).tag(sync=True)
    _model_module_version = Unicode('^' + __version__).tag(sync=True)
