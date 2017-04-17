# JVectorMap in Mendix

This widget is a wrapper for the JVectorMap library and you can use it to visualize map data, e.g. heatmaps; or use it as an input to select countries or states instead of the boring dropdown.


## How to configure this in the Modeler??

The data for this widget is always read from context i.e. dataview (non-persitable entities are allowed). You can use a microflow as a source for the dataview or follow an association, this is up to you. 
Note that the object in context needs to have some objects associated to it, so that the widget is able to retrieve the data. I personally used the following domain model, but you can use any entites you like and any names for them or the attributes since they can be configured.

![alt tag](https://raw.githubusercontent.com/gajduk/mxWidget_JVectorMap/master/domainmodel.JPG)

Important: the association has to be many-many and the MapDataSeries entity must be owner (they can also both be owners).

Region Codes are map specific, I do not have a complete list of region code, please consult the JVectorMap for that.
You can specify almost any settings for JVectorMap you want they way you would specify them in a js file.

## How to use the de/select microflows??

You need a special String attirubte in you DataSeries entity e.g. de_selectedRegion - which you can specify in the Behaviour tab.
Then you just need to create two microflows with the context object as the only parameter. Check the test project in this repo for an example.

Explanation (read at your own risk): Because of limitations by the client API, these microflows can only take as input parameter one (non-empty) object. Because some regions will not have an object associated with them, I don't have an object to send when that region is selected. Another approach would be to use Xpath contraint to select the parameters to the microflow but this does not work with non-persistant entites.

## OK I am interested. Can i use this in my project?

Before you include this in your project please have in mind that although I provide copies of the jvectormap.js library and some of the maps **I do not own these jvectormap or any of the maps**. Jvectormap is a licensed product and you have to acquire a license before using it in your commercial project - http://jvectormap.com/licenses-and-pricing/

At this stage this widget is still in beta and thus not available from the marketplace (use at your won risk). When the custom widget is ready I will decide upon a licence.

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
Then I suggest to install grunt (this automates building and delpoying the widget while you are working on it) [https://gruntjs.com/](https://gruntjs.com/) (I have grunt-cli v1.2.0 and grunt v1.0.1).

Once you clone the repository run 
``
npm install
``

