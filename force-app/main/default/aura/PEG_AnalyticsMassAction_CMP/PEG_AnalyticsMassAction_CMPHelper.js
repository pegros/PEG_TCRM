({
/***
* @author P-E GROS
* @date   Sept. 2020
* @description  Aura Component to execute a mass create action based on a Tableau CRM Dashboard selection.
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

    //-------------------------------------------------------------------
    // Global parameters, shared among all running instances of the component 48
    //-------------------------------------------------------------------
    SDK_CONTEXT: {
        apiVersion: "52"
    },
    DASHBOARDS: {},
    DATASETS: {},
    FILTERS: {},
    MAPPINGS: {},
    ERROR_MESSAGES:null,
    SAQL_LIMIT: 25000,

    //-------------------------------------------------------------------
    // Component initialization method
    //-------------------------------------------------------------------
    doInit : function(component, event, helper) {
        console.log('doInit: START');

        let actionResult = {
            display: false
        };
        component.set("v.actionResult",actionResult);
        console.log('doInit: actionResult init ',actionResult);

        let dashboardFilter = component.get("v.dashboardFilter");
        if (dashboardFilter) {
            console.log('doInit: dashboardFilter configuration fetched ',dashboardFilter);
            component.find('filterMergeUtil').merge(
                dashboardFilter,
                null,
                function(mergeResult,mergeError) {
                    console.log('doInit: result from filter merge',mergeResult);
                    if (mergeResult) {
                        //let dashboardFilterJson = JSON.parse(mergeResult);
                        let dashboardFilterJson = mergeResult;
                        console.log('doInit: dashboardFilterJson parsed',dashboardFilterJson);
                        component.set("v.dashboardFilterJson",dashboardFilterJson);
                        console.log('doInit: END OK / after filter merge');
                        component.set("v.filterReady",true);
                    }
                    else {
                        console.warn('doInit: END KO / filter merging issue',mergeError);
                    }
                });
            console.log('doInit: filter merge triggered');
        }
        else {
            console.log('doInit: no dashboardFilter configuration set');
            component.set("v.filterReady",true);
        }

        let fieldList = component.get("v.fieldList");
        if (fieldList) {
            console.log('doInit: list of fields fetched ',fieldList);
            let fieldListJson = JSON.parse(fieldList);
            console.log('doInit: list of fields parsed ',fieldListJson);
            component.set("v.fieldListJson",fieldListJson);
        }
        else {
            console.warn('doInit: list of fields missing');  
            component.set("v.fieldListJson",[]);
        }

        let otherFields = component.get("v.otherFields");
        if (otherFields) {
            console.log('doInit: other EA/Core Fields fetched ',otherFields);
            let otherFieldsJson = JSON.parse(otherFields);
            console.log('doInit: other EA/Core Fields parsed ',otherFieldsJson);
            component.set("v.otherFieldsJson",otherFieldsJson);
        }
        else {
            console.warn('doInit: other EA/Core Fields missing');            
        }

        let baseTarget = component.get("v.baseTarget");
        let queryBase = component.get("v.queryBase");
        
        if ((baseTarget) && (queryBase)){
            console.log('doInit: base Target fetched ',baseTarget);
            console.log('doInit: query base fetched ',queryBase);
            
            let configBase = '{"target":' + baseTarget + ',"query":"' + queryBase + '"}';
            console.log('doInit: configBase set ', configBase);
            if (configBase.includes('{{{')) {
                console.log('doInit: triggering merge');
                component.find('mergeUtil').merge(
                    configBase,
                    null,
                    function(mergeResult,mergeError) {
                        console.log('doInit: result from merge',mergeResult);
                        if (mergeResult) {
                            let configBaseJson = JSON.parse(mergeResult);
                            console.log('doInit: configBaseJson parsed',configBaseJson);
                            component.set("v.baseTargetJson",configBaseJson.target);
                            component.set("v.queryBaseMerged",configBaseJson.query);
                            console.log('doInit: END OK / after merge');
                        }
                        else {
                            console.warn('doInit: END KO / merging issue',mergeError);
                        }
                    });
                console.log('doInit: merge triggered');
            }
            else {
                let baseTargetJson = JSON.parse(baseTarget);
                console.log('doInit: baseTargetJson parsed',baseTargetJson);
                component.set("v.baseTargetJson",baseTargetJson);
                console.log('doInit: setting queryBaseMerged without merge ',queryBase);
                component.set("v.queryBaseMerged",queryBase);
                console.log('doInit: END / no merge');
            }
        }
        else {          
            console.warn('doInit: END KO / base Target or query base missing');            
        }
    },

    //-------------------------------------------------------------------
    // Methods to fetch Dashboard and Dataset descriptions
    //-------------------------------------------------------------------
    finalizeInit: function(component, event, helper) {
		console.log('finalizeInit: START');

        let dashboardName = component.get("v.dashboardName");
		console.log('finalizeInit: dashboardName fetched ',dashboardName);
        
		let analyticsSDK = component.find("analyticsSDK");
		console.log('finalizeInit: analyticsSDK found',analyticsSDK);
       
        // @TODO: restore configuration via devName instead of ID 
		component.set("v.dashboardId",dashboardName);
		console.log('finalizeInit: END / fetching Dashboard initial state');
		helper.fetchDBState(dashboardName,component,helper);
        /*analyticsSDK.invokeMethod(
    		helper.SDK_CONTEXT,
            "listDashboards",
            {"sort": "Name", "q": dashboardName},
          	//{"sort": "Name"},
            $A.getCallback(function(dbErr, dbData) { 
				console.log("finalizeInit: dbData received ",JSON.stringify(dbData));  
              	if (dbErr !== null) {
                    console.error("finalizeInit: END KO / dashboard ID fetch error: ", dbErr);
              	}
                else {
                    console.log('finalizeInit: dashboard ID fetched ',JSON.stringify(dbData));
                    console.log('finalizeInit: dashboards fetched ',JSON.stringify(dbData.dashboards));
                    console.log('finalizeInit: dashboards length ',dbData.dashboards.length);
                    if ((dbData.dashboards) && (dbData.dashboards.length > 0)) {
        	            console.log('finalizeInit: extracting Dashboard ID');
	                	let dashboardId = (dbData.dashboards)[0].id;
    	                component.set("v.dashboardId",dashboardId);
        	            console.log('finalizeInit: END / fetching Dashboard initial state');
            	        helper.fetchDBState(dashboardId,component,helper);
                	}
                	else {
                        console.error("finalizeInit: END KO / dashboard not found "); 
                    } 
              	}
        		console.log('finalizeInit: END');     
            }));
        
        console.log('finalizeInit: fetching dashboard ID');*/
    },
    fetchDBState: function(dashboardId, component, helper) {
		console.log('fetchDBState: START with Dashboard ID ',dashboardId);
        //console.log('finalizeInit: event params ', JSON.stringify(event.getParams()));
        
        let analyticsDB = component.find("analyticsDB");
        console.log('fetchDBState: analyticsDB found',analyticsDB);
        
        let config = {};
        analyticsDB.getState(
            config,
            $A.getCallback(function(stateData) {
                console.log('fetchDBState: DB state received',JSON.stringify(stateData));
                
                //let dashboardId = component.get("v.dashboardId");
        		//console.log('finalizeInit: dashboardId fetched ',dashboardId);
                //component.set("v.dashboardId",stateData.id);
                let analyticsSDK = component.find("analyticsSDK");
        		console.log('fetchDBState: analyticsSDK found ',analyticsSDK);

                //if (!((helper.DASHBOARDS)[stateData.id])) {
                if (!((helper.DASHBOARDS)[dashboardId])) {
                    console.log('fetchDBState: fetching dashboard desc for DB Id ',stateData.id);
                	//helper.fetchDashboardDesc(stateData.id,stateData.payload.state,analyticsSDK,component,helper);
                	helper.fetchDashboardDesc(dashboardId,stateData.payload.state,analyticsSDK,component,helper);
                    console.log('fetchDBState: END dashboard desc fetch requested ');
                }
                else {
                    //console.log('finalizeInit: dashboard desc already available for DB Id ',stateData.id);
                    console.log('fetchDBState: dashboard desc already available for DB Id ',dashboardId);
                    
                    //let datasetName = component.get("v.datasetName") || ((helper.DASHBOARDS)[stateData.id]).datasets[0].name;
                    let datasetName = component.get("v.datasetName") || ((helper.DASHBOARDS)[dashboardId]).datasets[0].name;
                    let datasetId = '';
                    //((helper.DASHBOARDS)[stateData.id]).datasets.forEach(function(dsItem) {
                    ((helper.DASHBOARDS)[dashboardId]).datasets.forEach(function(dsItem) {
                    	//console.log('finalizeInit: processing DS ',JSON.stringify(dsItem));
                        if (dsItem.name === datasetName) datasetId = dsItem.id;
                    });
                    component.set("v.datasetName",datasetName);
                    console.log('fetchDBState: target DS name set ', datasetName);
                    component.set("v.datasetId",datasetId);
                    console.log('fetchDBState: target DS Id set ', datasetId);
                    
                    //if (helper.MAPPINGS[stateData.id + '.' + datasetId]) {
                    if (helper.MAPPINGS[dashboardId + '.' + datasetId]) {
                        console.log('fetchDBState: END all is ready ');
                        component.set("v.initDone",true);
                    }
                    else {
                        console.log('fetchDBState: END requesting mapping finalisation ');
                        helper.finaliseDescs(component,helper);
                    }
                }
            })
        );
        console.log('fetchDBState: fetching DB state');	
	},
    fetchDashboardDesc : function(dbId,dbState,analyticsSDK,component,helper) {
		console.log('fetchDashboardDesc: START');
    
    	analyticsSDK.invokeMethod(
    		helper.SDK_CONTEXT,
            "describeDashboard",
            {"dashboardId": dbId},
            $A.getCallback(function(dbErr, dbData) {
              	if (dbErr !== null) {
                    console.error("fetchDashboardDesc: END SDK DB describe error received ", JSON.stringify(dbErr));
                }
                else {
                    console.log('fetchDashboardDesc: SDK DB data received ',JSON.stringify(dbData));
                    (helper.DASHBOARDS)[dbId] = dbData;
                    (helper.DASHBOARDS)[dbId].initState = dbState;
                    console.log('fetchDashboardDesc: DB desc registered');//,JSON.stringify(helper.DASHBOARDS));
                     
                    let ds2fetch = 0;
                    let datasetName = component.get("v.datasetName") || dbData.datasets[0].name;
                    let datasetId = '';
                    dbData.datasets.forEach(function(dsItem) {
                        if (dsItem.name === datasetName) datasetId = dsItem.id;
                        if (!((helper.DATASETS)[dsItem.id])) {
                    		console.log('fetchDashboardDesc: fetching dataset desc for DS Id ',dsItem.id);
                			ds2fetch += 1;
                            helper.fetchDatasetDesc(dsItem.id,analyticsSDK,component,helper);
                    		console.log('fetchDashboardDesc: dataset desc fetch requested ');
                		}
                		else {
                    		console.log('fetchDashboardDesc: dataset desc already available for DS Id ',dsItem.id);
                		}
                    });
                    console.log('fetchDashboardDesc: fetching desc for DS ', ds2fetch);
                    
                    component.set("v.datasetName",datasetName);
                    console.log('fetchDashboardDesc: target DS name set ', datasetName);
                    component.set("v.datasetId",datasetId);
                    console.log('fetchDashboardDesc: target DS Id set ', datasetId);
                    
                    if (ds2fetch == 0)  {
                        console.log('fetchDashboardDesc: requesting desc finalisation');
                        helper.finaliseDescs(component,helper);
                    	console.log('fetchDashboardDesc: END all DS desc ready ');
                    }
                    else {
                        console.log('fetchDashboardDesc: some DS desc to fetch ',ds2fetch);
                        component.set("v.ds2fetch",ds2fetch);
                    }
                }
            }));

		console.log('fetchDashboardDesc: Dashboard description requested');    
	},
    fetchDatasetDesc : function(dsId,analyticsSDK,component,helper) {
		console.log('fetchDatasetDesc: START');
        
        analyticsSDK.invokeMethod(
            helper.SDK_CONTEXT,
            "describeDataset",
            {"datasetId": dsId},
            $A.getCallback(function(dsErr, dsData) {
                if (dsErr !== null) {
                    console.error("fetchDatasetDesc: END KO / SDK describe DS error received ", JSON.stringify(dsErr));
              	}
                else {
                    console.log('fetchDatasetDesc: SDK DS data received ',JSON.stringify(dsData));
					(helper.DATASETS)[dsId] = dsData;
                    console.log('fetchDatasetDesc: DS desc registered',JSON.stringify(this.DATASETS));
                    
                    // fetching also dataset fields
                    analyticsSDK.invokeMethod(
                        helper.SDK_CONTEXT,
                        "getDatasetFields",
                        {'datasetId':dsData.id, "versionId": dsData.currentVersionId},
                        $A.getCallback(function(dsFieldErr, dsFieldData) {
                            if (dsFieldErr !== null) {
                                console.error("fetchDatasetDesc: END KO / SDK describe DS Field error received ", JSON.stringify(dsFieldErr));
              				}
                            else {
                                console.log('fetchDatasetDesc: SDK DS Field data received ',JSON.stringify(dsFieldData));
                            	(helper.DATASETS)[dsId].fields = dsFieldData;
                    			console.log('fetchDatasetDesc: DS Field describe results registered',JSON.stringify(helper.DATASETS));
                                        
                                let ds2fetch = component.get("v.ds2fetch") - 1;
                                component.set("v.ds2fetch",ds2fetch);
                    			console.log('fetchDatasetDesc: ds2fetch updated',ds2fetch);
                                
                                if (ds2fetch == 0) {
                    				console.log('fetchDatasetDesc: requesting desc finalisation');
                                    helper.finaliseDescs(component,helper);
                    				console.log('fetchDatasetDesc: END all DS desc fetched');
                                }
                                else {
                    				console.log('fetchDatasetDesc: END DS desc fetched');                                    
                                }
                            }
                        }));
					console.log('fetchDatasetDesc: DS fields description fetch requested');
                }
            }));
        
        console.log('fetchDatasetDesc: DS desc fetch requested');
    },
    
	//-------------------------------------------------------------------
    // Utility Methods to finalise the Dashboard filter mapping configuration
    //-------------------------------------------------------------------
    finaliseDescs : function(component,helper) {
        console.log('finaliseDescs: START');
        
        let dashboardId = component.get("v.dashboardId");
        console.log('finaliseDescs: dashboardId fetched', dashboardId);
        let datasetId	= component.get("v.datasetId");
        console.log('finaliseDescs: datasetId fetched', datasetId);
        let datasetName	= component.get("v.datasetName");
        console.log('finaliseDescs: datasetName fetched', datasetName);
        
        let dbDesc = helper.DASHBOARDS[dashboardId];
        console.log('finaliseDescs: dashboard desc fetched');//, JSON.stringify(dbDesc));
        let dsDesc = helper.DATASETS[datasetId];
        console.log('finaliseDescs: target dataset desc fetched');//, JSON.stringify(dsDesc));

        // Analysing field connections among datasets within dashboard
        let linkMapping = helper.initLinks(dbDesc,datasetName);
        console.log('finaliseDescs: linkMapping ready');

        // Processing main filters
        let filterMapping = helper.initFilters(dbDesc,datasetName,dsDesc,linkMapping,helper);
        console.log('finaliseDescs: filterMapping ready');
        
        // Processing step filters
        let stepMapping = helper.initSteps(dbDesc,datasetName,dsDesc,linkMapping,helper);
        console.log('finaliseDescs: stepMapping ready');  
        
        // Registering mapping
        helper.MAPPINGS[dashboardId + '.' + datasetId] = {
            links :		linkMapping,
            filters :	filterMapping,
            steps :		stepMapping 
        };
        console.log('finaliseDescs: global mapping updated', JSON.stringify(helper.MAPPINGS));
        
        component.set("v.initDone",true);
        console.log('finaliseDescs: END');
    },
    initLinks : function(dbDesc,datasetName) {
        console.log('initLinks: START');
        
        let links = dbDesc.state.dataSourceLinks || [];
        console.log('initLinks: dashboard links fetched');//, JSON.stringify(links));
        let linkMapping = {};
        links.forEach(function(linkItem){
        	console.log('initLinks: processing linkItem', JSON.stringify(linkItem));
            let source;
            let targets = [];
            linkItem.fields.forEach(function(fieldItem) {
        		//console.log('initLinks: processing fieldItem', JSON.stringify(fieldItem));
				if (fieldItem.dataSourceName === datasetName) source = fieldItem.fieldName;
                else targets.push(fieldItem.dataSourceName + '---' + fieldItem.fieldName);
            });
            targets.forEach(function(targetItem){
        		//console.log('initLinks: processing targetItem', targetItem);  
                linkMapping[targetItem] = source;
            });
        });
        
        console.log('initLinks: END mapping done ',JSON.stringify(linkMapping));
		return linkMapping;
    },
    initFilters : function(dbDesc,datasetName,dsDesc,linkMapping,helper) {
        console.log('initFilters: START');

        let filters = dbDesc.state.filters || [];
        console.log('initFilters: dashboard filters fetched');//, JSON.stringify(filters));
        let initFilters = dbDesc.initState.datasets || [];
        console.log('initFilters: dashboard initFilters fetched');//, JSON.stringify(initFilters));
       
        let filterMapping = {};
        filters.forEach(function(filterItem){
        	console.log('initFilters: processing filterItem', JSON.stringify(filterItem));
            
            let fieldName = null;
            let fieldAbsName = filterItem.dataset.name + '---' + filterItem.fields[0];
            if (filterItem.dataset.name === datasetName) {
                console.log('initFilters: processing filterItem on main DS');
                fieldName = filterItem.fields[0];
            }
            else {
                console.log('initFilters: processing filterItem on other DS');
            	fieldName = linkMapping[fieldAbsName];
            }

            if (fieldName) {
        		console.log('finaliseDescs: keeping filter', fieldName);
                
            	let dateField = dsDesc.fields.dates.find(elt => fieldName === elt.alias);
            	if (dateField) {
        			console.log('finaliseDescs: registering date filter', JSON.stringify(dateField));
                    filterMapping[fieldAbsName] = {
                        field: fieldName,
                        type: "date",
                        operator: filterItem.operator,
                        fields : dateField.fields,
                        source: fieldAbsName
                    }
            	}
                else {
        			console.log('finaliseDescs: registering standard filter');
                    filterMapping[fieldAbsName] = {
                        field: fieldName,
                        type: "standard",
                        operator: filterItem.operator,
                        source: fieldAbsName
                    }
                }
            }
            else {
        		console.warn('finaliseDescs: filterItem ignored');
            } 
        });
        
        console.log('initFilters: END mapping done',JSON.stringify(filterMapping));
        return filterMapping;
    },
    initSteps : function(dbDesc,datasetName,dsDesc,linkMapping,helper) {
        console.log('initSteps: START');
            
        let steps = dbDesc.state.steps || {};
        console.log('initSteps: dashboard steps fetched', Object.keys(steps));//, JSON.stringify(steps));
        let initSteps = dbDesc.initState.steps || {};
        console.log('initSteps: dashboard initSteps fetched', Object.keys(initSteps));//, JSON.stringify(initSteps));
        
        let stepMapping = {};
        Object.keys(steps).forEach(function(stepItemName){
        	console.log('initSteps: processing stepItem',stepItemName);
            let itemDesc = steps[stepItemName];
            console.log('initSteps: stepItem desc ',JSON.stringify(itemDesc));

            if (itemDesc.datasets) {
                console.log('initSteps: stepItem value ',JSON.stringify(itemDesc.datasets));
                let itemDS = helper.DATASETS[itemDesc.datasets[0].id];//itemDesc.datasets[0];
                console.log('initSteps: stepItem DS name fetched ',itemDS.name);

                let itemInitDesc = initSteps[stepItemName];
                if (itemInitDesc) {
                    console.log('initSteps: stepItem init value ',JSON.stringify(itemInitDesc));

                    stepMapping[stepItemName] = {};
                    itemInitDesc.metadata.groups.forEach(function(fieldItem){
                        console.log('initSteps: processing fieldItem',fieldItem);

                        if (fieldItem.includes('~~~')){
                            console.log('initSteps: processing compound date field');

                            let mapping = helper.mapCompoundField(fieldItem, itemDS, dsDesc, linkMapping);
                            if (mapping) {
                                console.log('initSteps: registering compound date field',fieldItem);
                                stepMapping[stepItemName][fieldItem] = mapping;
                            }
                            else {
                                console.warn('initSteps: compound date field ignored',fieldItem);                            
                            }
                        }
                        else {
                            console.log('initSteps: processing standard field');

                            let mapping = helper.mapStandardField(fieldItem, itemDS, dsDesc, linkMapping);
                            if (mapping) {
                                console.log('initSteps: registering standard field',fieldItem);
                                stepMapping[stepItemName][fieldItem] = mapping;
                            }
                            else {
                                console.warn('initSteps: standard field ignored',fieldItem);                            
                            }
                        }
                    });
                }
                else {
            	    console.warn('initSteps: missing itemInitDesc (step not used)',stepItemName);
                }
            }
            else {
                console.warn('initSteps: ignoring step ',JSON.stringify(itemDesc));
            }
        });
        
        console.log('initSteps: END mapping done ', JSON.stringify(stepMapping));
        return stepMapping;
    },
    mapCompoundField : function(srcFieldName, srcDS, mainDS, linkMapping) {
        console.log('mapCompoundField: START');
                        
        let srcFieldParts = srcFieldName.split('~~~');
        console.log('mapCompoundField: date field parts extracted ',srcFieldParts);
        let srcDateField = srcDS.fields.dates.find(elt => {
                return Object.values(elt.fields).includes(srcFieldParts[0]);});
        
        if (srcDateField) {
            console.log('mapCompoundField: date field found',srcDateField.alias);
  
        	if (srcDS.name === mainDS.name) {
                let mapping = {
                    field: srcDateField.alias,
                    fields : srcFieldParts,
                    type: "compound",
                    operator: "=="
                };
            	console.log('mapCompoundField: END returning compound date field on main DS', JSON.stringify(mapping));
            	return mapping;
            }
            else {
            	console.log('mapCompoundField: handling compound date field on other DS');
                // more complex approach : map the date field alias to main DS and 
                // map each individual date sub-field used
                
				let mainDateFieldName = linkMapping[srcDS.name + '---' + srcDateField.alias];
        		console.log('mapCompoundField: field name mapped ', JSON.stringify(mainDateFieldName));
                                
                if (mainDateFieldName) {
                    let mainDateField = mainDS.fields.dates.find(elt => mainDateFieldName === elt.alias);
        			console.log('mapCompoundField: field desc fetched on main DS', JSON.stringify(mainDateField));
                                    
                    let mainFieldParts = [];
                    srcFieldParts.forEach(function(fp) {
                        console.log('mapCompoundField: processing field part', fp);
                        let idx = (Object.values(srcDateField.fields)).findIndex(elt => fp === elt);
        				console.log('initSteps: idx found', idx);
                        let fn = (Object.keys(srcDateField.fields))[idx];
        				console.log('initSteps: key determined ', fn);
        				console.log('initSteps: main value ', mainDateField.fields[fn]);
                        mainFieldParts.push(mainDateField.fields[fn]);
                    });
                    console.log('mapCompoundField: mainFieldParts prepared',JSON.stringify(mainFieldParts));
                    
                    let mapping = {
                    	field: mainDateFieldName,
                    	fields : mainFieldParts,
                    	type: "compound",
                    	operator: "==",
                        source: srcDS.name + '---' + srcDateField.alias
                	};
            		console.log('mapCompoundField: END returning compound date field on other DS', JSON.stringify(mapping));
            		return mapping;
                }
                else {
                    console.warn('mapCompoundField: END compound date field not mapped on other DS',srcDateField.alias);
                    return null;
                }
            }
        }
        else {
            console.warn('mapCompoundField: compound date field not found on src DS',fieldParts[0]); 
            return null;
        }
    },
    mapStandardField : function(srcFieldName, srcDS, mainDS, linkMapping) {
        console.log('mapStandardField: START');
        
        if (srcDS.name === mainDS.name) {
            console.log('mapStandardField: processing field on main DS');
            
        	let dateField = mainDS.fields.dates.find(elt => srcFieldName === elt.alias);
            let measureField = mainDS.fields.measures.find(elt => srcFieldName === elt.field);
            if (dateField) {
            	let mapping = {
                    field: srcFieldName,
                    fields : dateField.fields,
                    type: "date",
                    operator: ">=<="
                };
            	console.log('mapStandardField: END returning date field on main DS', JSON.stringify(mapping));
            	return mapping;
            }
            else if (measureField) {
                let mapping = {
                    field: srcFieldName,
                    type: "measure",
                    operator: ">=<="
                };
            	console.log('mapStandardField: END returning measure field on main DS', JSON.stringify(mapping));
            	return mapping;
            }
            else {
                let mapping = {
                    field: srcFieldName,
                    type: "standard",
                    operator: "in"
                };
            	console.log('mapStandardField: END returning dimension field on main DS', JSON.stringify(mapping));
            	return mapping;
            }            
        }
        else {
            console.log('mapStandardField: processing field on other DS');
            
            let mainFieldName = linkMapping[srcDS.name + '---' + srcFieldName];
            if (mainFieldName) {
        		console.log('mapStandardField: field name mapped', mainFieldName);
                
                let mainDateField = mainDS.fields.dates.find(elt => mainFieldName === elt.alias);
                let measureField = mainDS.fields.measures.find(elt => mainFieldName === elt.field);
                if (mainDateField) {
        			console.log('mapStandardField: handling date field', mainDateField.alias);
                    let mapping = {
                    	field: mainDateField.alias,
                    	fields : mainDateField.fields,
                    	type: "date",
                    	operator: ">=<=",
                        source: srcDS.name + '---' + srcFieldName
                	};
            		console.log('mapStandardField: END returning date field from other DS', JSON.stringify(mapping));
            		return mapping;
                }
                else if (measureField) {
        			console.log('mapStandardField: handling measure field');
                    let mapping = {
                    	field: mainFieldName,
                    	type: "measure",
                    	operator: ">=<=",
                        source: srcDS.name + '---' + srcFieldName
                	};
            		console.log('mapStandardField: END returning measure field from other DS', JSON.stringify(mapping));
            		return mapping;
                }   
                else {
        			console.log('mapStandardField: handling dimension field');
                    let mapping = {
                    	field: mainFieldName,
                    	type: "standard",
                    	operator: "in",
                        source: srcDS.name + '---' + srcFieldName
                	};
            		console.log('mapStandardField: END returning dimension field from other DS', JSON.stringify(mapping));
            		return mapping;
                }
            }
            else {
                console.warn('mapStandardField: END field not mapped on other DS',srcFieldName);
                return null;
            }
        }
    },
    
    //-------------------------------------------------------------------
    // Method to launch the Mass Action process
    //-------------------------------------------------------------------
    startAction : function(component, event, helper) {
		console.log('startAction: START');
        
        component.set("v.isRunning",true);
        component.set("v.runStep","1");
        
        let actionResult = {
            display: false
        };
        component.set("v.actionResult",actionResult);
        console.log('startAction: actionResult init ',actionResult);
        
        let analyticsDB = component.find("analyticsDB");
        console.log('startAction: analyticsDB found',analyticsDB);
        
        let config = {};
        analyticsDB.getState(
            config,
            $A.getCallback(function(stateData) {
                console.log('startAction: state received',JSON.stringify(stateData));

                let dashboardId = component.get("v.dashboardId");
                console.log('startAction: dashboardId fetched', dashboardId);
                let datasetId	= component.get("v.datasetId");
                console.log('startAction: datasetId fetched', datasetId);
                let mapping = helper.MAPPINGS[dashboardId + '.' + datasetId];
                console.log('startAction: mapping fetched', mapping);

                let mainDS = helper.DATASETS[datasetId];
                console.log('startAction: mainDS fetched',JSON.stringify(mainDS));
                let idFieldName = component.get("v.idFieldName");                
                console.log('startAction: idFieldName fetched',idFieldName);
                let useGroup = component.get("v.useGroup");
                console.log('startAction: useGroup fetched ',useGroup); 
                let otherFields = component.get("v.otherFieldsJson");
                console.log('startAction: otherFields fetched ',JSON.stringify(otherFields)); 

                // Handling of dashboards with multiple tabs --> initialstate contains only steps of 1st tab.
                console.log('startAction: mapping steps fetched ',(Object.keys(mapping.steps))); 
                console.log('startAction: stateData steps fetched ',(Object.keys(stateData.payload.state.steps))); 
                if ((Object.keys(mapping.steps)).length < (Object.keys(stateData.payload.state.steps)).length) {
                    console.warn('startAction: new steps added in stateData --> reevaluating dashboard desc'); 

                    (helper.DASHBOARDS)[dashboardId].initState = stateData.payload.state;
                    helper.finaliseDescs(component,helper);

                    mapping = helper.MAPPINGS[dashboardId + '.' + datasetId];
                    console.log('startAction: mapping reloaded', mapping);
                    mainDS = helper.DATASETS[datasetId];
                    console.log('startAction: mainDS reloaded',JSON.stringify(mainDS));

                    console.warn('startAction: dashboard desc reevaluated'); 
                }
                else {
                    console.log('startAction: steps in stateData consistent with desc');  
                }

                let saqlQuery = helper.buildSAQL(stateData,mainDS,idFieldName,mapping,useGroup,otherFields,helper);
                //let saqlQuery = helper.buildSAQL(stateData,dbDesc,dsDesc,dsFieldDesc,idFieldName,helper);
                component.set("v.saqlQuery",saqlQuery);
                console.log('startAction: saqlQuery init ',saqlQuery);

                let analyticsSDK = component.find("analyticsSDK");
                console.log('startAction: analyticsSDK found',analyticsSDK);                
                analyticsSDK.invokeMethod(
                    this.SDK_CONTEXT,
                    "executeQuery",
                    {"query": saqlQuery},
                    $A.getCallback(function(saqlErr, saqlData) {
                        component.set("v.runStep","2");
                        if (saqlErr !== null) {
                            //component.set("v.isRunning",false);
                            let actionResult = {
                                display: true,
                                title: $A.get("$Label.c.PEG_AnalyticsMassActionSaqlError"),
                                error: saqlErr,
                                variant: "error"
                            };
                            component.set("v.actionResult",actionResult);
                            console.log('startAction: actionResult update ',actionResult);

                            //component.set("v.actionError", JSON.stringify(saqlErr));
                            console.error("startAction: END SDK SAQL error received ", JSON.stringify(saqlErr));
                        }
                        else {
                            console.log('startAction: SDK SAQL data received ',saqlData);
                            component.set("v.saqlResults",saqlData);

                            let saqlJson = JSON.parse(saqlData);
                            console.log('startAction: SDK SAQL data parsed ',saqlJson);  

                            //CHANGE START
                            //if (saqlJson) component.set("v.saqlResults",saqlJson);
                            let saqlRecords = helper.getSaqlIdSet(saqlJson,idFieldName);
                            component.set("v.saqlResults",saqlRecords);

                            //let saqlIdList = Array.from(helper.getSaqlIdSet(saqlJson,idFieldName));
                            let saqlIdList =  Object.keys(saqlRecords);
                            //CHANGE END
                            console.log('startAction: target ID list initialized from SAQL ',saqlIdList);
                            component.set("v.saqlIdList",saqlIdList);

                            if (saqlIdList.length >= helper.SAQL_LIMIT) {
                                console.log('startAction: SAQL data fetch limit reached ',saqlIdList.length);
                                let actionResult = {
                                    display: true,
                                    title: $A.get("$Label.c.PEG_AnalyticsMassActionSizeWarning"),
                                    variant: "info"
                                };
                                component.set("v.actionResult",actionResult);
                                console.log('startAction: actionResult update ',actionResult);
                            }
                            else {
                                console.log('startAction: SAQL data fetch below limit ',saqlIdList.length);
                                let actionResult = {
                                    display: false,
                                    title: "",
                                    variant: "info"
                                };
                                component.set("v.actionResult",actionResult);
                                console.log('startAction: actionResult update ',actionResult);
                            }

                            let targetLookup = component.get("v.targetLookup");
                            console.log('startAction: targetLookup fetched ',targetLookup);

                            let soqlQuery = helper.buildSOQL(saqlIdList, component);
                            console.log('startAction: soqlQuery init ',soqlQuery);
                            component.set("v.soqlQuery",soqlQuery);

                            if (soqlQuery) {
                                console.log('startAction: triggering query');

                                component.find('soqlUtil').runQuery(
                                    soqlQuery,
                                    false, // bypassFLS
                                    false, // bypassSharing
                                    "",  // queryType
                                    false, // isStorable
                                    false, // isBackground
                                    function(queryResult,queryError) {
                                        console.log('startAction: result from SOQL query');
                                        component.set("v.runStep","3");

                                        if (queryResult) {
                                            console.log('startAction: queryResult received',queryResult);

                                            let soqlIdList = Array.from(helper.getSoqlIdSet(queryResult,saqlIdList,targetLookup));
                                            console.log('startAction: END target ID list filtered from SOQL ',soqlIdList);
                                            component.set("v.soqlIdList", soqlIdList);
                                        }
                                        else {
                                            //component.set("v.isRunning",false);
                                            let actionResult = {
                                                display: true,
                                                title: $A.get("$Label.c.PEG_AnalyticsMassActionSoqlError"),
                                                error: queryError,
                                                variant: "error"
                                            };
                                            component.set("v.actionResult",actionResult);
                                            console.log('startAction: actionResult update ',actionResult);

                                            //component.set("v.actionError", JSON.stringify(queryError));
                                            console.log('startAction: END queryError received',queryError);
                                        }
                                    });
                                console.log('startAction: soql query sent');
                            }
                            else {
                                console.warn('startAction: no query to trigger');
                                component.set("v.runStep","3");
                                component.set("v.soqlIdList", saqlIdList);
                            }
                        }
                    })
                );
                console.log('startAction: executting SAQL query');                
            })
        );
        console.log('startAction: fetching ');	
    },

    //-------------------------------------------------------------------
    // Utility Methods to build the SAQL query out of the Dashboard state
    //-------------------------------------------------------------------
    buildSAQL : function(dbState,mainDS,mainIdField,mapping,useGroup,otherFields,helper) {
        console.log('buildSAQL: START');
        
        let query = 'q = load \"' + mainDS.id + '/' + mainDS.currentVersionId + '\";';
        console.log('buildSAQL: query root init',query);
        
        let filters = dbState.payload.state.datasets;
        console.log('buildSAQL: dashboard global filters fetched',JSON.stringify(filters));
        for (let filterItem in filters) {
            console.log('buildSAQL: processing filter ',JSON.stringify(filterItem));
            query += helper.getFilterSAQL(filterItem,filters[filterItem],mapping.filters,helper);
        }
        console.log('buildSAQL: global filter query filters added ',query);

        let steps = dbState.payload.state.steps;
        console.log('buildSAQL: query steps fetched',JSON.stringify(steps));            
        for (let stepItem in steps) {
            console.log('buildSAQL: processing step ',JSON.stringify(stepItem));
            query += helper.getStepSAQL(stepItem,steps[stepItem],mapping.steps,helper);
        }
        console.log('buildSAQL: steps query filters added ',query);    

        if (useGroup) {
            console.log('buildSAQL: adding group by statement');
            query   += 'q = group q by \'' + mainIdField + '\';'
                    + 'q = foreach q generate \'' + mainIdField + '\' as \''
                    + mainIdField + '\', count() as \'count\';';
        }
        else if (otherFields) {
            console.log('buildSAQL: fetching ID and other fields');
            query   += 'q = foreach q generate \'' + mainIdField + '\',';
            console.log('buildSAQL: main ID field added', mainIdField);
            otherFields.forEach(item => {
                console.log('buildSAQL: adding field ', item);
                query += '\'' + item.name + '\',';
            });
            let newVal = query.slice(0,-1) + ';';
            console.log('buildSAQL: newVal ', newVal);
            query = newVal;
            console.log('buildSAQL: query updated ', query);
            query = query.slice(0,-1) + ';';
            console.log('buildSAQL: query reupdated ', query);
        }
        else {
            console.log('buildSAQL: fetching only main ID field');
            query   += 'q = foreach q generate \'' + mainIdField + '\';';
        }
        //query	+= 'q = foreach q generate \'' + mainIdField + '\';'

        query += 'q = limit q ' + helper.SAQL_LIMIT + ';';
        console.log('buildSAQL: END query finalized',query);
        return query;
    },
    getStepSAQL : function(stepName,stepState,stepMapping,helper) {
        console.log('getStepSAQL: START for ',stepName);
        
        let stepMap = stepMapping[stepName];
        if (!stepMap) {
        	console.warn('getStepSAQL: END no step mapping for ',stepName);
          	return '';
        }
        console.log('getStepSAQL: step mapping fetched ',JSON.stringify(stepMap));
        
        if (stepState.values.length == 0) {
            console.warn('getStepSAQL: END no step filter values set for ',stepName);
          	return '';
        }
        
        if (stepState.metadata.groups.length == 1) {
            console.log('getStepSAQL: processing single filter');
            
            let singleStepMap = stepMap[stepState.metadata.groups[0]];
            console.log('getStepSAQL: single mapping fetched ', JSON.stringify(singleStepMap));
            
            switch(singleStepMap.type) {
  				case "date":
    				console.log('getStepSAQL: END for single standalone date filter ');
                    return helper.getDateFilter(singleStepMap.fields,stepState.values);
  				case "compound":
    				console.log('getStepSAQL: END for single compound date filter ');
                    return helper.getCompoundFilter(singleStepMap.fields,stepState.values);
                case "measure":
    				console.log('getStepSAQL: END for single measure filter ',singleStepMap.field);
                    return helper.getMeasureFilter(singleStepMap.field,stepState.values);
  				default:
    				console.log('getStepSAQL: END for single standard filter ',singleStepMap.field);
                    return helper.getStandardFilter(singleStepMap.field,stepState.values);                    
			}
        }
        else {
            console.log('getStepSAQL: END with multiple filters');
            return helper.getMultipleFilter(stepMap, stepState.metadata.groups, stepState.values);
        }        
    },
    getFilterSAQL : function(filterName,filterState,filterMapping,helper) {
        console.log('getFilterSAQL: START with ',filterName);

        let filterQuery = '';
        filterState.forEach(function(filterItem) {
            console.log('getFilterSAQL: processing filter ',JSON.stringify(filterItem));
            let filterItemMap = filterMapping[filterName + '---' + filterItem.fields[0]];
            if (filterItemMap) {
                if (filterItemMap.type === "date") {
                    if (filterItem.filter.values.length > 0) {
                        console.log('getFilterSAQL: adding date filter ',filterItemMap.field);
                        filterQuery += helper.getDateFilter(filterItemMap.fields,filterItem.filter.values);
                    }
                    else {
                        console.log('getFilterSAQL: date filter not set');                        
                    }
                }
                else {
                    console.log('getFilterSAQL: adding standard filter',filterItemMap.field);
                    switch (filterItem.filter.operator) {
                        case "in":
                        case "not in":
                            if (filterItem.filter.values.length > 0) {
                                console.log('getFilterSAQL: adding (not) in filter');
                                filterQuery += 'q = filter q by \'' + filterItemMap.field + '\' '
                                            + filterItem.filter.operator 
                                            + ' [\"' + filterItem.filter.values.join('\", \"') + '\"];';
                            }
                            else {
                                console.log('getFilterSAQL: (not) in filter not set');
                            }
                            break;
                        case ">=<=":
                            if (filterItem.filter.values.length > 0) {
                                console.log('getFilterSAQL: adding between filter');
                                filterQuery += 'q = filter q by \'' + filterItemMap.field + '\' >= '
                                            + filterItem.filter.values[0]
                                            + ' && \'' + filterItemMap.field + '\' <= '
                                            + filterItem.filter.values[1] + ';';
                            }
                            else {
                                console.log('getFilterSAQL: between filter not set');
                            }
                            break;
                        case ">":
                        case ">=":
                        case "<":
                        case "<=":
                        case "==":
                        case "!=":
                            if (filterItem.filter.values.length > 0) {
                                console.log('getFilterSAQL: adding single compare filter');
                                filterQuery += 'q = filter q by \'' + filterItemMap.field + '\' '
                                            + filterItem.filter.operator + ' '
                                        	+ filterItem.filter.values[0] + ';';
                            }
                            else {
                            	console.log('getFilterSAQL: single compare filter not set');                                
                            }
                            break;
                        case "matches":
                            if (filterItem.filter.values.length > 0) {
                                console.log('getFilterSAQL: adding match filter');
                                filterQuery += 'q = filter q by \'' + filterItemMap.field + '\' '
                                            + filterItem.filter.operator + ' "'
                                            + filterItem.filter.values[0] + '";';
                            }
                            else {
                            	console.log('getFilterSAQL: match filter not set');                                
                            }
                            break;
                        case "is null":
                        case "is not null":
                            console.log('getFilterSAQL: adding is (not) null filter');
                            filterQuery += 'q = filter q by \'' + filterItemMap.field + '\' '
                                        + filterItem.filter.operator + ';';
                            break;
                        default:
                            console.warn('getFilterSAQL: unsupported filter operator',filterItem.filter.operator);
                    }
                }
            }
            else {
        		console.warn('getStepSAQL: ignoring unmapped field ',filterItem.fields[0]);
            }
        });

        console.log('getFilterSAQL: END with ', filterQuery);
        return filterQuery;
    },
    getDateFilter : function(dateFields,filterValues) {
        console.log('getDateFilter: START');
        
        let filterQuery = 'q = filter q by date(\''
                            + dateFields.year
                            + '\', \'' + dateFields.month
                            + '\', \'' + dateFields.day
                            + '\') in [';
        console.log('getDateFilter: filterQuery initialized ',filterQuery);

        let fromDate = filterValues[0][0];
        console.log('getDateFilter: fromDate ',fromDate);
        console.log('getDateFilter: fromDate type ',typeof fromDate);
        let toDate = filterValues[0][1];
        console.log('getDateFilter: toDate ',toDate);
        console.log('getDateFilter: toDate type ',typeof toDate);

        if (typeof fromDate === 'number') {
            console.log('getDateFilter: processing epoch dates ');

            let fromDateDate = new Date(fromDate );
            console.log('getDateFilter: converted fromDate ',fromDateDate);
            let toDateDate = new Date(toDate );
            console.log('getDateFilter: converted toDateDate ',toDateDate);
                        	
            filterQuery += 'dateRange(['
                        + fromDateDate.getFullYear() + ','
                        + (fromDateDate.getMonth()+1) + ','
                        + fromDateDate.getDate() + '],['
                        + toDateDate.getFullYear() + ','
                        + (toDateDate.getMonth()+1) + ','
                        + toDateDate.getDate() + '])];';
        }
        else {
            console.log('buildSAQL: processing relative dates ');
            
            if (fromDate[1] == 0)			filterQuery += '"current ' + fromDate[0] + '".."'
                else if (fromDate[1] == 1)	filterQuery += '"' + fromDate[1] + " " + fromDate[0] + ' ahead".."'
                else if (fromDate[1] == -1)	filterQuery += '"' + -fromDate[1] + " " + fromDate[0] + ' ago".."'
                else if (fromDate[1] > 1) 	filterQuery += '"' + fromDate[1] + " " + fromDate[0] + 's ahead".."'
                else filterQuery += '"' + -fromDate[1] + " " + fromDate[0] + 's ago".."';

            if (toDate[1] == 0)				filterQuery += "current " + toDate[0] + '"];'
                else if (toDate[1] == 1)	filterQuery += toDate[1] + " " + toDate[0] + ' ahead"];'
                else if (toDate[1] == -1)	filterQuery += -toDate[1] + " " + toDate[0] + ' ago"];'
                else if (toDate[1] > 1)		filterQuery += toDate[1] + " " + toDate[0] + 's ahead"];'
                else filterQuery += -toDate[1] + " " + toDate[0] + 's ago"];';
        }

        console.log('getDateFilter: END with ',filterQuery);
    	return filterQuery;
    },
    getCompoundFilter : function(dateFields,filterValues) {
        console.log('getCompoundFilter: START');

        let criteriaParts = [];
        filterValues.forEach(function(valIter) {
            console.log('getCompoundFilter: processing date value ',valIter);

            let valueParts = valIter.split('~~~');
            console.log('getCompoundFilter: date values parts extracted ',valueParts);

            let criteriaSubParts = [];
            dateFields.forEach(function(fieldIter,index) {
                criteriaSubParts.push('\'' + fieldIter + '\' == \"' +  valueParts[index] + '\"');
            });
            criteriaParts.push('( ' + criteriaSubParts.join(' && ') + ' )');
        });

        let filterQuery = 'q = filter q by ( ' + criteriaParts.join(' || ') + ' );';
        console.log('getCompoundFilter: END with ',filterQuery);
        return filterQuery;
    },
    getMeasureFilter : function(field,filterValues) {
    	console.log('getMeasureFilter: START for ',field);
                
        let filterQuery = '';
        if ((filterValues.length == 1) && ((filterValues[0]).length == 2)) {
            console.log('getMeasureFilter: processing range statement ');
            filterQuery = 'q = filter q by \'' 
                        + field +  '\' >= ' + filterValues[0][0]
                        + '  && \'' + field +  '\' <= ' + filterValues[0][1] + ';';
        }
        else {
            console.warn('getMeasureFilter: step should provide range',JSON.stringify(filterValues));
        }

        console.log('getMeasureFilter: END with ',filterQuery);
        return filterQuery;
    },
    getStandardFilter : function(field,filterValues) {
    	console.log('getStandardFilter: START for ',field);
                
        let filterQuery = '';
        if (filterValues.length == 1) {
            console.log('getStandardFilter: processing single == statement ');
            filterQuery = 'q = filter q by \'' + field
                        +  '\' == \"' + filterValues[0] + '\";';
        }
        else {
            console.log('getStandardFilter: processing IN statement ');
            filterQuery	= 'q = filter q by \'' + field
                        +  '\' in [\"' + filterValues.join('\", \"') + '\"];';
        }        

        console.log('getStandardFilter: END with ',filterQuery);
        return filterQuery;
    },
    getMultipleFilter : function(stepMap,filterFields,filterValues) {
        console.log('getMultipleFilter: START');

        let criteriaParts = [];
        filterValues.forEach(function(valIter) {
            console.log('getMultipleFilter: processing value ',valIter);

            let criteriaSubParts = [];
            filterFields.forEach(function(fieldIter,index) {
                console.log('getMultipleFilter: processing field ',fieldIter);

                let fieldMap = stepMap[fieldIter];
                if (fieldMap) {
                    console.log('getMultipleFilter: mapped field ',fieldMap);

                    switch(fieldMap.type) {
                        case "date":
                            console.log('getMultipleFilter: ignoring date field ',fieldIter);
                            break;
                        case "compound":
                            console.log('getMultipleFilter: handling compound date field ',fieldIter);
                            let valueParts = valIter[index].split('~~~');
                            fieldMap.fields.forEach(function(fieldSubIter,subIndex) {
                                criteriaSubParts.push('\'' + fieldSubIter + '\' == \"' +  valueParts[subIndex] + '\"');
                            });
                            break;
                        default :
                            console.log('getMultipleFilter: handling standard field ',fieldIter);
                            criteriaSubParts.push('\'' + fieldMap.field + '\' == \"' +  valIter[index] + '\"');
                    }
                }
                else {
            		console.log('getMultipleFilter: ignoring unmapped field ',fieldIter);                    
                }
            });

            console.log('getMultipleFilter: all fields processed');
            criteriaParts.push('( ' + criteriaSubParts.join(' && ') + ' )');
        });
        
        let filterQuery = 'q = filter q by ( ' + criteriaParts.join(' || ') + ' );';
        console.log('getMultipleFilter: END with ',filterQuery);
        return filterQuery;   
    },

    //-------------------------------------------------------------------
    // Utility Methods to build the SOQL query out of the SAQL results
    //-------------------------------------------------------------------
    getSaqlIdSet : function(saqlResults,idFieldName) {
        console.log('getSaqlIdSet: START with result list size ', saqlResults.results.records.length);                          

        //CHANGE START
        //let idSet = new Set();
        let saqlRecords = {};
        saqlResults.results.records.forEach(function(idIter) {
            //console.log('getSaqlIdSet: processing ID ',idIter);
            //idSet.add(idIter[idFieldName]);
            saqlRecords[idIter[idFieldName]] = idIter;
        });
        //console.log('getSaqlIdSet: ID set init ', idSet);
        console.log('getSaqlIdSet: saqlRecords IDs init ',JSON.stringify(Object.keys(saqlRecords)));
        console.log('getSaqlIdSet: saqlRecords init ',JSON.stringify(saqlRecords));

        //console.log('getSaqlIdSet: END with set size ',idSet.size);
        console.log('getSaqlIdSet: END with size ', (Object.keys(saqlRecords)).size);
        //return idSet;
        return saqlRecords;
        //CHANGE END
    },
    buildSOQL : function(targetIDList, component) {
        console.log('buildSOQL: START');

        let queryBase = component.get("v.queryBaseMerged");
        console.log('buildSOQL: queryBase fetched',queryBase);

        let soqlQuery = null;
        if (queryBase) {
	        if (queryBase.includes('{{{ROWS}}}')) {
                console.log('buildSOQL: merging ID list',queryBase);
                let idListStr = '(\'' + targetIDList.join('\', \'') + '\')';
                console.log('buildSOQL: idListStr init',idListStr);
                soqlQuery = queryBase.replace('{{{ROWS}}}',idListStr);
            }
            else {
                console.log('buildSOQL: no ID list merge to do');
                soqlQuery = queryBase;
            }
        }
        else {
        	console.log('buildSOQL: no query to return');
        }

        console.log('buildSOQL: END with query ',soqlQuery);
        return soqlQuery;
    },
    getSoqlIdSet : function(soqlResults,idList,targetLookup) {
        console.log('getSoqlIdSet: START with ID list size ', idList.length);                         

        let idSet = new Set(idList);
        console.log('getSoqlIdSet: idSet init',idSet);
        
        soqlResults.forEach(function(iter){
            console.log('getSoqlIdSet: removing iter ',JSON.stringify(iter));
            idSet.delete(iter[targetLookup]);
        });
        console.log('getSoqlIdSet: ID set init ',JSON.stringify(idSet));

        console.log('getSoqlIdSet: END with ID set size ',idSet.size);
        return idSet;
    },

    //-------------------------------------------------------------------
    // Method to finalize the Mass Action process
    //-------------------------------------------------------------------
    doAction : function(component,event,helper) {
        console.log('doAction: START');
        component.set("v.runStep","4");

        // Context Control
        let soqlIdList = component.get("v.soqlIdList");
        console.log('doAction: soql Id List fetched ',soqlIdList);
        if ((!soqlIdList) && (soqlIdList.length == 0)) {
            let actionResult = {
                display: true,
                title: $A.get("$Label.c.PEG_AnalyticsMassActionProcessingError"),
                message: "No target IDs to add as campaign members!",
                variant: "error"
            };
            component.set("v.actionResult",actionResult);
            console.warn('doAction: END no target IDs to add as campaign members!');    
            return;
        }

        // Record Template preparation
        let baseTargetJson = component.get("v.baseTargetJson");
        console.log('doAction: baseTargetJson fetched ',JSON.stringify(baseTargetJson));
        let objectChanges = event.getParams().fields; 
        console.log('doAction: objectChanges fetched from event ',JSON.stringify(objectChanges));
        let recordTemplate = Object.assign({}, baseTargetJson);
        for (let field in objectChanges) {
            if (objectChanges[field] != null) recordTemplate[field] = objectChanges[field];
        }
        console.log('doAction: recordTemplate init',JSON.stringify(recordTemplate));

        // User Start Notification
        let actionResult = {
            display: true,
            title: $A.get("$Label.c.PEG_AnalyticsMassActionStep4"),
            variant: "info"
        };
        component.set("v.actionResult",actionResult);
        console.log('doAction: actionResult start update ',actionResult);

        let batchSize = component.get("v.batchSize");
        console.log('doAction: batchSize fetched ',batchSize);
        batchSize = (batchSize == 0 ? newRecordList.length : batchSize);
        component.set("v.actionProgress",10);

        // Context Fetch
        let targetLookup = component.get("v.targetLookup"); 
        console.log('processBatch: targetLookup fetched ',targetLookup);        
        let idFieldName = component.get("v.idFieldName");                
        console.log('processBatch: idFieldName fetched',idFieldName);
        let otherFields = component.get("v.otherFieldsJson");
        console.log('processBatch: otherFields fetched ',JSON.stringify(otherFields)); 
        let saqlResults = component.get("v.saqlResults");
        console.log('processBatch: saqlResults fetched ',JSON.stringify(saqlResults));

        // Process Launch (with small hack to force display of progress bar right upon click)
        setTimeout(() => { 
            helper.processBatch(soqlIdList,recordTemplate,targetLookup,idFieldName,otherFields,saqlResults,0,batchSize,component,helper);
            console.log('doAction: END');
        }, 50);
        console.log('doAction: starting process');
    },
    processBatch : function(soqlIdList,recordTemplate,targetLookup,idFieldName,otherFields,saqlResults,iteration,batchSize,component,helper) {
        console.log('processBatch: START iteration ', iteration);

        // Action Context Fetch
        let recordIndex = iteration * batchSize;
        console.log('processBatch: curIndex to process ', recordIndex);        
        console.log('processBatch: batchSize provided ', batchSize); 

        // Batch List Extraction
        let batchIdList = soqlIdList.slice(recordIndex, recordIndex + batchSize);
        console.log('processBatch: batchList sliced ', JSON.stringify(batchIdList));

        if (batchIdList.length > 0) {
            console.log('processBatch: processing batch TS ', Date.now());

            // Batch Record List Preparation
            let batchRecordList = [];
            batchIdList.forEach((iter,index) => {
                //console.log('processBatch: registering new record for ',iter);
                let newRow = Object.assign({}, recordTemplate);
                newRow[targetLookup] = iter;
                if (otherFields) {
                    //CHANGE START
                    //let rowData = saqlResults.results.records.find(item => item[idFieldName] == iter);
                    let rowData = saqlResults[iter];
                    //console.log('processBatch: index check ', ((saqlResults.results.records)[recordIndex + index])[idFieldName]);
                    //CHANGE END
                    if (rowData) {otherFields.forEach(iterField => {newRow[iterField.target] = rowData[iterField.name];});}
                    else {console.warn('getBatchRecords: rowData not found for recordId ',iter);}
                }
                batchRecordList.push(newRow);
            });
            console.log('processBatch: batchRecordList init TS ', Date.now());
            //console.log('processBatch: batchRecordList init ',JSON.stringify(batchRecordList));
            console.log('processBatch: batchRecordList init with #items ',batchRecordList.length);

            let actionProgress = 10 + Math.round((iteration + 0.5) * batchSize * 90  / soqlIdList.length);
            console.log('processBatch: actionProgress evaluated ', actionProgress);
            component.set("v.actionProgress",actionProgress);

            component.find('soqlUtil').runDML(
                'insert',
                batchRecordList,
                function(dmlResult,dmlError) {
                    console.log('processBatch: DML executed TS', Date.now());
                    console.log('processBatch: result from DML for iteration ', iteration);
                    if (dmlResult) {
                        let actionProgress = 10 + Math.round((iteration + 1) * batchSize * 90  / soqlIdList.length);
                        console.log('processBatch: actionProgress evaluated ', actionProgress);
                        component.set("v.actionProgress",actionProgress);

                        console.log('processBatch: END launching next batch');
                        helper.processBatch(soqlIdList,recordTemplate,targetLookup,idFieldName,otherFields,saqlResults,iteration+1,batchSize,component,helper);
                    }
                    else {
                        console.warn('processBatch: result from DML for iteration ', dmlError);
                        let actionResult = {
                            display: true,
                            title: $A.get("$Label.c.PEG_AnalyticsMassActionDmlError"),
                            error: dmlError,
                            variant: "error"
                        };
                        component.set("v.actionResult",actionResult);
                        console.log('processBatch: actionResult update ',actionResult);

                        //component.set("v.actionError",JSON.stringify(dmlError));
                        console.warn('processBatch: END KO');
                    }
            });
            console.log('processBatch: DML sent TS ', Date.now()); 
        }
        else {
            //console.log('processBatch: last batch reached TS ', Date.now());
            component.set("v.isRunning",false);
            component.set("v.actionProgress",100);

            let refreshTab = component.get("v.refreshTab");
            console.log('processBatch: refreshTab fetched',refreshTab);

            setTimeout(() => { 
                if (refreshTab) {
                    console.log('processBatch: END triggering refresh');
                    $A.get("e.force:refreshView").fire();
                }
                else {
                    console.log('processBatch: END no refresh');
                }
            }, 500);
        }
    }
})