import playwright.sync_api
from IPython.display import display
import numpy as np
import pytest

from .helpers import visual_ui_test


@pytest.mark.parametrize("grid_lines", ["none", "solid"])
@visual_ui_test
def test_linlog_linear_mode(
    solara_test,
    page_session: playwright.sync_api.Page,
    grid_lines,
):
    """LinLogScale in linear mode with minor ticks on both axes."""
    from bqplot import Figure, Lines
    from bqplot_linlog import LinLogScale, LinLogAxis

    scale_x = LinLogScale(mode='linear', min=0, max=10)
    scale_y = LinLogScale(mode='linear', min=-1, max=1)
    scales = {"x": scale_x, "y": scale_y}

    axis_x = LinLogAxis(scale=scale_x, label="x", side="bottom", grid_lines=grid_lines)
    axis_y = LinLogAxis(scale=scale_y, label="y", side="left", grid_lines=grid_lines)

    x = np.linspace(0, 10, 200)
    y = np.sin(2 * np.pi * x / 5)
    line = Lines(x=x, y=y, scales=scales, colors=["steelblue"])

    figure = Figure(scales=scales, axes=[axis_x, axis_y], marks=[line])

    display(figure)

    svg = page_session.locator(".bqplot")
    svg.wait_for()
    page_session.wait_for_timeout(200)
    return svg.screenshot()


@pytest.mark.parametrize("grid_lines", ["none", "solid"])
@visual_ui_test
def test_linlog_log_mode(
    solara_test,
    page_session: playwright.sync_api.Page,
    grid_lines,
):
    """LinLogScale in log mode with powers-of-10 labels and minor ticks."""
    from bqplot import Figure, Lines
    from bqplot_linlog import LinLogScale, LinLogAxis

    scale_x = LinLogScale(mode='log', min=1, max=1e5)
    scale_y = LinLogScale(mode='log', min=0.1, max=1e4)
    scales = {"x": scale_x, "y": scale_y}

    axis_x = LinLogAxis(scale=scale_x, label="x", side="bottom", grid_lines=grid_lines)
    axis_y = LinLogAxis(scale=scale_y, label="y", side="left", grid_lines=grid_lines)

    x = np.logspace(0, 5, 200)
    y = 0.5 * x ** 0.75
    line = Lines(x=x, y=y, scales=scales, colors=["crimson"])

    figure = Figure(scales=scales, axes=[axis_x, axis_y], marks=[line])

    display(figure)

    svg = page_session.locator(".bqplot")
    svg.wait_for()
    page_session.wait_for_timeout(200)
    return svg.screenshot()


@visual_ui_test
def test_linlog_switch_to_log(
    solara_test,
    page_session: playwright.sync_api.Page,
):
    """Start in linear mode, switch to log, verify the plot updates."""
    from bqplot import Figure, Lines
    from bqplot_linlog import LinLogScale, LinLogAxis

    scale_x = LinLogScale(mode='linear', min=1, max=100)
    scale_y = LinLogScale(mode='linear', min=1, max=1000)
    scales = {"x": scale_x, "y": scale_y}

    axis_x = LinLogAxis(scale=scale_x, label="x", side="bottom")
    axis_y = LinLogAxis(scale=scale_y, label="y", side="left")

    x = np.linspace(1, 100, 100)
    y = x ** 2
    line = Lines(x=x, y=y, scales=scales, colors=["seagreen"])

    figure = Figure(scales=scales, axes=[axis_x, axis_y], marks=[line])

    display(figure)

    svg = page_session.locator(".bqplot")
    svg.wait_for()
    page_session.wait_for_timeout(200)

    # Switch both axes to log
    scale_x.mode = 'log'
    scale_y.mode = 'log'
    page_session.wait_for_timeout(500)

    return svg.screenshot()


@visual_ui_test
def test_linlog_switch_to_linear(
    solara_test,
    page_session: playwright.sync_api.Page,
):
    """Start in log mode, switch to linear, verify the plot updates."""
    from bqplot import Figure, Lines
    from bqplot_linlog import LinLogScale, LinLogAxis

    scale_x = LinLogScale(mode='log', min=1, max=1000)
    scale_y = LinLogScale(mode='log', min=0.01, max=100)
    scales = {"x": scale_x, "y": scale_y}

    axis_x = LinLogAxis(scale=scale_x, label="x", side="bottom")
    axis_y = LinLogAxis(scale=scale_y, label="y", side="left")

    x = np.logspace(0, 3, 100)
    y = 0.01 * x ** 1.5
    line = Lines(x=x, y=y, scales=scales, colors=["darkorange"])

    figure = Figure(scales=scales, axes=[axis_x, axis_y], marks=[line])

    display(figure)

    svg = page_session.locator(".bqplot")
    svg.wait_for()
    page_session.wait_for_timeout(200)

    # Switch to linear
    scale_x.mode = 'linear'
    scale_y.mode = 'linear'
    page_session.wait_for_timeout(500)

    return svg.screenshot()
