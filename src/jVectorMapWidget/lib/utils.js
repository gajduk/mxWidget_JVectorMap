/*
Functions that are reused in other widgets. TODO document this
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
    "mxui/dom",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/lang",
    "dojo/html",
    "dojo/_base/event",
], function (declare, dom,  dojoStyle, dojoConstruct, lang, dojoHtml, dojoEvent) {
  "use strict";

  return {

    debug:  function(message) {
       if ( true ) {
         console.log(JSON.stringify(message,null,4));
       }
    },

    executeMicroflow: function (mf, callback, obj) {
        this.debug("executeMicroflow");
        var _params = {
            applyto: "selection",
            actionname: mf,
            guids: []
        };
        if (obj && obj.getGuid()) {
            _params.guids = [obj.getGuid()];
        }
        var mfAction = {
            params: _params,
            callback: lang.hitch(this, function (obj) {
                if (typeof callback === "function") {
                    callback(obj);
                }
            }),
            error: lang.hitch(this, function (error) {
                console.log(this.id + "._executeMicroflow error: " + error.description);
            })
        };
        if (!mx.version || mx.version && parseInt(mx.version.split(".")[0]) < 6) {
            mfAction.store = {
                caller: this.mxform
            };
        } else {
            mfAction.origin = this.mxform;
        }
        mx.data.action(mfAction, this);
    },

    //find a single element that is in a1 but not in a2
    arrayDiff: function(a1,a2) {
      for ( var i = 0 ; i < a1.length ; ++i )
         if ( a2.indexOf(a1[i]) == -1 ) return a1[i];
    },

    executeCallback: function (cb, from) {
        this.debug("._executeCallback" + (from ? " from " + from : ""));
        if (cb && typeof cb === "function") {
            cb();
        }
    },

    //checks if a not-required mendix parameter is set or not
    notSet: function (a) {
        return typeof a == "undefined" || a == "";
    },

    //sets a property if it is not defined
    setIfUndefined: function(object,property,new_value) {
        if ( ! object )  return;
        if ( "undefined" == typeof object[property] )
            object[property] = value;
    },

    safeMax: function(arr) {
        return Math.max.apply(null, Object.keys(arr).map(function(e) {return arr[e];}));
    },

    safeMin: function(arr) {
        return Math.min.apply(null, Object.keys(arr).map(function(e) {return arr[e];}));
    }

    };
});
