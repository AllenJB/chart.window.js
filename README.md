# chart.window.js
Preview window plugin for [Chart.js v2](https://github.com/chartjs/Chart.js). 

Currently works but still in development. Feedback welcome.

Combines with the [Pan and Zoom plugin](https://github.com/chartjs/Chart.Zoom.js) to allow 2 charts to be linked together,
with one showing the entire data range while the other shows a detailed "window" on a shorter time range.

Clicking on the preview chart will move the position of the window.

## Known Issues
* Only handle panning the time axis, not zoom - the "window" view is always 100% height
* Only handles simple charts with 1 x and y axis.
* Only handles time-based graphs
* Window indicator style is currently not configurable
* Window indicator jumps instantly instead of scrolling

## To Do
* Fix known issues
* Link series hiding (so hiding a series on the window chart also hides it on the preview chart)
