# JVectorMap in Mendix

This widget is a wrapper for the [JVectorMap library](http://jvectormap.com/) and you can use it to visualize map data, e.g. heatmaps; or use it as an input element to select countries or states instead of the boring dropdown.

## How to configure this in the Modeler??

The data for this widget is always read from context i.e. a dataview (non-persistable entities are allowed). You can use a microflow as a source for the dataview or follow an association, this is up to you. 
Note that the object in context needs to have some objects associated to it, so that the widget is able to retrieve the data. I personally used the following domain model, but you can use any entities you like and any names for them or the attributes since they can be configured.

![alt tag](https://raw.githubusercontent.com/gajduk/mxWidget_JVectorMap/master/domainmodel.JPG)

Important: the association has to be many-many and the MapDataSeries entity must be owner (they can also both be owners).

Region Codes are map specific, I do not have a complete list of region codes, please consult [the JVectorMap webiste](http://jvectormap.com/maps/) for that.
You can specify almost any settings for JVectorMap you want as json from the modeler.

## How to use the de/select microflows??

You need a special String attribute in you DataSeries entity e.g. de_selectedRegion - which you can specify in the Behaviour tab.
Then you just need to create two microflows with the context object as the only parameter. Check the test project in this repo for an example.

Explanation (read at your own risk): Because of limitations by the client API, these microflows can only take as input parameter one (non-empty) object. Because some regions will not have an object associated with them, I don't have an object to send when that region is selected. Another approach would be to use Xpath constraints to select the parameters to the microflow, but this does not work with non-persistable entites.

## This is exactly what I was looking for. Can I use this in my project?

Before you include this in your project please have in mind that although I provide copies of the jvectormap.js library and some of the maps **I do not own these jvectormap or any of the maps**. Jvectormap is a licensed product and you have to acquire a license before using it in your commercial project - http://jvectormap.com/licenses-and-pricing/

At this stage this widget is still in beta and thus not available from the marketplace (use at your own risk). When the custom widget is ready, I will decide upon a license.

## I understand the risks, I still want to use this in my project.

Download the ``JVectorMapTest\widgets\jVectorMapWidget.mpk file`` and put it in the widgets folder of your own Mendix project. Reload the project from disk (F4 from the Modeler) and fire free.

## What version of Mendix are we talking about here??

I have only tested 6.0.1. I expect to work in all 6.something versions but haven't tested it.

## Do you plan to add new features??

Of course. Next on my list is the ability to add custom maps. 
Please let me know if you want a specific feature.

## Contributing

For more information on contributing to this repository visit [Contributing to a GitHub repository](https://world.mendix.com/display/howto50/Contributing+to+a+GitHub+repository)!

##Making modifications to the widget

[In order to make changes to the widget you need to get familiar with custom widget development for Mendix. This is a good place to start https://docs.mendix.com/howto50/creating-a-basic-hello-world-custom-widget](https://docs.mendix.com/howto50/creating-a-basic-hello-world-custom-widget). 

Make sure to have Node.js installed [https://nodejs.org/en/download/](https://nodejs.org/en/download/) (I have version 6.9.1 , not sure which other versions work).
Then I suggest to install grunt (this automates building and deploying the widget while you are working on it) [https://gruntjs.com/](https://gruntjs.com/) (I have grunt-cli v1.2.0 and grunt v1.0.1).

Once you clone the repository run 
``
npm install
``

this installs any node dependncies. Finally, run ``grunt build`` followed by ``grunt watch``. THis builds the latest version of the modeler and watches for any changes to the source files. You can now make changes to the widget and see them in the modeler. Note: you do not have to restart the app everytime you make changes to js or css code, just clear the browser cache and refresh ctrl+f5. When you make changes to the xml you have to restart the app.
