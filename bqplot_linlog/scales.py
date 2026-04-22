from bqplot import LinearScale
from traitlets import Unicode, Enum

from ._version import __version__


class LinLogScale(LinearScale):
    """A scale that can toggle between linear and log modes.

    This allows switching between linear and logarithmic scaling without
    replacing the scale object in a plot.

    Attributes
    ----------
    mode : {'linear', 'log'}
        The current scale mode.
    """

    rtype = 'Number'

    mode = Enum(['linear', 'log'], default_value='linear').tag(sync=True)

    _view_name = Unicode('LinLogScale').tag(sync=True)
    _model_name = Unicode('LinLogScaleModel').tag(sync=True)
    _view_module = Unicode('bqplot-linlog').tag(sync=True)
    _model_module = Unicode('bqplot-linlog').tag(sync=True)
    _view_module_version = Unicode('^' + __version__).tag(sync=True)
    _model_module_version = Unicode('^' + __version__).tag(sync=True)
