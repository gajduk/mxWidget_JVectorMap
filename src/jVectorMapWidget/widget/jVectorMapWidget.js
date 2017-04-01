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

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "jVectorMapWidget/lib/jquery-1.11.2",
    "jVectorMapWidget/lib/jquery-jvectormap-2.0.3.min",
    "dojo/text!jVectorMapWidget/widget/template/jVectorMapWidget.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, _jQuery, __jVectorMap, widgetTemplate) {
    "use strict";
    var _debug =  function(message) {
       if ( true ) {
         console.log(JSON.stringify(message,null,4));
       }
    };

    var maps_directory = "widgets/jVectorMapWidget/lib/maps/";
    var $ = _jQuery.noConflict(false);//if its true, then maps will not load
    var maps_to_url={"North_America":"north_america",
                            "Continents":"continents",
                            "Africa":"africa",
                            "Austria":"at",
                            "Europe":"europe",
                            "Belgium":"be",
                            "Asia":"asia",
                            "World":"world",
                            "Australia":"au",
                            "Argentina":"ar",
                            "South_America":"south_america",
                            "Oceania":"oceania",
                            "China":"cn",
                            "Italy_Regions":"it_regions",
                            "New_York_City":"us-ny-newyork",
                            "Chicago":"us-il-chicago",
                            "Venezuela":"ve",
                            "USA":"us-aea.js",
                            "United_Kingdom":"uk_countries",
                            "Thailand":"th",
                            "United_Kingdom_Regions":"uk_regions",
                            "Switzerland":"ch",
                            "Spain":"es",
                            "Sweden":"se",
                            "South_Korea":"kr",
                            "South_Africa":"za",
                            "Russia":"ru",
                            "Russia_Federal_Districts":"ru_fd",
                            "Portugal":"pt",
                            "Poland":"pl",
                            "Norway":"no",
                            "New_Zealand":"nz",
                            "Netherlands":"nl",
                            "India":"in",
                            "Germany":"de",
                            "France_Regions":"fr_regions",
                            "Italy_Provinces":"it",
                            "France_Regions_2016":"fr_regions_2016",
                            "France_Departments":"fr",
                            "Denmark":"dk",
                            "Colombia":"co-"};
    // Declare widget's prototype.
    return declare("jVectorMapWidget.widget.jVectorMapWidget", [ _WidgetBase, _TemplatedMixin ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // DOM elements
        mapContainer: null,
        infoTextNode: null,

        // Parameters configured in the Modeler.
        mapDataPointsAssociation: "",
        valueAttribute: "",
        codeAttribute: "",
        tooltip: "",
        undefined_label: "",
        mapName: "",
        mapType: "",
        custom_setings: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,
        _alertDiv: null,
        _readOnly: false,

        map: null,
        values:  { "AF": 10, "AN": 0, AS: 15, "EU": 30,"NA": 26,"OC":19,"SA":14},

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            _debug(this.id + ".constructor");
            this._handles = [];
        },

        _setIfUndefined: function(property,new_value) {
            if ( "undefined" == typeof this[property] )
                this[property] = value;
        },

        _createMap: function(real_map_name) {
            var self = this;
            _debug(self.customSettings);
            var settings = {};
            var temp_settings = self.customSettings;//.replace("$Data",JSON.stringify(self.values));
            try {settings=JSON.parse(temp_settings);}
            catch(err) { console.error("Custom settings malformed:"+err); }
            //if ( self.customSettings.indexOf("$Data") == -1 ) {

              if ( "series" in settings ) {
                if ( "regions" in settings.series ) {
                  var regs = settings.series.regions;
                  if ( regs.length == 0 ) regs.push({ values : self.value });
                  else regs[0].values = self.values;
                }
                else {
                  settings.regions = [ { values : self.values } ];
                }
              }
              else {
                  settings.series = {"regions": [ { "values" : self.values } ] };
              }
          //  }
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
            settings.map = real_map_name.replace("-","_");
            $(self.mapContainer).vectorMap(settings);
            self.map = $(self.mapContainer).vectorMap('get','mapObject');
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            var self = this;
            _debug(this.id + ".postCreate");
            _debug(self.mapDataPointsAssociation);

            self._setIfUndefined("mapDataPointsAssociation","JVectorMap.DataPoint_DataSeries");
            self._setIfUndefined("valueAttribute","Value");
            self._setIfUndefined("codeAttribute","RegionCode");

            if (this.readOnly || this.get("disabled") || this.readonly) {
              this._readOnly = true;
            }
            var real_map_name = maps_to_url[self.mapName]+"-"+self.mapType;

            if ( self.mapName == "Canada" )
              real_map_name = "ca-lcc";
            _debug(real_map_name);

            //load the correct map
            $.getScript( maps_directory+"jquery-jvectormap-"+real_map_name+".js", function( data, textSatus, jqxhr ) {
              self._createMap(real_map_name);
              self._updateRendering();
              self._setupEvents();
            });

        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            var self = this;
            _debug(this.id + ".update");

            this._contextObj = obj;

            self._resetSubscriptions();
            self._updateRendering(callback);// We're passing the callback to updateRendering to be called after DOM-manipulation
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function () {
          _debug(this.id + ".enable");
        },

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function () {
          _debug(this.id + ".disable");
        },

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function (box) {
          _debug(this.id + ".resize");
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
          _debug(this.id + ".uninitialize");
          this.map.remove();
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        // We want to stop events on a mobile device
        _stopBubblingEventOnMobile: function (e) {
            _debug(this.id + "._stopBubblingEventOnMobile");
            if (typeof document.ontouchstart !== "undefined") {
                dojoEvent.stop(e);
            }
        },

        // Attach events to HTML dom elements
        _setupEvents: function () {
            _debug(this.id + "._setupEvents");
        },

        _execMf: function (mf, guid, cb) {
            _debug(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(mf, {
                    params: {
                        applyto: "selection",
                        guids: [guid]
                    },
                    callback: lang.hitch(this, function (objs) {
                        if (cb && typeof cb === "function") {
                            cb(objs);
                        }
                    }),
                    error: function (error) {
                        _debug(error.description);
                    }
                }, this);
            }
        },

        _loadData: function(callback) {
          var self = this;
          mx.data.get({
              // xpath: "//JVectorMap.MapDataPoint["+this._contextObj._guid+"=JVectorMap.DataPoint_DataSeries]",\
              path: self.mapDataPointsAssociation.split("/").slice(0, -1).join("/"),
              guid: this._contextObj._guid,
              callback: function(objs) {
                self.values = {};
                for ( var i = 0 ; i < objs.length ; ++i ) {
                    var o = objs[i];
                    var key = o.get(self.codeAttribute);
                    var value = parseFloat(o.get(self.valueAttribute));
                    self.values[key] = value;
                }
                callback();
              }
            });
        },


        _redrawMap: function(max_tries,current_try) {
          var self = this;
          if ( self.map != null ) {
            var min_ = self.safe_min(self.values);
            var max_ = self.safe_max(self.values);
            self.map.series.regions[0].clear();
            self.map.series.regions[0].params.min = min_;
            self.map.series.regions[0].params.max = max_;
            self.map.series.regions[0].setValues(self.values);
           }
           else {
             if ( max_tries > current_try )
             setTimeout(function () {self._redrawMap(max_tries,current_try+1)},100);
           }
        },

        // Rerender the interface.
        _updateRendering: function (callback) {
            var self = this;
            _debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");
                self._loadData(function () {
                  self._redrawMap(5,0);
                });
                dojoHtml.set(this.infoTextNode, this._contextObj.jsonData.attributes.Name.value);

            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            // Important to clear all validations!
            this._clearValidations();

            // The callback, coming from update, needs to be executed, to let the page know it finished rendering
            this._executeCallback(callback, "_updateRendering");
        },

        // Handle validations.
        _handleValidation: function (validations) {
            _debug(this.id + "._handleValidation");
            this._clearValidations();

        },

        // Clear validations.
        _clearValidations: function () {
            _debug(this.id + "._clearValidations");
            dojoConstruct.destroy(this._alertDiv);
            this._alertDiv = null;
        },

        // Show an error message.
        _showError: function (message) {
            _debug(this.id + "._showError");
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

        // Add a validation.
        _addValidation: function (message) {
            _debug(this.id + "._addValidation");
            this._showError(message);
        },

        // Reset subscriptions.
        _resetSubscriptions: function () {
            _debug(this.id + "._resetSubscriptions");
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

                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.backgroundColor,
                    callback: lang.hitch(this, function (guid, attr, attrValue) {
                        this._updateRendering();
                    })
                });

                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    val: true,
                    callback: lang.hitch(this, this._handleValidation)
                });
            }
        },

        _executeCallback: function (cb, from) {
            _debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        },

        safe_max: function(arr) {
            return Math.max.apply(null, Object.keys(arr).map(function(e) {return arr[e];}));
        },

        safe_min: function(arr) {
            return Math.min.apply(null, Object.keys(arr).map(function(e) {return arr[e];}));
        }

    });
});

require(["jVectorMapWidget/widget/jVectorMapWidget"]);
