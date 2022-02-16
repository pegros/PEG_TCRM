({
/***
* @author P-E GROS
* @date   Sept. 2020
* @description  Aura Component to load Context data for the Merge utility.
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2020 pegros
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
***/
	performInit : function(component,event,helper) {
        //console.log("performInit: START");

        let initCount = 5; // 5 items to init : RT, LV, RPT, PL, roles
        //console.log("performInit: initCount init",initCount);
        
        let recordTypesStr = component.get("v.recordTypesStr");
        //console.log("performInit: recordTypesStr fetched",recordTypesStr);
        if (recordTypesStr) {
            let recordTypesList = JSON.parse(recordTypesStr);
            //console.log("performInit: recordTypesList parsed",recordTypesList);

            let rtFetchAction = component.get("c.getRecordTypeIDs");
    		rtFetchAction.setParams({"names":  recordTypesList });
	    	//console.log('performInit: rtFetchAction params set ',JSON.stringify(rtFetchAction.getParams()));
        
    		rtFetchAction.setCallback(this, function(response){
            	//console.log('performInit: rtFetchAction response received',response);
            
            	if (response.getState() == "SUCCESS"){
                	console.log('performInit: rtFetchAction OK response received ',JSON.stringify(response.getReturnValue()));
                    let contextMgr = component.find("contextMgr");
                    
					let context = contextMgr.getValue();
					if (context) {
				    	context.RT = response.getReturnValue();
					}
                    else {
						context = {"RT" : response.getReturnValue()};
					}
                    
					initCount--;
					//console.log("performInit: recordTypes fetched / initCount ",initCount);
                    if (initCount == 0) context.isReady = true;
                    
					contextMgr.setValue(context);
                	//console.log('performInit: END --> context update with RT ',context);
        		}
                else {
            		console.warn('performInit: END --> KO rtFetchAction ',JSON.stringify(response.getError()));
                }
        	});
        	//console.log('performInit: rtFetchAction set');
               
       		$A.enqueueAction(rtFetchAction);
        	//console.log('performInit: rtFetchAction sent'); 
        }
        else {
            initCount--;
        	console.log("performInit: no recordTypes to fetch / initCount ",initCount);
        }
            
        let listViewStr = component.get("v.listViewStr");
        //console.log("performInit: listViewStr fetched",listViewStr);
 		if (listViewStr) {
            let listViewList = JSON.parse(listViewStr);
            //console.log("performInit: listViewList parsed",listViewList);

			let lvFetchAction = component.get("c.getListViewIDs");
    		lvFetchAction.setParams({"names":  listViewList });
	    	//console.log('performInit: lvFetchAction params set ',JSON.stringify(lvFetchAction.getParams()));
        
    		lvFetchAction.setCallback(this, function(response){
            	//console.log('performInit: lvFetchAction response received',response);
            
            	if (response.getState() == "SUCCESS"){
                	//console.log('performInit: lvFetchAction OK response received ',JSON.stringify(response.getReturnValue()));
                    let contextMgr = component.find("contextMgr");  
					let context = contextMgr.getValue();
					if (context) {
				    	context.LV = response.getReturnValue();
					}
                    else {
						context = {"LV" : response.getReturnValue()};
					}
                    
                    initCount--;
					//console.log("performInit: listViews fetched / initCount ",initCount);
                    if (initCount == 0) context.isReady = true;
                    
					contextMgr.setValue(context);
                	//console.log('performInit: END --> context update with LV ',context);
        		}
                else {
            		console.warn('performInit: END --> KO lvFetchAction ',JSON.stringify(response.getError()));
                }
        	});
        	//console.log('performInit: lvFetchAction set');
               
       		$A.enqueueAction(lvFetchAction);
        	//console.log('performInit: lvFetchAction sent'); 
		}
		else {
            initCount--;
        	console.log("performInit: no listViews to fetch / initCount ",initCount);
        }
        
        let reportStr = component.get("v.reportStr");
        //console.log("performInit: reportStr fetched",reportStr);
 		if (reportStr) {
            let reportList = JSON.parse(reportStr);
            //console.log("performInit: reportList parsed",reportList);

			let reportFetchAction = component.get("c.getReportIDs");
    		reportFetchAction.setParams({"names":  reportStr });
	    	//console.log('performInit: reportFetchAction params set ',JSON.stringify(reportFetchAction.getParams()));
        
    		reportFetchAction.setCallback(this, function(response){
            	//console.log('performInit: reportFetchAction response received',response);
            
            	if (response.getState() == "SUCCESS"){
                	console.log('performInit: reportFetchAction OK response received ',JSON.stringify(response.getReturnValue()));
                    let contextMgr = component.find("contextMgr");  
					let context = contextMgr.getValue();
					if (context) {
				    	context.RPT = response.getReturnValue();
					}
                    else {
						context = {"RPT" : response.getReturnValue()};
					}
                    
                    initCount--;
					//console.log("performInit: reports fetched / initCount ",initCount);
                    if (initCount == 0) context.isReady = true;
                    
					contextMgr.setValue(context);
                	//console.log('performInit: END --> context update with RPT ',context);
        		}
                else {
            		console.warn('performInit: END --> KO reportFetchAction ',JSON.stringify(response.getError()));
                }
        	});
        	//console.log('performInit: reportFetchAction set');
               
       		$A.enqueueAction(reportFetchAction);
        	//console.log('performInit: reportFetchAction sent'); 
		}
        else {
            initCount--;
        	console.log("performInit: no reports to fetch / initCount ",initCount);
        }
        
		//BDU 13.10.2020 Get Reciprocal Role IDs
        //@TODO respecter le nommage des champs du composant: le paramètre devrait être 'reciprocalRoleStr' !!
		let reciprocalRoleStr = component.get("v.ObjReciprocalRole");
        //console.log("performInit: reciprocalRoleStr fetched",reciprocalRoleStr);
        if (reciprocalRoleStr) {
            let reciprocalRoleList = JSON.parse(reciprocalRoleStr);
            //console.log("performInit: reciprocalRoleList parsed",reciprocalRoleList);

            let reciprocalRoleFetchAction = component.get("c.getReciprocalRoleIDs");
    		reciprocalRoleFetchAction.setParams({"roleNames":  reciprocalRoleList });
			//console.log('performInit: reciprocalRoleFetchAction params set ',JSON.stringify(reciprocalRoleFetchAction.getParams()));
			let contextMgr = component.find("contextMgr");
            //console.log('performInit: bdu ' , contextMgr);
            //console.log('performInit: bdu ' , contextMgr.getValue());

    		reciprocalRoleFetchAction.setCallback(this, function(response){
            	//console.log('performInit: reciprocalRoleFetchAction response received',response);
            
            	if (response.getState() == "SUCCESS"){
                	console.log('performInit: reciprocalRoleFetchAction OK response received ',JSON.stringify(response.getReturnValue()));
                    let contextMgr = component.find("contextMgr");
                    
					let context = contextMgr.getValue();
					if (context) {
				    	context.ROLE = response.getReturnValue();
					} else {
						context = {"ROLE" : response.getReturnValue()};
					}
                    
                    initCount--;
					//console.log("performInit: roles fetched / initCount ",initCount);
                    if (initCount == 0) context.isReady = true;
                    
					contextMgr.setValue(context);
                	//console.log('performInit: END --> context update with RT ',context);
        		}
                else {
            		console.warn('performInit: END --> KO reciprocalRoleFetchAction ',JSON.stringify(response.getError()));
                }
        	});
        	//console.log('performInit: reciprocalRoleFetchAction set');
               
       		$A.enqueueAction(reciprocalRoleFetchAction);
        	//console.log('performInit: reciprocalRoleFetchAction sent'); 
        }
        else {
            initCount--;
        	console.log("performInit: no roles to fetch / initCount ",initCount);
        }
        
        
        let picklistStr = component.get("v.picklistStr");
        //console.log("performInit: picklistStr fetched",picklistStr);
        if (picklistStr) {
            let picklistList = JSON.parse(picklistStr);
            //console.log("performInit: picklistList parsed",picklistList);

            let picklistFetchAction = component.get("c.getPicklistDetails");
    		picklistFetchAction.setParams({"names":  picklistList });
			//console.log('performInit: picklistFetchAction params set ',JSON.stringify(picklistFetchAction.getParams()));
			let contextMgr = component.find("contextMgr");

    		picklistFetchAction.setCallback(this, function(response){
            	//console.log('performInit: picklistFetchAction response received',response);
            
            	if (response.getState() == "SUCCESS"){
                	console.log('performInit: picklistFetchAction OK response received ',JSON.stringify(response.getReturnValue()));
                    let contextMgr = component.find("contextMgr");
                    
					let context = contextMgr.getValue();
					if (context) {
				    	context.PL = response.getReturnValue();
					}
                    else {
						context = {"PL" : response.getReturnValue()};
					}
                    
                    initCount--;
					//console.log("performInit: picklist fetched / initCount ",initCount);
                    if (initCount == 0) context.isReady = true;
                    
					contextMgr.setValue(context);
                	//console.log('performInit: END --> context update with PL ',context);
        		}
                else {
            		console.warn('performInit: END --> KO picklistFetchAction ',JSON.stringify(response.getError()));
                }
        	});
        	//console.log('performInit: picklistFetchAction set');
               
       		$A.enqueueAction(picklistFetchAction);
        	//console.log('performInit: picklistFetchAction sent'); 
        }
        else {
            initCount--;
        	console.log("performInit: no roles to fetch / initCount ",initCount);
        }
        
        //console.log("performInit: END");
	}
})