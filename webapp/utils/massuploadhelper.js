sap.ui.define(['../utils/dataformatter'],
	function (Formatter) {

		return {
			/**
			 * Extract and Prepare Data from Template
			 */
			extractDataFromTemplate: function (excelData, lookupModel,sThis) {
				// this.localizationBundle = bundle;
				var templateData = {
					"requests": [],
					"errorMessageList": [],
				};
				var rowElement;
				var element;
				var requestMap = {};
				var cnt = 0;
				var sClaimType = sThis.getView().getModel("ClaimRequest").getData();
				// var requestList = [];
				for (var r = 6; r < excelData.length; r++) {
					//Format Row Element Object
					rowElement = Formatter.formatRowElement(excelData[r]);
					//Mass Upload of Synthesis
					if (!requestMap[rowElement.SNo]) {
						element = {};
						// Object.assign(element, requestData);
						delete(element.id);
						element.claimType = sClaimType;
						element.staffId = (this.removeLeadingZeroes(rowElement.StaffID)) + "";
						element.selectedClaimDates = [];
						element.staffName = "";
						element.currency = "";
						element.totalAmount = "";
						element.isBankDetailsMaintained = true;
						// element.submittedOn = "23rd Aug, 2021";
						// element.yearMonth = "2021/Aug";
						element.wbsElement = (rowElement.WBSElement) ? rowElement.WBSElement : "";
						element.department = (rowElement.Department) ? rowElement.Department : "";
						element.serialNo = rowElement.SNo;
						requestMap[rowElement.SNo] = element;
					} else {
						element = requestMap[rowElement.SNo];
					}
					//Prepare Shift Dates
					this.prepareDatesForMassUploadRequests(element, rowElement, lookupModel);
				}

				//Request Map - Iterate and Populate Requests in the Request List
				jQuery.sap.each(requestMap, function (k, reqData) {
					// reqData.statusText = "Mass Requests";
					// reqData.isMassRequest = true;
					reqData.statusDisplay = "Draft";
					reqData.status = 1;
					templateData.requests.push(reqData);
				});
				return templateData;
			},
			/**
			 * Prepare Items for Mass Synthesis Requests Upload
			 */
			prepareDatesForMassUploadRequests: function (requestElement, rowElement, lookupModel) {
				requestElement.selectedClaimDates = (requestElement.selectedClaimDates instanceof Array) ? requestElement.selectedClaimDates : [];
				var tempDate = (rowElement.ShiftDate) ? new Date(rowElement.ShiftDate.getFullYear(), rowElement.ShiftDate.getMonth(), rowElement.ShiftDate
					.getDate() + 1) : "";
				requestElement.monthName = lookupModel.getProperty("/monthNames")[tempDate.getMonth()] + "/" + tempDate.getFullYear();
				var monthDisplay = (tempDate.getMonth() <= 9) ? "0" + tempDate.getMonth() : tempDate.getMonth() + "";
				requestElement.month = tempDate.getFullYear() + "-" + monthDisplay;
				var shiftDateElement = {
					"shiftDate": Formatter.formatDateAsString(tempDate, "yyyy-MM-dd"),
					"shiftDateDisplay": Formatter.formatDateAsString(tempDate, "dd/MM/yyyy"),
					"shiftDay": lookupModel.getProperty("/days")[tempDate.getDay()],
					"startTime": (rowElement.StartTime) ? rowElement.StartTime : "",
					"endTime": (rowElement.EndTime) ? rowElement.EndTime : "",
					"rateUnit": (rowElement.RateUnit) ? rowElement.RateUnit : "",
					"rateType": (rowElement.RateType) ? rowElement.RateType : "",
					"dayType": (rowElement.DayType) ? rowElement.DayType : "",
					"wbsElement": (rowElement.WBSElement) ? rowElement.WBSElement : (requestElement.wbsElement) ? requestElement.wbsElement : "",
					"department": (rowElement.Department) ? rowElement.Department : "",
					"itemRemarks": (rowElement.Remarks) ? rowElement.Remarks : ""
				};
				requestElement.selectedClaimDates.push(shiftDateElement);
			},
			/**
			 * Prepare Upload to Customer Portal Details for Mass Synthesis Requests Upload
			 */
			prepareCustomerPortalForMassSynthesis: function (requestElement, rowElement) {
				if (rowElement.MinistryStatutoryBoard && rowElement.Department && rowElement.SubBusinessUnit && rowElement.PortalAttentionTo &&
					rowElement.InvoicingInstructionID && rowElement.Description && rowElement.LineItemSNo &&
					rowElement.PortallineItemDescription && rowElement.Quantity && rowElement.UnitPrice && rowElement.GST && rowElement.AmountwithGST) {
					requestElement.portalList = (requestElement.portalList instanceof Array) ? requestElement.portalList : [];
					var portalElement = {};
					portalElement.govMinistry = this.removeLeadingZeroes(rowElement.MinistryStatutoryBoard);
					portalElement.govDepartment = this.removeLeadingZeroes(rowElement.Department);
					portalElement.govSubBU = this.removeLeadingZeroes(rowElement.SubBusinessUnit);
					portalElement.govAttnTo = this.removeLeadingZeroes(rowElement.PortalAttentionTo);
					portalElement.govInstId = this.removeLeadingZeroes(rowElement.InvoicingInstructionID);
					portalElement.govMainDesc = this.removeLeadingZeroes(rowElement.Description);
					portalElement.govLineItemSNo = this.removeLeadingZeroes(rowElement.LineItemSNo);
					portalElement.govLineItemDesc = this.removeLeadingZeroes(rowElement.PortallineItemDescription);
					portalElement.govQuantity = this.removeLeadingZeroes(rowElement.Quantity);
					portalElement.govUnitPrice = this.removeLeadingZeroes(rowElement.UnitPrice);
					portalElement.govGst = this.removeLeadingZeroes(rowElement.GST);
					portalElement.govAmtWithGst = this.removeLeadingZeroes(rowElement.AmountwithGST);
					requestElement.portalList.push(portalElement);
					requestElement.uploadCustomerPortal = this.localizationBundle.getText("BillingReq.CustomerPortal.U2Key");
				}
			},
			/**
			 * Prepare Data for Mass Upload of Items
			 */
			prepareDetailsItemTemplate: function (itemElement, rowElement, requestData, validateSapElement, validateConfigElement) {
				itemElement.glAccount = this.removeLeadingZeroes(rowElement.GLAccount);
				itemElement.costCenter = this.removeLeadingZeroes(rowElement.CostCenter);
				itemElement.profitCenter = this.removeLeadingZeroes(rowElement.ProfitCenter);
				itemElement.wbsElement = this.removeLeadingZeroes(rowElement.WBSElement);
				itemElement.serviceOrder = this.removeLeadingZeroes(rowElement.ServiceOrder);
				itemElement.taxCode = this.convertToString(rowElement.TaxCode);
				itemElement.assignment = this.convertToString(rowElement.Assignment);
				itemElement.billingAmt = this.convertToString(rowElement.BillingAmount);
				itemElement.taxableAmt = this.convertToString(rowElement.TaxableAmount);
				itemElement.lineItemDesc = this.convertToString(rowElement.LineItemDescription);
				itemElement.lineItemDescPO = this.convertToString(rowElement.LineItemDescription);
				itemElement.sector = requestData.sector;
				// itemElement.businessArea = this.removeLeadingZeroes(rowElement.GLAccount);

				if (requestData.sector === "L") {
					//Profitability Segments Details
					itemElement.psSO = this.convertToString(rowElement.SalesOrder);
					itemElement.psSOItem = this.convertToString(rowElement.SalesOrderItem);
					itemElement.psCustomer = this.convertToString(rowElement.Customer);
					itemElement.psCustomerType = this.convertToString(rowElement.CustomerType);
					itemElement.psAccAssignment = this.convertToString(rowElement.AccountAssignmentGroup);
					itemElement.psSubCat = this.convertToString(rowElement.SubCategory);
					itemElement.psSalesType = this.convertToString(rowElement.SalesType);
					itemElement.psSubSalesType = this.convertToString(rowElement.SubSalesType);
					itemElement.psCountry = this.convertToString(rowElement.Country);
					itemElement.psOrdIndicator = (rowElement.OrdinanceIndicator === "Y") ? true : false;
					itemElement.psLocalExport = this.convertToString(rowElement.LocalExport);
					itemElement.psProduct = this.convertToString(rowElement.Product);
					itemElement.psRegionCode = this.convertToString(rowElement.RegionCode);
				}

				this.prepareDataForValidationWithSap(itemElement, requestData, validateSapElement);

				this.prepareDataForValidationAgainstConfig(itemElement, requestData, false, validateConfigElement);
			},
			/**
			 * Prepare Data for Validation with SAP
			 */
			prepareDataForValidationWithSap: function (itemElement, data, validateSapElement, counter) {
				// var customerHeader = [];
				var requestElement = {};
				var tempDate = new Date();
				counter = (counter) ? counter : "1";
				if (validateSapElement[counter]) {
					requestElement = validateSapElement[counter];
					// requestElement = (customerHeader && customerHeader instanceof Array) ? customerHeader[0] : "";
				} else {
					//Prepare Header Element
					requestElement.DocSno = counter;
					requestElement.CompCode = data.companyCode;
					requestElement.DocDate = "/Date(" + tempDate.getTime() + ")/";
					requestElement.PstngDate = "/Date(" + tempDate.getTime() + ")/";
					requestElement.TransDate = "/Date(" + tempDate.getTime() + ")/";
					requestElement.DocType = (data.docType) ? data.docType : "RI";
					requestElement.AcDocNo = counter;
					requestElement.BusAct = (data.sector === "E" || data.sector === "M") ? "SD00" : "RFBU";

					//Amend Customer Entry in the first Line Item
					var postKeyElement = {
						"DocSno": requestElement.DocSno,
						"DocItem": Formatter.paddingWithLeadingZeroes(1, 3),
						"PostKey": "01",
						"GlAcct": (data.customerCode) ? data.customerCode : "",
						"DocAmt": (data.totalBillingAmount) ? data.totalBillingAmount + "" : "0.00",
						"Currency": (data.currency) ? data.currency : "SGD",
						"PayTerms": (data.paymentTerm) ? data.paymentTerm : "",
						"BaselnDate": "/Date(" + tempDate.getTime() + ")/",
						"AssignNo": "",
						"TaxCode": "",
						"CostCenter": "",
						"WbsElement": "",
						"ProfitCent": "",
						"Segment": "",
						"Orderno": "",
						"TradPartn": "",
						"FunctArea": ""
					};
					requestElement.head_items = [];
					requestElement.head_return = [];
					requestElement.head_items.push(postKeyElement);
				}

				this.prepareBRItemssElement(data, requestElement, itemElement, tempDate);

				validateSapElement[counter] = requestElement;
			},
			/**
			 * Prepare Data for Validation Against PO Configuration
			 */
			prepareDataForValidationAgainstConfig: function (itemElement, requestData, isMassRequestUpload, validateConfigElement, counter) {
				// var customerHeader = [];
				var requestElement = {};
				var tempDate = new Date();
				counter = (counter) ? counter : "1";
				if (validateConfigElement[counter]) {
					requestElement = validateConfigElement[counter];
					// requestElement = (customerHeader && customerHeader instanceof Array) ? customerHeader[0] : "";
				} else {
					//Prepare Header Element
					requestElement.currency = requestData.currency;
					requestElement.customerCode = requestData.customerCode;
					requestElement.paymentTerm = requestData.paymentTerm;
					requestElement.serialNo = requestData.serialNo;
					if (!isMassRequestUpload) {
						requestElement.glReconAccount = requestData.glReconAccount;
						requestElement.corpGrp = requestData.corpGrp;
					}
				}
				requestElement.itemDto = (requestElement.itemDto) ? requestElement.itemDto : [];
				requestElement.itemDto.push(itemElement);
				validateConfigElement[counter] = requestElement;
			},
			/**
			 * Prepare Item Element Element for Billing Request Posting
			 */
			prepareBRItemssElement: function (data, requestElement, itemElement, tempDate) {
				var postItemElement;
				var that = this;
				postItemElement = {
					"DocSno": requestElement.DocSno,
					"DocItem": Formatter.paddingWithLeadingZeroes(itemElement.itemNo + 1, 3),
					"PostKey": "50",
					"GlAcct": (itemElement.glAccount) ? itemElement.glAccount : "",
					"DocAmt": (itemElement.billingAmt) ? itemElement.billingAmt + "" : "0.00",
					"Currency": (data.currency) ? data.currency : "SGD",
					"PayTerms": (data.paymentTerm) ? data.paymentTerm : "",
					"BaselnDate": "/Date(" + tempDate.getTime() + ")/",
					"TaxCode": (itemElement.taxCode) ? itemElement.taxCode : "",
					// "BusArea": (itemElement.businessArea) ? itemElement.businessArea : "",
					"CostCenter": (itemElement.costCenter) ? itemElement.costCenter : "",
					"WbsElement": (itemElement.wbsElement) ? itemElement.wbsElement : "",
					"ProfitCent": (itemElement.profitCenter) ? itemElement.profitCenter : "",
					"Orderno": (itemElement.serviceOrder) ? itemElement.serviceOrder : "",
					"AssignNo": "",
					"Segment": "",
					"TradPartn": "",
					"FunctArea": "",
				};

				if (data.sector === "L") { //Assign Profit Segment Properties for Land Sector
					that.prepareProfitSegmentProperties(postItemElement, itemElement);
				}
				requestElement.head_items.push(postItemElement);
			},
			prepareProfitSegmentProperties: function (requestElement, dataElement) {
				requestElement.Salestyp = (dataElement && dataElement.psSalesType) ? dataElement.psSalesType : "";
				requestElement.Subsaltyp = (dataElement && dataElement.psSubSalesType) ? dataElement.psSubSalesType : "";
				requestElement.Ordnind = (dataElement && dataElement.psOrdinanceIndicator) ? "O" : "";
				requestElement.Locexport = (dataElement && dataElement.psLocalExport) ? "L" : "E";
				requestElement.Custtyp = (dataElement && dataElement.psCustomerType) ? dataElement.psCustomerType : "";
				requestElement.SubCat = (dataElement && dataElement.psSubCat) ? dataElement.psSubCat : "";
				requestElement.Account = (dataElement && dataElement.psAccAssignment) ? dataElement.psAccAssignment : "";
				requestElement.Actassgrp = (dataElement && dataElement.psAccAssignment) ? dataElement.psAccAssignment : "";
				requestElement.Prodnumber = (dataElement && dataElement.psProduct) ? dataElement.psProduct : "";
				requestElement.Regcode = (dataElement && dataElement.psRegionCode) ? dataElement.psRegionCode : "";
				requestElement.Custno = (dataElement && dataElement.psCustomer) ? dataElement.psCustomer : "";
				requestElement.Salord = (dataElement && dataElement.psSO) ? dataElement.psSO : "";
				requestElement.Salitem = (dataElement && dataElement.psSOItem) ? dataElement.psSOItem : "";
			},
			/**
			 * Manage SAP Validate Response
			 */
			manageValidateSapResponseForOTC: function (batchResponse, templateData, bundle, isMassRequestUpload) {
				var sapBatchResponse;
				//TO DO for Error Cases
				// templateData.errorMessageList = [];
				if (batchResponse.__changeResponses && batchResponse.__changeResponses instanceof Array) {
					batchResponse = batchResponse.__changeResponses[0];
					sapBatchResponse = (batchResponse.data && batchResponse.data.headers && batchResponse.data.headers.results instanceof Array) ?
						batchResponse.data.headers.results : [];
					var that = this;
					jQuery.sap.each(sapBatchResponse, function (i, batchElement) {
						// errorElement = {};
						that.manageSuccessOrErrorHandlingForOTC(batchElement, templateData, isMassRequestUpload, bundle);
					});
				} else { // Technical Error Occurred
					batchResponse = JSON.parse(batchResponse.response.body);
					var displayErrorElement = {};
					if (!isMassRequestUpload) {
						displayErrorElement.description = "Technical Error Occurred while simulation.\n";
						displayErrorElement.description += batchResponse.error.message.value;
						displayErrorElement.counter = 1;
						templateData.errorMessageList.push(displayErrorElement);
					} else {
						templateData.errorMessageList = [{
							"IsTechnicalError": true,
							"Status": bundle.getText("Inbox.Error.Technical.Status"),
							"Message": bundle.getText("Inbox.Error.Technical")
						}];
					}
				}
			},
			/**
			 * Success / Error Handling For OTC
			 */
			manageSuccessOrErrorHandlingForOTC: function (batchElement, templateData, isMassRequestUpload, bundle) {
				var isCheckForSuccessCase = true;

				if (batchElement.head_return && batchElement.head_return.results instanceof Array && batchElement.head_return.results.length > 0) {
					var returnResults = batchElement.head_return.results;
					var returnElement, displayErrorElement;
					var errorElement = {};
					for (var r in returnResults) {
						returnElement = returnResults[r];
						if (isMassRequestUpload) {
							displayErrorElement = (errorElement[batchElement.DocSno + returnElement.Number]) ? errorElement[batchElement.DocSno +
								returnElement.Number] : {};
						} else {
							displayErrorElement = (errorElement[returnElement.Row]) ? errorElement[returnElement.Row] : {};
						}
						isCheckForSuccessCase = (isCheckForSuccessCase && returnElement.Type === "W" && (returnElement.Id && returnElement.Id ===
							"CRDLIMIT")) ? isCheckForSuccessCase : false;
						if ((returnElement.Type === "W" || returnElement.Type === "E") && (!returnElement.Id || returnElement.Id !== "CRDLIMIT")) {
							displayErrorElement.status = returnElement.Type;
							displayErrorElement.type = "Error";
							displayErrorElement.state = "Error";
							displayErrorElement.message = (displayErrorElement.message) ? displayErrorElement.message + "\n" : "";
							displayErrorElement.message += (returnElement.Message) ? returnElement.Message.trim() : "";
							displayErrorElement.message += (returnElement.MessageV1) ? " " + returnElement.MessageV1.trim() : "";
						}

						if (displayErrorElement.message) {
							displayErrorElement.counter = (displayErrorElement.counter) ? displayErrorElement.counter : 0;
							displayErrorElement.counter++;
							if (isMassRequestUpload) {
								displayErrorElement.title = "Request #" + batchElement.DocSno;
								displayErrorElement.subtitle = batchElement.DocSno;
							} else {
								displayErrorElement.title = isMassRequestUpload ? ((Number(returnElement.Number) - 1) ? "Item #" + (Number(returnElement.Number) -
									1) : "Request #" + batchElement.DocSno) : "Item #" + (Number(returnElement.Row) - 1);
							}
							displayErrorElement.description = displayErrorElement.message;
							if (isMassRequestUpload) {
								errorElement[batchElement.DocSno + returnElement.Number] = displayErrorElement;
							} else {
								errorElement[returnElement.Row] = displayErrorElement;
							}
						}
					}

					//Error List Amendment
					jQuery.sap.each(errorElement, function (e, mElement) {
						templateData.errorMessageList.push(mElement);
					});

				} //else

				if (isCheckForSuccessCase) { //Handle For Success Case
					var that = this;
					var batchItems = (batchElement.head_items && batchElement.head_items.results instanceof Array) ? batchElement.head_items.results : [];
					if (isMassRequestUpload) {
						//For Mass Synthesis to be handled differently
						jQuery.sap.each(templateData.requestList, function (re, requestElement) {
							that.prepareNBindBillingRequestHeader(requestElement, batchItems[0]);
							jQuery.sap.each(requestElement.itemsList, function (i, itemElement) {
								itemElement.sector = requestElement.sector;
								that.prepareNBindBillingRequestItems(itemElement, batchItems, errorElement, bundle);
							});
						});
					} else {
						jQuery.sap.each(templateData.itemsList, function (i, itemElement) {
							that.prepareNBindBillingRequestItems(itemElement, batchItems, errorElement, bundle);
						});
					}
				}
			},
			/**
			 * Manage SAP Validate Response from Database
			 */
			manageValidateConfigResponseForOTC: function (configResponse, templateData, calendarProps, bundle, isMassRequestUpload) {
				var that = this;
				var displayErrorElement;

				if (!isMassRequestUpload) {
					templateData.requestList.push({
						"serialNo": "1",
						"itemsList": templateData.itemsList
					});
				}
				jQuery.sap.each(templateData.requestList, function (t, requestElement) {
					jQuery.sap.each(configResponse.validationDtos, function (v, responseElement) {
						if (Number(requestElement.serialNo) === Number(responseElement.serialNo)) {
							displayErrorElement = {};
							requestElement.customerType = responseElement.customerType;
							requestElement.billingDate = that.getBillingDateForMassSubmission(calendarProps, responseElement.billingDays);
							requestElement.billingCutoffDate = requestElement.billingDate;
							that.prepareNBindBillingRequestItemsFromConfig(requestElement, responseElement, displayErrorElement, configResponse.taxType);
							if (Object.keys(displayErrorElement).length > 0) {
								displayErrorElement.title = "Request #" + requestElement.serialNo;
								displayErrorElement.subtitle = requestElement.serialNo;
								displayErrorElement.description = displayErrorElement.message;
								templateData.errorMessageList.push(displayErrorElement);
							}
						}
					});
				});
			},
			prepareNBindBillingRequestItemsFromConfig: function (requestElement, responseElement, displayErrorElement, taxType) {
				if (requestElement.itemsList instanceof Array && responseElement.itemDto instanceof Array && responseElement.itemDto.length ===
					requestElement.itemsList.length) {
					var tempLength = requestElement.itemsList.length;
					var itemElement, itemResponseElement;
					for (var i = 0; i < tempLength; i++) {
						itemElement = requestElement.itemsList[i];
						itemResponseElement = responseElement.itemDto[i];
						if (Number(itemElement.itemNo) === Number(itemResponseElement.itemNo)) {
							if (itemResponseElement.message) {
								displayErrorElement.status = "E";
								displayErrorElement.type = "Error";
								displayErrorElement.state = "Error";
								displayErrorElement.message = (displayErrorElement.message) ? displayErrorElement.message + "\n" : "";
								displayErrorElement.message += itemResponseElement.message;
							} else {
								itemElement.glAccountName = itemResponseElement.glAccountDesc;
								itemElement.taxPercent = (itemResponseElement.taxPercent) ? itemResponseElement.taxPercent.replace("%", "") : "";
								itemElement.taxType = taxType;
							}
						}
					}
					// jQuery.sap.each(requestElement.itemsList, function (t, itemElement) {
					// 	jQuery.sap.each(responseElement.itemDto, function (v, itemResponseElement) {});
					// });
				}
			},
			/**
			 * Get Billing Cutoff Date
			 */
			getBillingDateForMassSubmission: function (calendarProps, billingDays) {
				var cutoffDate;
				var tempDate = new Date();
				var tempMonth = 1;
				jQuery.sap.each(calendarProps.months, function (mK, mV) {
					if ((tempDate.getMonth() + tempMonth) === Number(mV)) {
						jQuery.sap.each(billingDays, function (b, dayElement) {
							if (mK === dayElement.month) {
								cutoffDate = tempDate.getFullYear() + "-" + mV + "-" + dayElement.day;
							}
						});
					}
				});
				return cutoffDate;
			},
			prepareNBindBillingRequestHeader: function (requestElement, batchItemElement) {
				// jQuery.sap.each(batchItems, function (b, batchItemElement) {
				if (Number(batchItemElement.DocSno) === Number(requestElement.serialNo) && batchItemElement.GlAcct === requestElement.customerCode) {
					requestElement.customerName = (batchItemElement.CustName) ? batchItemElement.CustName.trim() : "";
					requestElement.paymentTermDesc = (batchItemElement.Paytermdesc) ? batchItemElement.Paytermdesc.trim() : "";
					requestElement.currencyDesc = (batchItemElement.Currdesc) ? batchItemElement.Currdesc.trim() : "";
					requestElement.creditLimit = (batchItemElement.DeltaCredLimit) ? batchItemElement.DeltaCredLimit.trim() : "";
					requestElement.creditLimitCurrency = (batchItemElement.Currency) ? batchItemElement.Currency.trim() : "";

					requestElement.billCity = (batchItemElement.City) ? batchItemElement.City.trim() : "";
					requestElement.billPostalCode = (batchItemElement.Postcode) ? batchItemElement.Postcode.trim() : "";
					requestElement.billStreet = (batchItemElement.Street) ? batchItemElement.Street.trim() : "";
					requestElement.billRegion = (batchItemElement.Region) ? batchItemElement.Region.trim() : "";
					requestElement.creditControl = batchItemElement.creditControl;
					requestElement.glReconAccount = (batchItemElement.Glrecoact) ? batchItemElement.Glrecoact.trim() : "";
					requestElement.corpGrp = (batchItemElement.Corpgrp) ? batchItemElement.Corpgrp.trim() : "";

					requestElement.customerAddressList = Formatter.mapCustomerAddress(batchItemElement.Address);

					Formatter.mapCompanyNBankDetails(requestElement, batchItemElement.CompanyBank);
				}
				// });
			},
			prepareNBindBillingRequestItems: function (itemElement, batchItems, errorElement, bundle) {
				jQuery.sap.each(batchItems, function (b, batchItemElement) {
					if (Number(batchItemElement.DocItem) === (Number(itemElement.itemNo) + 1) && batchItemElement.GlAcct === itemElement.glAccount) {
						itemElement.profitCenterDesc = (itemElement.profitCenter && batchItemElement.ProfitName) ? batchItemElement.ProfitName.trim() :
							"";
						itemElement.costCenterDesc = (itemElement.costCenter && batchItemElement.CostName) ? batchItemElement.CostName.trim() : "";
						itemElement.wbsElementDesc = (itemElement.wbsElement && batchItemElement.WbseleName) ? batchItemElement.WbseleName.trim() : "";
						itemElement.serviceOrderDesc = (itemElement.serviceOrder && batchItemElement.OrderName) ? batchItemElement.OrderName.trim() :
							"";

						//Item Dependent Fields population
						itemElement.businessAreaInd = bundle.getText("BillingReq.Suppressed");
						if (!batchItemElement.Xspeb) { //Check if GL Account is Blocked
							itemElement.costCenterInd = (batchItemElement.Ccind) ? ((batchItemElement.Ccind === "+") ? bundle.getText(
									"BillingReq.Required") : (batchItemElement.Ccind === ".") ? bundle.getText("BillingReq.Optional") :
								bundle.getText("BillingReq.Suppressed")) : bundle.getText("BillingReq.Suppressed");
							itemElement.profitCenterInd = (batchItemElement.Pcind) ? ((batchItemElement.Pcind === "+") ? bundle.getText(
									"BillingReq.Required") : (batchItemElement.Pcind === ".") ? bundle.getText("BillingReq.Optional") :
								bundle.getText("BillingReq.Suppressed")) : bundle.getText("BillingReq.Suppressed");
							itemElement.svcOrderInd = (batchItemElement.Soind) ? ((batchItemElement.Soind === "+") ? bundle.getText(
									"BillingReq.Required") : (batchItemElement.Soind === ".") ? bundle.getText("BillingReq.Optional") :
								bundle.getText("BillingReq.Suppressed")) : bundle.getText("BillingReq.Suppressed");
							itemElement.wbsElementInd = (batchItemElement.Wbsind) ? ((batchItemElement.Wbsind === "+") ? bundle.getText(
									"BillingReq.Required") : (batchItemElement.Wbsind === ".") ? bundle.getText("BillingReq.Optional") :
								bundle.getText("BillingReq.Suppressed")) : bundle.getText("BillingReq.Suppressed");
							itemElement.profitSegmentInd = (batchItemElement.Psind && itemElement.sector === "L") ? ((batchItemElement.Psind === "+") ?
								bundle.getText("BillingReq.Required") : (batchItemElement.Psind === "." && itemElement.sector === "L") ? bundle.getText(
									"BillingReq.Optional") :
								bundle.getText("BillingReq.Suppressed")) : bundle.getText("BillingReq.Suppressed");

							if (itemElement.profitSegmentInd !== bundle.getText("BillingReq.Suppressed") && itemElement.sector === "L") {
								itemElement.profitSegmentText = bundle.getText("BillingReq.ProfitSegments.Title");
							} else {
								itemElement.profitSegmentText = "";
								itemElement.psSO = "";
								itemElement.psSOItem = "";
								itemElement.psCustomer = "";
								itemElement.psCustomerType = "";
								itemElement.psAccAssignment = "";
								itemElement.psSubCat = "";
								itemElement.psSalesType = "";
								itemElement.psSubSalesType = "";
								itemElement.psCountry = "";
								itemElement.psOrdIndicator = false;
								itemElement.psLocalExport = "";
								itemElement.psProduct = "";
								itemElement.psRegionCode = "";
							}
						} else {
							// If GL Account Blocked, then select a different one
						}
					}
				});
			},

			convertTextToHtml: function (tempVal) {
				tempVal = (tempVal) ? (tempVal + "").trim() : "";
				var splittedText = tempVal.split("\n");
				var formattedtext = "";
				jQuery.sap.each(splittedText, function (s, text) {
					formattedtext += (text) ? "<p>" + text + "</p>" : "";
				});
				return Formatter.formatLineItemDescPO(formattedtext);

			},
			convertToString: function (tempVal) {
				tempVal = (tempVal) ? (tempVal + "").trim() : "";
				return tempVal;
			},
			convertToDecimal: function (tempVal, sourceType) {
				tempVal = (tempVal) ? (tempVal + "").trim() : "";
				tempVal = (tempVal && sourceType === "decimal") ? Number(tempVal).toFixed(2) : "";
				return tempVal;
			},
			removeLeadingZeroes: function (tempVal, sourceType) {
				tempVal = (tempVal) ? tempVal + "" : "";
				tempVal = (tempVal) ? tempVal.replace(/^0+/, '') : tempVal;
				return tempVal;
			}
		};
	});