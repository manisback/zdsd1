/*global location */
sap.ui.define([
	"zdsd/heineken01/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"zdsd/heineken01/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"jquery.sap.global"
], function(BaseController, JSONModel, formatter, MessageToast, MessageBox, jQuery) {
	"use strict";

	return BaseController.extend("zdsd.heineken01.controller.Detail", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				lineItemListTitle: this.getResourceBundle().getText("detailLineItemTableHeading")
			});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(oViewModel, "detailView");

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));

			//wizard!!!!!
			this._wizard = this.getView().byId("CreateProductWizard");
			this._oNavContainer = this.getView().byId("wizardNavContainer");
			// this._oNavContainer = this.getView();
			this._oWizardContentPage = this.getView().byId("page");
			this._oWizardReviewPage = sap.ui.xmlfragment("zdsd.heineken01.view.ReviewPage", this);
			this._oVycetkaPage = sap.ui.xmlfragment("zdsd.heineken01.view.vycetkaPage", this);

			this._oNavContainer.addPage(this._oWizardReviewPage);
			this._oNavContainer.addPage(this._oVycetkaPage);
			this.model = new sap.ui.model.json.JSONModel();
			this.model.setData({
				productNameState: "Error",
				productWeightState: "Error"
			});
			this.getView().setModel(this.model, "zlocal");
			// this.getView().setModel(this.model);
			this.model.setProperty("/productType", "Mobile");
			this.model.setProperty("/navApiEnabled", true);
			this.model.setProperty("/productVAT", false);
			this._setEmptyValue("/productManufacturer");
			this._setEmptyValue("/productDescription");
			this._setEmptyValue("/productPrice");
		},


			//wizard
		setProductType: function (evt) {
			var productType = evt.getSource().getTitle();
			this.model.setProperty("/productType", productType);
			this.getView().byId("ProductStepChosenType").setText("Chosen product type: " + productType);
			this._wizard.validateStep(this.getView().byId("ProductTypeStep"));
		},
		setProductTypeFromSegmented: function (evt) {
			var productType = evt.mParameters.button.getText();
			this.model.setProperty("/productType", productType);
			this._wizard.validateStep(this.getView().byId("ProductTypeStep"));
		},
		additionalInfoValidation : function () {
			var name = this.getView().byId("ProductName").getValue();
			var weight = parseInt(this.getView().byId("ProductWeight").getValue());

			isNaN(weight) ? this.model.setProperty("/productWeightState", "Error") : this.model.setProperty("/productWeightState", "None");
			name.length<6 ?  this.model.setProperty("/productNameState", "Error") : this.model.setProperty("/productNameState", "None");

			if (name.length < 6 || isNaN(weight))
				this._wizard.invalidateStep(this.getView().byId("ProductInfoStep"));
			else
				this._wizard.validateStep(this.getView().byId("ProductInfoStep"));
		},
		optionalStepActivation: function () {
			// MessageToast.show(
			// 	'This event is fired on activate of Step3.'
			// );
		},
		optionalStepCompletion: function () {
			MessageToast.show(
				'This event is fired on complete of Step3. You can use it to gather the information, and lock the input data.'
			);
		},
		pricingActivate: function () {
			this.model.setProperty("/navApiEnabled", true);
		},
		pricingComplete: function () {
			this.model.setProperty("/navApiEnabled", false);
		},
		scrollFrom4to2 : function () {
			this._wizard.goToStep(this.getView().byId("ProductInfoStep"));
		},
		goFrom4to3 : function () {
			if (this._wizard.getProgressStep() === this.getView().byId("PricingStep"))
				this._wizard.previousStep();
		},
		goFrom4to5 : function () {
			if (this._wizard.getProgressStep() === this.getView().byId("PricingStep"))
				this._wizard.nextStep();
		},
		wizardCompletedHandler : function () {
			var oForm = this._oWizardReviewPage;
			var oVratneObaly30 = oForm.getContent()[1].getAggregation("form").getAggregation("formContainers")[0];
			var oField30 = oVratneObaly30.getFormElements()[0].getFields()[0];
				oField30.setProperty("text", this.getView().byId("__text8").getText());
			var oVratneObaly50 = oForm.getContent()[1].getAggregation("form").getAggregation("formContainers")[0];	
			var oField50 = oVratneObaly50.getFormElements()[1].getFields()[0];	
				oField50.setProperty("text", this.getView().byId("__text9").getText());
			var oDobreCelk = oForm.getContent()[2].getAggregation("form").getAggregation("formContainers")[0];	
			var oFieldCelk = oDobreCelk.getFormElements()[0].getFields()[0];	
				oFieldCelk.setProperty("text", this.getView().byId("__text28").getText());
				
			var oCelkplatba = oForm.getContent()[3].getAggregation("form").getAggregation("formContainers")[0];		
			var oFieldCelkPlatba = oCelkplatba.getFormElements()[0].getFields()[0];
			
			var oView = this.getView();
			var sCena31	= oView.byId("__text8").getText();
			var sCena30 = sCena31.split("K");
			var sNumber30 = Number(sCena30[0]);
			var sCena51	= oView.byId("__text9").getText();
			var sCena50 = sCena51.split("K");
			var sNumber50 = Number(sCena50[0]);
			
			
			var sCena310	= oView.byId("__text27").getText();
			var sCena300 = sCena310.split("K");
			var sNumber300 = Number(sCena300[0]);
			var sCena510	= oView.byId("__text26").getText();
			var sCena500 = sCena510.split("K");
			var sNumber500 = Number(sCena500[0]);
			
			
			var sSuma = -sNumber50 - sNumber30 + sNumber300 + sNumber500 + "Kč";
				oFieldCelkPlatba.setProperty("text", sSuma);
			this._oNavContainer.to(this._oWizardReviewPage);
		},
		backToWizardContent : function () {
			this._oNavContainer.backToPage(this._oWizardContentPage.getId());
		},
		editStepOne : function () {
			this._handleNavigationToStep(0);
		},
		editStepTwo : function () {
			this._handleNavigationToStep(1);
		},
		editStepThree : function () {
			this._handleNavigationToStep(2);
		},
		editStepFour : function () {
			this._handleNavigationToStep(3);
		},
		_handleNavigationToStep : function (iStepNumber) {
			var that = this;
			function fnAfterNavigate () {
				that._wizard.goToStep(that._wizard.getSteps()[iStepNumber]);
				that._oNavContainer.detachAfterNavigate(fnAfterNavigate);
			}

			this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
			this.backToWizardContent();
		},
		_handleMessageBoxOpen : function (sMessage, sMessageBoxType) {
			var that = this;
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						that._handleNavigationToStep(0);
						that._wizard.discardProgress(that._wizard.getSteps()[0]);
					}
				},
			});
		},
		_setEmptyValue : function (sPath) {
			this.model.setProperty(sPath, "n/a");
		},
		handleWizardCancel : function () {
			this._handleMessageBoxOpen("Neprovedl jste všechny potřebné kroky! Přejete si přesto ukončit tuto návštěvu?", "warning");
		},
		handleWizardSubmit : function () {
			this._handleMessageBoxOpen("Přejete si přejít k výčetce?", "confirm");
		},
		productWeighStateFormatter: function (val) {
			return isNaN(val) ? "Error" : "None";
		},
		discardProgress: function () {
			this._wizard.discardProgress(this.getView().byId("ProductTypeStep"));

			var clearContent = function (content) {
				for (var i = 0; i < content.length ; i++) {
					if (content[i].setValue) {
						content[i].setValue("");
					}

					if (content[i].getContent) {
						clearContent(content[i].getContent());
					}
				}
			};

			this.model.setProperty("/productWeightState", "Error");
			this.model.setProperty("/productNameState", "Error");
			clearContent(this._wizard.getSteps());
		},
			
			
			
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = this.getModel("detailView");

			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function() {
			var oViewModel = this.getModel("detailView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});

			oShareDialog.open();
		},

		/**
		 * Updates the item count within the line item table's header
		 * @param {object} oEvent an event containing the total number of items in the list
		 * @private
		 */
		onListUpdateFinished: function(oEvent) {
			var sTitle,
				iTotalItems = oEvent.getParameter("total"),
				oViewModel = this.getModel("detailView");

			// only update the counter if the length is final
			if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
				}
				oViewModel.setProperty("/lineItemListTitle", sTitle);
			}
		},
		
		onInputCount30: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oView = this.getView(); 
			
			var sKeg30 = 1000;
			var sCena = sValue * sKeg30 + "Kč";
				oView.byId("__text8").setText(sCena);
				
				
			// var formatter1 = new Intl.NumberFormat('cs-CZ', {  
   //       style: "currency",  
   //       currency: "CZK"  
   //     }); 	
        
        // oView.byId("__text8").setText(formatter1.format(sCena));
        
			
			this._sumaInputCount();
			
		},
		onInputCount030: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oView = this.getView(); 
			
			var sKeg30 = 1000;
			var sCena = 10000 - (sValue * sKeg30) + "Kč";
				oView.byId("__text27").setText(sCena);
				
				
			// var formatter1 = new Intl.NumberFormat('cs-CZ', {  
   //       style: "currency",  
   //       currency: "CZK"  
   //     }); 	
        
        // oView.byId("__text8").setText(formatter1.format(sCena));
        
			
			this._sumaInputCount0();
			
		},
		onInputCount050: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oView = this.getView(); 
			
			
		// var formatter1 = new Intl.NumberFormat('cs-CZ', {  
  //        style: "currency",  
  //        currency: "CZK"  
  //      }); 
           
			var sKeg50 = 1500;
			var sCena = 15000 - (sValue * sKeg50) + "Kč";
				 oView.byId("__text26").setText(sCena);
				
			 //oView.byId("__text9").setText(formatter1.format(sCena));
				

			this._sumaInputCount0();
		},
		onInputCount50: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oView = this.getView(); 
			
			
		// var formatter1 = new Intl.NumberFormat('cs-CZ', {  
  //        style: "currency",  
  //        currency: "CZK"  
  //      }); 
           
			var sKeg50 = 1500;
			var sCena = sValue * sKeg50 + "Kč";
				 oView.byId("__text9").setText(sCena);
				
			 //oView.byId("__text9").setText(formatter1.format(sCena));
				

			this._sumaInputCount();
		},
		
		handleCamera: function(evt) {
			//		var searchField = this.getView().byId("test");
			//		var callerClass = this;
			var that = this;
			cordova.plugins.barcodeScanner.scan(
				function(result) {
					sap.m.MessageToast.show(result.text);
					// searchField.setValue(result.text);
					// callerClass.doFilter(result.text);
					var sCan = result.text;
					//var scan1 = parseFloat(sCan,10);

					// var sCan = "000030000076";
					var scan1 = parseFloat(sCan, 10);
					that._createDeliverTable();

				},
				function(error) {
					sap.m.MessageToast.show("Camera Error");
				}
			);
		},
		onVycetka: function (oEvent) {
			var oSource = oEvent.getSource();
			var sParameter = oEvent.getParameter("id");
			var oVyčetka = this._oWizardReviewPage.getContent()[4].getAggregation("form").getAggregation("formContainers")[0];
			var sInput1 = oVyčetka.getFormElements()[0].getFields()[0].getProperty("value");
			var sInputCelk1 = 5000 * Number(sInput1); 
			var sInput2 = oVyčetka.getFormElements()[1].getFields()[0].getProperty("value");
			var sInputCelk2 = 2000 * Number(sInput2); 
			var sInput3 = oVyčetka.getFormElements()[2].getFields()[0].getProperty("value");
			var sInputCelk3 = 1000 * Number(sInput3); 
			var sInput4 = oVyčetka.getFormElements()[3].getFields()[0].getProperty("value");
			var sInputCelk4 = 500 * Number(sInput4); 
			
			var sCelkem = sInputCelk1 + sInputCelk2 + sInputCelk3 + sInputCelk4;
			var sInput = oVyčetka.getFormElements()[4].getFields()[0].setProperty("text",sCelkem);
			
				if (sParameter === "__input5000") {
					   
				} else if (sParameter === "__input2000") {
					
				} else if (sParameter === "__input1000") {
					
				} else if (sParameter === "__input500") {
					
				}
		},
 
		_createDeliverTable: function(){
			var oView = this.getView();
				oView.byId("__form3").setVisible(true);
				oView.byId("__form2").setVisible(true);
				oView.byId("__table1").setVisible(true);
				oView.byId("__form4").setVisible(true);
		},
		
		/**
		 * Event handler  for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		// onNavBack : function() {
		// 	var sPreviousHash = History.getInstance().getPreviousHash(),
		// 		oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

		// 	if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
		// 		history.go(-1);
		// 	} else {
		// 		this.getRouter().navTo("master", {}, true);
		// 	}
		// },

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("SalesOrders", {
					SalesOrderNumber: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function(sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function() {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.SalesOrderNumber,
				sObjectName = oObject.SalesOrderNumber,
				oViewModel = this.getModel("detailView");

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		_onMetadataLoaded: function() {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView");
				// oLineItemTable = this.byId("lineItemsList"),
				// iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			 oViewModel.setProperty("/lineItemTableDelay", 0);

			// oLineItemTable.attachEventOnce("updateFinished", function() {
			// 	// Restore original busy indicator delay for line item table
			// 	oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
			// });

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			 oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},
		_sumaInputCount:function (){
			var oView = this.getView();
			var sCena31	= oView.byId("__text8").getText();
			var sCena30 = sCena31.split("K");
			var sNumber30 = Number(sCena30[0]);
			var sCena51	= oView.byId("__text9").getText();
			var sCena50 = sCena51.split("K");
			var sNumber50 = Number(sCena50[0]);
			
			var sCena1 = sNumber30 + sNumber50;
			var sCena = sCena1 + "Kč";
			oView.byId("__text13").setText(sCena);
			
		},
		_sumaInputCount0:function (){
			var oView = this.getView();
			var sCena31	= oView.byId("__text27").getText();
			var sCena30 = sCena31.split("K");
			var sNumber30 = Number(sCena30[0]);
			var sCena51	= oView.byId("__text26").getText();
			var sCena50 = sCena51.split("K");
			var sNumber50 = Number(sCena50[0]);
			
			var sCena1 = sNumber30 + sNumber50;
			var sCena = sCena1 + "Kč";
			oView.byId("__text28").setText(sCena);
			
		}

	});

});