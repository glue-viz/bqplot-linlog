from ._version import __version__  # noqa

from .scales import *  # noqa
from .axes import *  # noqa


def _prefix():
    import sys
    from pathlib import Path

    prefix = sys.prefix
    here = Path(__file__).parent
    # for when in dev mode
    if (here.parent / "share/jupyter/nbextensions/bqplot-linlog").exists():
        prefix = here.parent
    return prefix


def _jupyter_labextension_paths():
    return [
        {
            "src": f"{_prefix()}/share/jupyter/labextensions/bqplot-linlog/",
            "dest": "bqplot-linlog",
        }
    ]


def _jupyter_nbextension_paths():
    return [
        {
            "section": "notebook",
            "src": f"{_prefix()}/share/jupyter/nbextensions/bqplot-linlog/",
            "dest": "bqplot-linlog",
            "require": "bqplot-linlog/extension",
        }
    ]
