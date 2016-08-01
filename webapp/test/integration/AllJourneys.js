jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 SalesOrders in the list
// * All 3 SalesOrders have at least one OrderItems

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
		"zdsd/heineken01/test/integration/MasterJourney",
		"zdsd/heineken01/test/integration/NavigationJourney",
		"zdsd/heineken01/test/integration/NotFoundJourney",
		"zdsd/heineken01/test/integration/BusyJourney",
		"zdsd/heineken01/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});
