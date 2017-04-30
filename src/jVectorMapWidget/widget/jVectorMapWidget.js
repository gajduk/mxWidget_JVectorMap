/*
    MyWidget
    ========================

    @file      : MyWidget.js
    @version   : 1.0.0
    @author    : <You>
    @date      : 2017-02-16
    @copyright : <Your Company> 2016
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/lang",
    "dojo/html",
    "dojo/_base/event",

    "jVectorMapWidget/lib/jquery-1.11.2",
    "jVectorMapWidget/lib/jquery-jvectormap-2.0.3.min",
    "jVectorMapWidget/lib/utils",
    "dojo/text!jVectorMapWidget/widget/template/jVectorMapWidget.html"
], function (declare, _WidgetBase, _TemplatedMixin, dojoStyle, dojoConstruct, lang, dojoHtml, dojoEvent, _jQuery, __jVectorMap, utils, widgetTemplate) {
    "use strict";

    var maps_directory = "widgets/jVectorMapWidget/lib/maps/";
    var $ = _jQuery.noConflict(mx.version.substring(0,1)>6);//for Mendix versions <6 this needs to be fals otherwise the maps wont load
    //for Mendix versions affter 7 this needs to be true otherwise jQuery doesn't load correctly
    var maps_to_url={ "North_America":"north_america", "Continents":"continents", "Africa":"africa", "Austria":"at", "Europe":"europe", "Belgium":"be", "Asia":"asia", "World":"world", "Australia":"au", "Argentina":"ar", "South_America":"south_america", "Oceania":"oceania", "China":"cn", "Italy_Regions":"it_regions", "New_York_City":"us-ny-newyork", "Chicago":"us-il-chicago", "Venezuela":"ve", "USA":"us-aea.js", "United_Kingdom":"uk_countries", "Thailand":"th", "United_Kingdom_Regions":"uk_regions", "Switzerland":"ch", "Spain":"es", "Sweden":"se", "South_Korea":"kr", "South_Africa":"za", "Russia":"ru", "Russia_Federal_Districts":"ru_fd", "Portugal":"pt", "Poland":"pl", "Norway":"no", "New_Zealand":"nz", "Netherlands":"nl", "India":"in", "Germany":"de", "France_Regions":"fr_regions", "Italy_Provinces":"it", "France_Regions_2016":"fr_regions_2016", "France_Departments":"fr", "Denmark":"dk", "Colombia":"co-"};
    // Declare widget's prototype.
    return declare("jVectorMapWidget.widget.jVectorMapWidget", [ _WidgetBase, _TemplatedMixin ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // DOM elements
        mapContainer: null,

        // Parameters configured in the Modeler.
        //----------------------------
        //**aAta source**
        mapDataPointsAssociation: "",//these entites hold the catual region data
        valueAttribute: "",//which attribute in the entity at the end of mapDataPointsAssociation should be used as value
        codeAttribute: "",//which attribute in the entity at the end of mapDataPointsAssociation should be used to identify the region

        //**Looks
        tooltip: "",//tooltip message
        undefined_label: "",//if a region does not have associated data what to display
        mapName: "",//which map to use, e.g. united_states, world
        mapType: "",//which map type to use, i.e. Miller or Mercator
        custom_setings: "",//settings defined in the modeler

        //**Slecting and deselecting regions
        onselectmicroflow: "",
        ondeselectmicroflow: "",
        multiSelect: "",


        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _contextObj: null,//the widget reuires a data context
        _alertDiv: null,//used to display a message to the user

        _map: null,//the actual map object
        values:  {},//current values
        _selectedRegions: [],
        _currentSettings: {},//used when resizing the map to recreate it

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            utils.debug(this.id + ".constructor");
        },

        //called whenever the region has been selected or deselected
        _regionSelected: function() {
            var self = this;

            //if we are doing modyfications programatically than do not handle this
            if ( self.modyfyingSelection ) return;
            var selectedRegions = self.map.getSelectedRegions();
            if ( typeof selectedRegions == "undefined" ) return;

            if ( self._selectedRegions.length > selectedRegions.length ) {
              //something was deselected
              var deSelectedRegion = utils.arrayDiff(self._selectedRegions,selectedRegions);
              self._updateRuntimeAndCallMicroflow(self.ondeselectmicroflow,deSelectedRegion);
            }
            else {
                //something was selected
                var selectedRegion = utils.arrayDiff(selectedRegions,self._selectedRegions);
                self._updateRuntimeAndCallMicroflow(self.onselectmicroflow,selectedRegion);
            }
            self._selectedRegions = selectedRegions;
        },

        //sends the selected region "value" to Mendix and then calls the microflow_name, apssing the current context object as param
        _updateRuntimeAndCallMicroflow: function(microflow_name,value) {
            var self = this;
            if (typeof value == "undefined" ) return;
            if ( utils.notSet(microflow_name) ) return;
            if ( utils.notSet(self.selectedAttribute) ) return;
            self._contextObj.set(self.selectedAttribute,value);
            mx.data.commit({
              mxobj: self._contextObj,
              callback: function() {
                utils.debug("object commited. now calling microflow");
                utils.executeMicroflow(microflow_name,null,self._contextObj);
              },
              error: function(e) {
                  utils.debug("object commit failed");
              }
            });
        },

        //merges the custom defined json settings from the modeler with default settings, and adds handlers for selecting regions
        _createSettings(real_map_name) {
            var self = this;
            var settings = {};
            var temp_settings = self.customSettings;
            try {settings=JSON.parse(temp_settings);}
            catch(err) { console.error("Custom settings malformed:"+err); }
            //we need to set the vales in { series -> regions[0] -> values
            if ( "series" in settings ) {
              if ( "regions" in settings.series ) {
                var regs = settings.series.regions;
                if ( regs.length == 0 ) regs.push({ values : self.values });
                else regs[0].values = self.values;
              }
              else {
                settings.regions = [ { values : self.values } ];
              }
            }
            else {
                settings.series = {"regions": [ { "values" : self.values } ] };
            }
            //setting the tooltip
            settings.onRegionTipShow = function(e, el, code){
                var tooltip = self.tooltip;
                tooltip = tooltip.replace("$Name",el.html());
                tooltip = tooltip.replace("$Code",code);
                var value = ""+self.values[code];
                if ( "undefined" === typeof self.values[code] )
                    value = self.undefined_label;
                tooltip = tooltip.replace("$Value",value);
                el.html(tooltip);
            }
            //handling selecting and deselecting regions
            if ( ! utils.notSet(self.onselectmicroflow) ) {
              settings.regionsSelectable = true;
              if ( self.multiSelect == "no" )
                settings.regionsSelectableOne = true;
              settings.onRegionSelected = function() {
                self._regionSelected();
              };
            }
            settings.map = real_map_name.replace("-", "_");
            self._currentSettings = settings;
        },

        //creates the map with currentSettings and sets the selected regions (can be used to recreate the map)
        _createMap: function() {
            var self = this;
            if ( self.map ) self.map.remove();
            $(self.mapContainer).vectorMap(self._currentSettings);
            self.map = $(self.mapContainer).vectorMap('get','mapObject');
            self.modyfyingSelection = true;
            self.map.setSelectedRegions(self._selectedRegions);
            self.modyfyingSelection = false;
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Set default values here and load the map
        postCreate: function () {
            var self = this;
            utils.debug(this.id + ".postCreate");

            //set default values
            utils.setIfUndefined(self,"mapDataPointsAssociation", "JVectorMap.DataPoint_DataSeries");
            utils.setIfUndefined(self,"valueAttribute", "Value");
            utils.setIfUndefined(self,"codeAttribute", "RegionCode");

            var real_map_name = maps_to_url[self.mapName]+"-"+self.mapType;

            if ( self.mapName == "Canada" )
              real_map_name = "ca-lcc";
            utils.debug(real_map_name);

            //load the correct map
            $.getScript( maps_directory+"jquery-jvectormap-"+real_map_name+".js", function( data, textSatus, jqxhr ) {
              self._createSettings(real_map_name);
              self._createMap();
              self.set("loaded");//used by mendix
              self._updateRendering();
            });

        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            var self = this;
            utils.debug(self.id + ".update");

            self._contextObj = obj;

            self._resetSubscriptions();
            self._updateRendering(callback);// We're passing the callback to updateRendering to be called after DOM-manipulation
        },

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function (box) {
          utils.debug(this.id + ".resize");
          //the simplest way to resize the map is to recreate it
          var self = this;
          self.mapContainer.style.width = self.mapContainer.parentNode.clientWidth+"px";
          self.mapContainer.style.height = self.mapContainer.parentNode.clientHeight+"px";
          self._createMap();
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
          utils.debug(this.id + ".uninitialize");
          this.map.remove();//we just remove the map
          // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        // We want to stop events on a mobile device
        _stopBubblingEventOnMobile: function (e) {
            utils.debug(this.id + "._stopBubblingEventOnMobile");
            if (typeof document.ontouchstart !== "undefined") {
                dojoEvent.stop(e);
            }
        },

        //loads the region data from Mendix, and populates self.values
        _loadData: function(callback) {
          var self = this;
          mx.data.get({
              // xpath: "//JVectorMap.MapDataPoint["+this._contextObj._guid+"=JVectorMap.DataPoint_DataSeries]",\
              path: self.mapDataPointsAssociation.split("/").slice(0, -1).join("/"),
              guid: this._contextObj._guid,
              callback: function(objs) {
                var new_values = {};
                var any_diff = false;
                for ( var i = 0 ; i < objs.length ; ++i ) {
                    var o = objs[i];
                    var key = o.get(self.codeAttribute);
                    var value = parseFloat(o.get(self.valueAttribute));
                    new_values[key] = value;
                    if ( typeof(self.values[key]) == 'undefined' || self.values[key] != value ) any_diff = true;
                }
                self.values = new_values;
                if ( any_diff ) {
                  callback();
                }
              }
            });
        },

        //tries to redraw the map with new values, if the map is not loaded or initialized it waits 100ms then ries again (x5)
        _redrawMap: function(max_tries,current_try) {
          var self = this;
          if ( self.map != null ) {
            var min_ = utils.safeMin(self.values);
            var max_ = utils.safeMax(self.values);
            self.map.series.regions[0].clear();
            self.map.series.regions[0].params.min = min_;
            self.map.series.regions[0].params.max = max_;
            self.map.series.regions[0].setValues(self.values);
           }
           else {
             if ( max_tries > current_try )
             setTimeout(function () {self._redrawMap(max_tries,current_try+1)},(current_try+1)*200);
           }
        },

        // Rerender the interface. Called when the context object has been refreshed in the client
        _updateRendering: function (callback) {
            var self = this;
            utils.debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");
                self._loadData(function () {
                  self._redrawMap(10,0);
                });
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            // The callback, coming from update, needs to be executed, to let the page know it finished rendering
            utils.executeCallback(callback, "_updateRendering");
        },

        // Show an error message. - not used right now
        _showError: function (message) {
            utils.debug(this.id + "._showError");
            if (this._alertDiv !== null) {
                dojoHtml.set(this._alertDiv, message);
                return true;
            }
            this._alertDiv = dojoConstruct.create("div", {
                "class": "alert alert-danger",
                "innerHTML": message
            });
            dojoConstruct.place(this._alertDiv, this.domNode);
        },

        // Reset subscriptions.
        _resetSubscriptions: function () {
            utils.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            this.unsubscribeAll();

            // When a mendix object exists create subscribtions.
            if (this._contextObj) {
                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: lang.hitch(this, function (guid) {
                        this._updateRendering();
                    })
                });
            }
        },


    });
});

require(["jVectorMapWidget/widget/jVectorMapWidget"]);
