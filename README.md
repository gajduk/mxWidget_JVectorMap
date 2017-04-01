# Mendix JVectroMap Widget

This widget is a wrapper for the JVectorMap library and you can use it to visualize map data, e.g. heatmaps.

## Configuration

The data for this widget is read from context - non-persitable object are allowed. You can use a microflow as a source for the dataview or association it is up to you. Note that the object in context needs to have some objects associated to it, so that the widget is able to retrieve the data. I personally used the following domain model, but you can use any entites you like and any names for them or the attributes since they can be configured.

Region Codes are map specific, I do not have a complete list of region code, please consult the JVectorMap for that.
You can specify almost any settings for JVectorMap you want they way you would specify them in a js file.


## Future plans

Add widht/height and onclick microflows. Please let me know if you want a specific feature.


## Contributing

For more information on contributing to this repository visit [Contributing to a GitHub repository](https://world.mendix.com/display/howto50/Contributing+to+a+GitHub+repository)!

##Making modifications to the widget

[In order to make changes to the widget you need to get familiar with custom widget development for Mendix. This is a good place to start https://docs.mendix.com/howto50/creating-a-basic-hello-world-custom-widget](https://docs.mendix.com/howto50/creating-a-basic-hello-world-custom-widget). 

Make sure to have Node.js installed [https://nodejs.org/en/download/](https://nodejs.org/en/download/) (I have version 6.9.1 , not sure which other versions work).
Then I suggest to install grunt (this automates building and delpoying the widget while you are working on it) [https://gruntjs.com/](https://gruntjs.com/) (I have grunt-cli v1.2.0 and grunt v1.0.1).

Once you clone the repository run 
``
npm install
``

## Typical usage scenario

This widget is still in development.

