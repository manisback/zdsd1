var pq = jQuery.sap.getModulePath("zdsd.heineken01");
jQuery.sap.registerModulePath("SignaturePad", pq + "/SignaturePad/library");
 
sap.ui.define([
	"sap/ui/core/Control", 
	"SignaturePad"
	], function(oControl) {
    "use strict";
    return oControl.extend("mySignPad", {
 
        metadata: {
            properties: {
                "width": {
                    type: "sap.ui.core.CSSSize",
                    defaultValue: "400px"
                },
                "height": {
                    type: "sap.ui.core.CSSSize",
                    defaultValue: "132px"
                },
                "thickness": {
                    type: "int",
                    defaultValue: 2
                },
                "bgcolor": {
                    type: "sap.ui.core.CSSColor",
                    defaultValue: "white"
                },
                "signcolor": {
                    type: "sap.ui.core.CSSColor",
                    defaultValue: "black"
                }
            }
        },
 
        renderer: function(oRm, oControl) {
            var thickness = parseInt(oControl.getProperty('thickness'), 10);
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.addStyle("width", oControl.getProperty('width'));
            oRm.addStyle("height", oControl.getProperty('height'));
            oRm.addStyle("background-color", oControl.getProperty('bgcolor'));
            oRm.writeStyles();
 
            oRm.writeClasses();
            oRm.write(">");
 
            oRm.write("<canvas width='" + oControl.getProperty('width') + "' " +
                "height='" + oControl.getProperty('height') + "'");
            oRm.writeControlData(oControl);
            oRm.addStyle("width", oControl.getProperty('width'));
            oRm.addStyle("height", oControl.getProperty('height'));
            oRm.writeStyles();
            oRm.write("></canvas>");
            oRm.write("</div>");
        },
 
        onAfterRendering: function() {
            var canvas = document.querySelector("canvas");
            try {
                this.signaturePad = new SignaturePad(canvas);
            } catch (e) {
                console.error(e);
            }
        },
        clear: function() {
 
            this.signaturePad.clear();
 
        },
        save: function() {
            return this.signaturePad.toDataURL();
        }
    });
});