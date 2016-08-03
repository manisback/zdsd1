/*global location */
sap.ui.define([
	"zdsd/heineken01/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"zdsd/heineken01/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"jquery.sap.global",
	"sap/m/Dialog",
	"sap/m/Button"

], function(BaseController, JSONModel, formatter, MessageToast, MessageBox, jQuery, Dialog, Button) {
	"use strict";

	return BaseController.extend("zdsd.heineken01.controller.Detail", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods     tralalalala                                       */
		/* =========================================================== */

		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data

			var pq = jQuery.sap.getModulePath("zdsd.heineken01");
			sap.ui.getCore().loadLibrary("extlibrary", pq + "/extlibrary/");
			sap.ui.getCore().loadLibrary("SignaturePad", pq + "/SignaturePad/");

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
		setProductType: function(evt) {
			var productType = evt.getSource().getTitle();
			this.model.setProperty("/productType", productType);
			this.getView().byId("ProductStepChosenType").setText("Chosen product type: " + productType);
			this._wizard.validateStep(this.getView().byId("ProductTypeStep"));
		},
		setProductTypeFromSegmented: function(evt) {
			var productType = evt.mParameters.button.getText();
			this.model.setProperty("/productType", productType);
			this._wizard.validateStep(this.getView().byId("ProductTypeStep"));
		},
		additionalInfoValidation: function() {
			var name = this.getView().byId("ProductName").getValue();
			var weight = parseInt(this.getView().byId("ProductWeight").getValue());

			isNaN(weight) ? this.model.setProperty("/productWeightState", "Error") : this.model.setProperty("/productWeightState", "None");
			name.length < 6 ? this.model.setProperty("/productNameState", "Error") : this.model.setProperty("/productNameState", "None");

			if (name.length < 6 || isNaN(weight))
				this._wizard.invalidateStep(this.getView().byId("ProductInfoStep"));
			else
				this._wizard.validateStep(this.getView().byId("ProductInfoStep"));
		},
		optionalStepActivation: function() {
			// MessageToast.show(
			// 	'This event is fired on activate of Step3.'
			// );
		},
		optionalStepCompletion: function() {
			MessageToast.show(
				'This event is fired on complete of Step3. You can use it to gather the information, and lock the input data.'
			);
		},
		pricingActivate: function() {
			this.model.setProperty("/navApiEnabled", true);
		},
		pricingComplete: function() {
			this.model.setProperty("/navApiEnabled", false);
		},
		scrollFrom4to2: function() {
			this._wizard.goToStep(this.getView().byId("ProductInfoStep"));
		},
		goFrom4to3: function() {
			if (this._wizard.getProgressStep() === this.getView().byId("PricingStep"))
				this._wizard.previousStep();
		},
		goFrom4to5: function() {
			if (this._wizard.getProgressStep() === this.getView().byId("PricingStep"))
				this._wizard.nextStep();
		},
		wizardCompletedHandler: function() {
			
			var oForm = this._oVycetkaPage;
			var sVycet1 = Number(this.getView().byId("__number1").getNumber());
			var sVycet = sVycet1 + "Kč";
			// this._oNavContainer.to(this._oVycetkaPage);
			oForm.getContent()[0].getContent()[8].setProperty("text", sVycet);
			this._handleMessageBoxOpen("Přejete si odeslat zaplacenou částku na portál finanční správy?", "confirm");
		},
			
			
		
		backToWizardContent: function() {
			this._oNavContainer.backToPage(this._oWizardContentPage.getId());
		},
		editStepOne: function() {
			this._handleNavigationToStep(0);
		},
		editStepTwo: function() {
			this._handleNavigationToStep(1);
		},
		editStepThree: function() {
			this._handleNavigationToStep(2);
		},
		editStepFour: function() {
			this._handleNavigationToStep(3);
		},
		_handleNavigationToStep: function(iStepNumber) {
			var that = this;

			function fnAfterNavigate() {
				that._wizard.goToStep(that._wizard.getSteps()[iStepNumber]);
				that._oNavContainer.detachAfterNavigate(fnAfterNavigate);
			}

			this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
			this.backToWizardContent();
		},
		_handleMessageBoxOpen: function(sMessage, sMessageBoxType) {
			var that = this;
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function(oAction) {
					if (oAction === MessageBox.Action.YES) {

						// that._handleNavigationToStep(0);
						// that._wizard.discardProgress(that._wizard.getSteps()[0]);

						that._oNavContainer.to(that._oVycetkaPage);
					}
				},
			});
		},
		_setEmptyValue: function(sPath) {
			this.model.setProperty(sPath, "n/a");
		},
		handleWizardCancel: function() {
			this._handleMessageBoxOpen("Neprovedl jste všechny potřebné kroky! Přejete si přesto ukončit tuto návštěvu?", "warning");
		},
		handleWizardSubmit: function() {
			this._handleMessageBoxOpen("Přejete si odeslat částku Suma na portál finanční správy?", "confirm");
		},
		productWeighStateFormatter: function(val) {
			return isNaN(val) ? "Error" : "None";
		},
		discardProgress: function() {
			this._wizard.discardProgress(this.getView().byId("ProductTypeStep"));

			var clearContent = function(content) {
				for (var i = 0; i < content.length; i++) {
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
		onCountButtonVy: function(oEvent) {
			var oSource = oEvent.getSource();
			var sGroup = oSource.getFieldGroupIds()[0];
			var sIdcomplet = oEvent.getParameters().id;
			var sId = sIdcomplet.split("__");
			var sID = "__" + sId[1];

			var sHboxIdComplet = oEvent.getSource().getParent().getId();
			var sHbox = sHboxIdComplet.split("__");
			var sHBoxID = "__" + sHbox[1];

			var sInputComplet = oEvent.getSource().getParent().getItems()[1].getId();
			var sInput = sInputComplet.split("__");
			var sInputID = "__" + sInput[1];

			var oInputField = this.getView().byId(sInputID);
			var count = Number(oInputField.getValue());

			if (sGroup === "plus") {
				count++;
				oInputField.setValue(count);
				this._onInputCountVy(sInputID, oSource, sGroup);
			} else {
				if (count !== 0) {
					count--;
					oInputField.setValue(count);
					this._onInputCountVy(sInputID, oSource, sGroup);
				}
			}
		},
		_onInputCountVy: function(InputID, Source, Group) {
				var  sCount, oForm, oGroup, sCastka, sSuma, count, oInputField;
				var sInputID = InputID;
				
				oForm = this.getView().byId("formvycetka");
				var oForm1 = oForm.getAggregation("form");
				var aElements = oForm1.getFormContainers()[0].getFormElements();
			
				for (var i = 0; i < aElements.length; i++) {
					var sLabel = aElements[i].getLabel().getText();
					
					switch(sLabel) {
						    case "5000":
						        sCastka = 5000;
						        
						         oInputField = this.getView().byId("__input4PM");
								 count = Number(oInputField.getValue());
						        
						        var s5000 = this._onCountCastka(sCastka, count);
						        
						        break;
						    case "2000":
						       sCastka = 2000;
						       
						        oInputField = this.getView().byId("__input5PM");
								 count = Number(oInputField.getValue());
								
						        var s2000 = this._onCountCastka(sCastka, count);
						        
						        
						        break;
						    case "1000":
						    	 sCastka = 1000;
						    	 
						    	  oInputField = this.getView().byId("__input6PM");
								  count = Number(oInputField.getValue());
								 
						    	 var s1000 = this._onCountCastka(sCastka, count);
						    	 
						    	break;
						    case "500":
						    	 sCastka = 500;
						    	 
						    	  oInputField = this.getView().byId("__input7PM");
								  count = Number(oInputField.getValue());
								 
						    	  var s500 = this._onCountCastka(sCastka, count);
						    	  
						        break;
						}
					
					
					}
					
					var final = s500 + s1000 + s2000 + s5000;
					this.getView().byId("__number1").setNumber(final);
					this._onSaldo();
				
			},

		_onCountCastka : function(sCastka, count) {
				return sCastka * count;
		},

		onCountButton: function(oEvent) {
			var oSource = oEvent.getSource();
			var sGroup = oSource.getFieldGroupIds()[0];
			var sIdcomplet = oEvent.getParameters().id;
			var sId = sIdcomplet.split("__");
			var sID = "__" + sId[1];

			var sHboxIdComplet = oEvent.getSource().getParent().getId();
			var sHbox = sHboxIdComplet.split("__");
			var sHBoxID = "__" + sHbox[1];

			var sInputComplet = oEvent.getSource().getParent().getItems()[1].getId();
			var sInput = sInputComplet.split("__");
			var sInputID = "__" + sInput[1];

			var oInputField = this.getView().byId(sInputID);
			var count = Number(oInputField.getValue());

			if (sGroup === "plus") {
				count++;
				oInputField.setValue(count);
				this._onInputCount(count, oSource, sGroup);
			} else {
				if (count !== 0) {
					count--;
					oInputField.setValue(count);
					this._onInputCount(count, oSource, sGroup);
				}
			}
		},
		_onInputCount: function(count, Source, Group) {
				var  sCount, oTable, oGroup;
				sCount = count;
				
				oTable = Source.getParent().getParent();
				var aCells = oTable.getCells();
				var sLength = oTable.getCells().length;
			
				
				for (var i = 0; i < aCells.length; i++) {
					if (aCells[i].getFieldGroupIds()[0] === "number")  {
						var sNumber2 = aCells[i].getId();
					
						var sNumber1 = sNumber2.split("__");
						var sNumber = "__" + sNumber1[1];
						
					} else {
						
					}
				}
				
				if (sNumber == "__number4" || sNumber == "__number3") {
					this.onInputCount30(sCount, sNumber);  
				} else {
					this.onInputCount030(sCount, sNumber);  
				}
				
				
			},
		
		_onSaldo: function(Cena) {
			
			var sSaldoOA = this.getView().byId("__number5");
			var sVratne = Number(this.getView().byId("__number2").getNumber());
			var sDobre = Number(this.getView().byId("__number6v").getNumber());
			var sVycet = Number(this.getView().byId("__number1").getNumber());
			var sSaldo = sSaldoOA.getNumber();
			var sCena = sVratne + sDobre + sVycet;
			var sSuma = 25000 - sCena;
				sSaldoOA.setNumber(sSuma);
	
		},
		onTisk: function() {
			MessageToast.show(
				"Účtenka byla odeslána na tiskárnu."
			);
		},
		onMail: function() {
			MessageToast.show(
				"Účtenka byla odeslána na Zákazníkovi na email."
			);
		},
		onGetSignature: function() {

			var that = this;
			// var oMySign = new mySignPad("sPad1", {});

			var dialog = new Dialog({
				title: 'Podpis',
				type: 'Message',
				content: new mySignPad("sPad1", {

				}),

				beginButton: new Button({
					text: 'Potvrdit',
					press: function(oEvent) {

						var sURL = sap.ui.getCore().getControl("sPad1").save();
						var oImage = sap.ui.getCore().getControl("__image0vycet");
						oImage.setVisible(true);
						oImage.setSrc(sURL);

						dialog.setProperty("title", "ok");
						// MessageToast.show('Dotazník byl odeslán');
						dialog.close();

					}
				}),

				endButton: new Button({
					text: 'Zrušit',
					press: function() {

						dialog.close();
					}
				}),

				afterClose: function(oEvent) {
					dialog.destroy();

				}
			});
			dialog.open();

		},

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

		onInputCount30: function(oEvent, ID) {
			var oView = this.getView();
			var sValue;
			var sId = ID;
			if (typeof oEvent === "number") {
				 sValue = oEvent;
			} else {
				sValue = oEvent.getParameter("value");
			}

			var sKeg30 = 1000;
			var sCena = sValue * sKeg30;
			oView.byId(sId).setNumber(sCena);

			this._sumaInputCount();

		},
		onInputCount030: function(oEvent, ID) {
			
			var oView = this.getView();
			var sValue;
			var sId = ID;
			if (typeof oEvent === "number") {
				 sValue = oEvent;
			} else {
				sValue = oEvent.getParameter("value");
			}

			var sKeg30 = 1000;
			var sCena = sValue * sKeg30;
			oView.byId(sId).setNumber(sCena);

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
			var oView = this.getView();
			if (typeof oEvent === "number") {
				var sValue = oEvent;
			} else {
				var sValue = oEvent.getParameter("value");
			}
			
			var sKeg50 = 1500;
			var sCena = sValue * sKeg50;
			oView.byId("__number3").setNumber(sCena);

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
					// var scan1 = parseFloat(sCan, 10);

					that._createDeliverTable();

				},
				function(error) {
					sap.m.MessageToast.show("Camera Error");
				}
			);
			// that._wizard.nextStep().then(that._wizard.goToStep(that.getView().byId("ProductTypeStep")));

		},
		onVycetka: function(oEvent) {
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

			var sCelkem1 = sInputCelk1 + sInputCelk2 + sInputCelk3 + sInputCelk4;

			var oCelkplatba = this._oWizardReviewPage.getContent()[3].getAggregation("form").getAggregation("formContainers")[0];
			var oFieldCelkPlatba = oCelkplatba.getFormElements()[0].getFields()[0];
			var sSuma1 = oFieldCelkPlatba.getProperty("text");
			var sSuma2 = sSuma1.split("K");
			var sSuma = Number(sSuma2[0]);

			var sCelkem = sSuma - sCelkem1;
			var sInput = oVyčetka.getFormElements()[4].getFields()[0].setProperty("text", sCelkem);

		},
		onPaging: function(oEvent) {
			var oTest = oEvent;
		},

		_createDeliverTable: function() {
			var oView = this.getView();
			oView.byId("__form3").setVisible(true);
			oView.byId("__form2").setVisible(true);
			oView.byId("__table1").setVisible(true);
			// oView.byId("__form4").setVisible(true);
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
		_sumaInputCount: function(cena) {
			var oView = this.getView();
			var sCena31 = oView.byId("__number4").getNumber();
			var sNumber30 = Number(sCena31);
			var sCena51 = oView.byId("__number3").getNumber();
			var sNumber50 = Number(sCena51);

			var sCena = sNumber30 + sNumber50;
			oView.byId("__number2").setNumber(sCena);
			this._onSaldo(sCena);

		},
		_sumaInputCount0: function(cena) {
			var oView = this.getView();
			var sCena31 = oView.byId("__number0v").getNumber();
			var sNumber30 = Number(sCena31);
			var sCena51 = oView.byId("__number5v").getNumber();
			var sNumber50 = Number(sCena51);

			var sCena = sNumber30 + sNumber50;
			oView.byId("__number6v").setNumber(sCena);
			this._onSaldo(sCena);
		
	
		}

	});

});