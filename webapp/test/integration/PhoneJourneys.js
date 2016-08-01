jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"zdsd/heineken01/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"zdsd/heineken01/test/integration/pages/App",
	"zdsd/heineken01/test/integration/pages/Browser",
	"zdsd/heineken01/test/integration/pages/Master",
	"zdsd/heineken01/test/integration/pages/Detail",
	"zdsd/heineken01/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zdsd.heineken01.view."
	});

	sap.ui.require([
		"zdsd/heineken01/test/integration/NavigationJourneyPhone",
		"zdsd/heineken01/test/integration/NotFoundJourneyPhone",
		"zdsd/heineken01/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});

