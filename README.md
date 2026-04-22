# bqplot-linlog

**Note: this package is experimental and the API may change.**

A toggleable linear/log scale and axis with minor ticks for bqplot.

## Features

- **LinLogScale**: A scale that can switch between linear and log modes without replacing scale objects
- **LinLogAxis**: An axis with minor tick support — log mode shows powers-of-10 labels with 10ⁿ notation and standard minor ticks; linear mode shows minor ticks subdividing major intervals

## Installation

```bash
pip install bqplot-linlog
```

## Usage

```python
from bqplot import Figure, Lines
from bqplot_linlog import LinLogScale, LinLogAxis

scale_x = LinLogScale(mode='linear')
scale_y = LinLogScale(mode='log')

axis_x = LinLogAxis(scale=scale_x, side='bottom')
axis_y = LinLogAxis(scale=scale_y, side='left')

line = Lines(x=x, y=y, scales={'x': scale_x, 'y': scale_y})
figure = Figure(axes=[axis_x, axis_y], marks=[line])

# Toggle at any time:
scale_y.mode = 'linear'
```
