({
/***
* @author P-E GROS
* @date   Sept. 2020
* @description  Aura Component to merge contextual data into a string
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
	mergeTemplate : function(template,row,callback,component,helper) {
       console.log('mergeTemplate: START');
    
       component.set("v.fetchUser",false);
       component.set("v.fetchObject",false)
       component.set("v.fetchContext",false);
        
       let keyList = helper.parseTemplate(template);
       console.log('mergeTemplate: keyList extracted',keyList);
        
        if (! keyList) {
            console.warn('mergeTemplate: no merge keys found in template',template);
            callback(template,null);
            return;
        }
        
        let sObjectName = component.get("v.sObjectName") || 'Undefined';
        console.log('mergeTemplate: sObjectName fetched',sObjectName); 
        let fetchUser    = false;
        let fetchObject  = false;
        let fetchContext = false;
        let mergedTemplate = template;

        let add90Days = new Date();
        add90Days.setDate(add90Days.getDate() + 90);

        (Object.keys(keyList)).forEach(function(keyItem){
            console.log('mergeTemplate: processing keyItem',keyItem);
            switch (keyItem) {
                case "User" :
                    let currentUser = helper.getCurrentUser();
                    console.log('mergeTemplate: currentUser',JSON.stringify(currentUser));
                    if (helper.compareLists(Object.keys(keyList["User"]),
                                            Object.keys(currentUser))) {
                       mergedTemplate = helper.mergeFields(mergedTemplate,
                                                           keyList["User"],
                                                           currentUser);
                       console.log('mergeTemplate: mergedTemplate updated with User',mergedTemplate);
                    }
                    else {
                       console.log('mergeTemplate: missing User fields for immediate merge');
                       fetchUser = true;
                       component.set("v.userId",currentUser.Id);
                       component.set("v.userFields",Object.keys(keyList["User"]));
                       console.log('mergeTemplate: userFields set',Object.keys(keyList["User"]));
                    }
                    break;
                case "Object" :
                    fetchObject = true;
                    component.set("v.objectFields",Object.keys(keyList["Object"]));
                    console.log('mergeTemplate: objectFields set',Object.keys(keyList["Object"]));
                    break;
                case "sObjectName" :
                    mergedTemplate = helper.mergeFields(mergedTemplate,
                                                        keyList["sObjectName"],
                                                        {"default":component.get("v.sObjectName")});
                    console.log('mergeTemplate: mergedTemplate updated with sObjectName',mergedTemplate);
                    break;
                case "recordId" :
                    console.log('mergeTemplate: recordId',component.get("v.recordId"));
                    mergedTemplate = helper.mergeFields(mergedTemplate,
                                                        keyList["recordId"],
                                                        {"default":component.get("v.recordId") });
                    console.log('mergeTemplate: mergedTemplate updated with recordId',mergedTemplate);
                    break;
                case "Row" :
                    mergedTemplate = helper.mergeFields(mergedTemplate,
                                                        keyList["Row"],
                                                        row);
                    console.log('mergeTemplate: mergedTemplate updated with Row',mergedTemplate);
                    break;
                case "Context" :
                    let contextData = (component.find("contextMgr")).getValue();  
                    if (contextData.isReady) {
                       mergedTemplate = helper.mergeFields(mergedTemplate,
                                                           keyList["Context"],
                                                           contextData);
                       console.log('mergeTemplate: mergedTemplate updated with Context',mergedTemplate);
                    }
                    else {
                       console.log('mergeTemplate: missing Context fields for immediate merge');
                       fetchContext = true;
                       console.log('mergeTemplate: contextFields set',Object.keys(keyList["Context"]));
                    }
                    break;
                case "Now" : 
                    mergedTemplate = helper.mergeFields(mergedTemplate,
                                                        keyList["Now"],
                                                        {"default":(new Date()).toISOString()});
                    console.log('mergeTemplate: mergedTemplate updated with Now',mergedTemplate);
                    break;
                case "In90Days" : 
                    mergedTemplate = helper.mergeFields(mergedTemplate,
                                                        keyList["In90Days"],
                                                        {"default":(add90Days).toISOString()});
                    console.log('mergeTemplate: mergedTemplate updated with In90Days',mergedTemplate);
                    break;
                case "TODAY" : 
                	mergedTemplate = helper.mergeFields(mergedTemplate,
                                                    keyList["TODAY"],
                                                    {"default":(new Date()).toLocaleDateString()});
                	console.log('mergeTemplate: mergedTemplate updated with In90Days',mergedTemplate);
                	break;
                default :
                    console.warn('mergeTemplate: unsupported (ignored) key found in template ',keyItem);
                    //callback(null,[{"message":"Unsupported key found in template : " + keyItem}]);
                    //console.log('mergeTemplate: error callback triggered');
                    //return;
            }
        });
        
        
        if (!(fetchUser || fetchObject || fetchContext)) {
            console.log('mergeTemplate: merge completed',mergedTemplate);
            callback(mergedTemplate,null);
            return;
        }
        else {
            console.log('mergeTemplate: additional User/Object info required for merge');
            component.set("v.context",{"mergedTemplate": mergedTemplate,
                                       "fetchUser": fetchUser,
                                       "userKeys": keyList["User"],
                                       "fetchObject": fetchObject,
                                       "objectKeys": keyList["Object"],
                                       "fetchContext": fetchContext,
                                       "contextKeys": keyList["Context"],
                                       "callback": callback });
            component.set("v.fetchUser",fetchUser);
            component.set("v.fetchObject",fetchObject);
            component.set("v.fetchContext",fetchContext);
        }
       
        console.log('mergeTemplate: END');
    },
    parseTemplate : function(template) {
        //console.log('parseTemplate: template',template);
        
        let regexp = /\{\{\{\s*(\w*[\.\w*]*)\s*\}\}\}/gi;
        //console.log('parseTemplate: regexp',regexp);
        let mergeKeys = template.match(regexp);
        //console.log('parseTemplate: mergeKeys', mergeKeys);

        if (! mergeKeys) {
            console.warn('parseTemplate: END / no mergeKeys found');
            return null;
        }
        
        //console.log('parseTemplate: mergeKeys not null');
        let mergeFields = {};
        mergeKeys.forEach(function(keyItem){
           //console.log('parseTemplate: processing keyItem',keyItem);
           //let keyParts = ((keyItem.replace(/\{|\}/gi,'')).trim()).split('.');
           let keyParts = ((keyItem.replace(/\{|\}/gi,'')).trim());
           let splitIndex = keyParts.indexOf('.');
           //console.log('parseTemplate: keyParts extracted',keyParts);
           //console.log('parseTemplate: splitIndex determined',splitIndex);
           let mainKey, fieldKey = '';
           if (splitIndex == -1) {
               mainKey  = keyParts;
               fieldKey = 'default';
           } else {
               mainKey  = keyParts.substring(0, splitIndex);
               fieldKey = keyParts.substring(splitIndex + 1);
           }
           //console.log('parseTemplate: mainKey extracted',mainKey);
           //console.log('parseTemplate: fieldKey extracted',fieldKey);
           if (! (Object.keys(mergeFields)).includes(mainKey) ) {
              mergeFields[mainKey] = {};
              //console.log('parseTemplate: new object added extracted',mainKey);
           }
           (mergeFields[mainKey])[fieldKey] = {'token': keyItem};
           //console.log('parseTemplate: specific token added',fieldKey);
        });
        console.log('parseTemplate: END / mergeFields initialized', mergeFields);
        return mergeFields;
    },
    getCurrentUser : function() {
        //console.log('getUserId invoked');
		return $A.get("$SObjectType.CurrentUser");
	},
    mergeFields : function(stringToMerge, tokenKeys, objectData) {
        //console.log('mergeFields START');

        let tokenField;
        let keyRegex;
        //console.log('mergeFields: stringToMerge to process', stringToMerge);
        //console.log('mergeFields: objectData provided', JSON.stringify(objectData));
        (Object.keys(tokenKeys)).forEach(function(tokenName){
            //console.log('mergeFields: processing tokenItem',tokenName);
            tokenField = tokenKeys[tokenName];
            //console.log('mergeFields: tokenField set',tokenField);
            
            keyRegex = new RegExp(tokenField.token, 'g');
            //console.log('mergeFields: keyRegex set', keyRegex);
            
            let targetValue = objectData[tokenName];      
            if (targetValue) {
                //console.log('mergeFields: trying as single part field --> targetValue', targetValue);
            }
            else if (tokenName.includes('.')) {
                //console.log('mergeFields: trying as multipart part field');
                let nameParts = tokenName.split('.');
                
                //console.log('mergeFields: multipart field --> nameParts', nameParts);
                targetValue = objectData;
                nameParts.forEach(function(nameItem) {
                    //console.log('mergeFields: iterating nameItem',nameItem);
                    if (targetValue) {
                        targetValue = targetValue[nameItem] || null;
                    }
                    //console.log('mergeFields: multipart targetValue updated',targetValue);
                });
                //console.log('mergeFields: multipart field set --> targetValue', targetValue);
            }
            else {
                console.warn('mergeFields: field value not found for token ',tokenName);
            }
            
            stringToMerge = stringToMerge.replace(keyRegex,targetValue);
            console.log('mergeFields: stringToMerge updated ',stringToMerge);
        });

        //ANA17/04/2020: Removing "null" string token values
        //@TODO Review this part (not understood) --> Why test on string start ???
        if(stringToMerge.startsWith("{")){
            var ObjStringToMerge = JSON.parse(stringToMerge);
            if(ObjStringToMerge.hasOwnProperty("params") && ObjStringToMerge["params"].hasOwnProperty("defaultFieldValues")){
                (Object.keys(ObjStringToMerge["params"]["defaultFieldValues"])).forEach(function(tokenKey){
                    if(ObjStringToMerge["params"]["defaultFieldValues"][tokenKey] == "null"){
                       //console.log('mergeFields: deleting ' + tokenKey)
                       delete ObjStringToMerge["params"]["defaultFieldValues"][tokenKey];
                    }
                })
            }   
            stringToMerge = JSON.stringify(ObjStringToMerge);
			console.log('mergeFields: stringToMerge cleaned ',stringToMerge);
        }

        //console.log('mergeFields END');
        return stringToMerge;
    },
    compareLists : function(subList, refList) {
        //console.log('compareFieldLists START');
        //console.log('compareFieldLists refList fetched',JSON.stringify(refList));
        let returnValue = true;
        subList.forEach(function(fieldItem){
            //console.log('compareFieldLists processing fieldItem',fieldItem);
            if (! refList.includes(fieldItem)) {
                //console.log('compareFieldLists false set');
                returnValue = false;
            }
        });
        //console.log('compareFieldLists END',returnValue);
        return returnValue;
    },
    mergeUserFields : function(component, event, helper) {
        //console.log('mergeUserFields: START');
        
        let mergeContext     = component.get("v.context");
        let userRecordFields = component.get("v.userRecordFields");
        if (userRecordFields) {
            //console.log('mergeUserFields: userRecordFields fetched',JSON.stringify(userRecordFields));
            mergeContext.fetchUser = false;
            mergeContext.mergedTemplate = helper.mergeFields(mergeContext.mergedTemplate,
                                                             mergeContext.userKeys,
                                                             userRecordFields);
            //console.log('mergeUserFields: mergedTemplate updated with User',mergeContext.mergedTemplate);
            
            component.set("v.fetchUser",false);
            
            if ((mergeContext.fetchObject) || (mergeContext.fetchContext)) {
                //console.log('mergeUserFields: additional Object or Context info required for merge');
                component.set("v.context",mergeContext);
            }
            else {
                //console.log('mergeUserFields: merge completed');
                mergeContext.callback(mergeContext.mergedTemplate,null);
                //return;
            }
        }
        else {
            //console.error('mergeUserFields: User information retrieval error',component.get('v.userRecordError'));
            mergeContext.callback(null,component.get('v.userRecordError'));
            //return;
        }
        //component.set("v.fetchUser",false);
        //console.log('mergeUserFields: END');
    },
    mergeObjectFields : function(component, event, helper) {
        //console.log('mergeObjectFields: START');
        
        let mergeContext       = component.get("v.context");
        let objectRecordFields = component.get("v.objectRecordFields");
        if (objectRecordFields) {
            //console.log('mergeObjectFields: objectRecordFields fetched',JSON.stringify(objectRecordFields));
            mergeContext.fetchObject = false;
            mergeContext.mergedTemplate = helper.mergeFields(mergeContext.mergedTemplate,
                                                             mergeContext.objectKeys,
                                                             objectRecordFields);
            //console.log('mergeObjectFields: mergedTemplate updated with Object',mergeContext.mergedTemplate);
            
            component.set("v.fetchObject",false);
            
            if ((mergeContext.fetchUser) || (mergeContext.fetchContext)) {
                //console.log('mergeObjectFields: additional User or Context info required for merge');
                component.set("v.context",mergeContext);
            }
            else {
                //console.log('mergeObjectFields: merge completed');
                mergeContext.callback(mergeContext.mergedTemplate,null);
                //return;
            }
        }
        else {
            console.error('mergeObjectFields: Object information retrieval error',component.get('v.objectRecordError'));
            mergeContext.callback(null,component.get('v.objectRecordError'));
            //return;
        }
        //component.set("v.fetchObject",false);
        //console.log('mergeObjectFields: END');
    },
    mergeContextFields : function(component, event, helper) {
        //console.log('mergeContextFields: START');
        
        let mergeContext	= component.get("v.context");
        let contextData		= (component.find("contextMgr")).getValue(); 
        if ( (contextData) && (contextData.isReady) ) {
            //console.log('mergeContextFields: contextData fetched',JSON.stringify(contextData));
            mergeContext.fetchContext = false;
            mergeContext.mergedTemplate = helper.mergeFields(mergeContext.mergedTemplate,
                                                             mergeContext.contextKeys,
                                                             contextData);
            //console.log('mergeContextFields: mergedTemplate updated with Context',mergeContext.mergedTemplate);
            
            component.set("v.fetchContext",false);
            
            if ((mergeContext.fetchUser) || (mergeContext.fetchObject)) {
                //console.log('mergeObjectFields: additional User or Object info required for merge');
                component.set("v.context",mergeContext);
            }
            else {
                //console.log('mergeObjectFields: merge completed');
                mergeContext.callback(mergeContext.mergedTemplate,null);
                //return;
            }
        }
        else {
            console.warn('mergeContextFields: Context information still not ready',contextData);
            //mergeContext.callback(null,{message:"Issue with Context merge fields."});
            //return;
        }
        //component.set("v.fetchObject",false);
        console.log('mergeObjectFields: END');
    },
    mergeAction : function(action,row,callback,component,helper) {
        //console.log('mergeAction: START');
        
        /*
        console.log('mergeAction: component',component);
        console.log('mergeAction: component name',component.getName());
        console.log('mergeAction: component global ID',component.getGlobalId());
        */
        
        let actionStr = JSON.stringify(action);
        //console.log('mergeAction: action stringified',actionStr);
        
        helper.mergeTemplate(
            actionStr,
            row,
            function(result,error) {
                  console.log('mergeAction result from merge',result);
                  if (result) {
                      let resultJson = JSON.parse(result);
                      //console.log('mergeAction: result parsed',resultJson);

                      let eventToTrigger = $A.get(resultJson.name);
                      if (eventToTrigger) {
                          if (resultJson.params) {
                              eventToTrigger.setParams(resultJson.params);
                              //console.log('mergeAction: event params set',resultJson.params);
                          }
                          console.log('mergeAction: triggering event',eventToTrigger);
                          eventToTrigger.fire();
                          if (callback) callback(resultJson,null);
                      }
                      else {
                          console.error('mergeAction: triggering merge error notification',
                                        resultJson.name + ' event not found');
                          /*component.find('notifLib').showNotice({
                             "variant": "error",
                             "header": "Error in action merge !",
                             "message": resultJson.name + ' event not found'
                          });*/
                          if (callback) callback(null,resultJson.name + ' event not found');
                      }
                  }
                  else {
                      console.error('mergeAction: triggering merge error notification',
                                    JSON.stringify(error));
                      /*component.find('notifLib').showNotice({
                         "variant": "error",
                         "header": "Error in action merge !",
                         "message": JSON.stringify(error)
                      });*/
                      if (callback) callback(null,error);
                  }
            },
            component,
            helper
        );
        //console.log('triggerAction: END');
    }
})