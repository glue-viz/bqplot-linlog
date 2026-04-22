import pytest
from bqplot_linlog import LinLogScale, LinLogAxis


class TestLinLogScale:
    def test_default_mode(self):
        s = LinLogScale()
        assert s.mode == 'linear'

    @pytest.mark.parametrize("mode", ['linear', 'log'])
    def test_set_mode(self, mode):
        s = LinLogScale(mode=mode)
        assert s.mode == mode

    def test_switch_mode(self):
        s = LinLogScale(mode='linear')
        s.mode = 'log'
        assert s.mode == 'log'
        s.mode = 'linear'
        assert s.mode == 'linear'

    def test_invalid_mode(self):
        with pytest.raises(Exception):
            LinLogScale(mode='quadratic')

    def test_module_names(self):
        s = LinLogScale()
        assert s._model_module == 'bqplot-linlog'
        assert s._view_module == 'bqplot-linlog'
        assert s._model_name == 'LinLogScaleModel'
        assert s._view_name == 'LinLogScale'

    def test_min_max(self):
        s = LinLogScale(min=0.1, max=100)
        assert s.min == 0.1
        assert s.max == 100


class TestLinLogAxis:
    def test_creation(self):
        s = LinLogScale()
        a = LinLogAxis(scale=s)
        assert a._model_module == 'bqplot-linlog'
        assert a._view_module == 'bqplot-linlog'
        assert a._model_name == 'LinLogAxisModel'
        assert a._view_name == 'LinLogAxis'

    @pytest.mark.parametrize("side", ['bottom', 'top', 'left', 'right'])
    def test_sides(self, side):
        s = LinLogScale()
        a = LinLogAxis(scale=s, side=side)
        assert a.side == side

    def test_accepts_linlog_scale(self):
        s = LinLogScale(mode='log')
        a = LinLogAxis(scale=s)
        assert a.scale is s
