/***
* @description Lightning controller to provide various configuration data to Lightning components.
* @author      P-E GROS
* @date        Nov. 2019
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2019 pegros
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

public with sharing class PEG_Configuration_CTL {

/***
* @description Simple method to fetch the list of fields allowed for the user included in
*              a configured field set.
* @param       name            		Dev Name of the Field Set 
* @return      Map<String,Object>   Map containing 3 entries:
*                                   'label' with the label of the field set,
*                                   'fields' with the list of included field API names allowed for the user,
*                                   'labels' with the corresponding field labels
* @exception   none really specific.
***/
    @AuraEnabled(cacheable=true)
    public static Map<String,Object> getFieldSetDesc(final String name) {
        System.debug('getFieldSetDesc: START with field set name ' + name);

        String[] fsParts = name.split('\\.');
        System.debug('getFieldSetDesc: fsParts extracted ' + fsParts);
        if (fsParts.size()<> 2) throw new AuraHandledException(
            'Bad field set name format for ' + name + '\n Should be "object.fsName".');

        String objName = fsParts[0];
        System.debug('getFieldSetDesc: objName extracted ' + objName);
        String fsName  = fsParts[1];
        System.debug('getFieldSetDesc: fsName extracted ' + fsName);

        Schema.SObjectType objDesc = Schema.getGlobalDescribe().get(objName);
        if (objDesc == null) throw new AuraHandledException(
            'Unknown Object Name for field set ' + name + ' !');
        System.debug('getFieldSetDesc: object descriptor found ');

        Schema.FieldSet fsDesc = objDesc.getDescribe().fieldSets.getMap().get(fsName);
        if (fsDesc == null) throw new AuraHandledException(
            'Unknown Field Set Name for field set ' + name + ' !');
        System.debug('getFieldSet: field set descriptor found ');

        Map<String,Object> descResult = new Map<String,Object>();
        descResult.put('label',fsDesc.getLabel());
        System.debug('getFieldSet: field set Label set ' + fsDesc.getLabel());

        List<String> fieldList = new List<String>();
        List<String> labelList = new List<String>();
        descResult.put('fields',fieldList);
        descResult.put('labels',labelList);
        for (Schema.FieldSetMember fieldIter : fsDesc.getFields()) {
            System.debug('getFieldSet: processing field ' + fieldIter);

            Schema.DescribeFieldResult fieldDesc = fieldIter.getSObjectField().getDescribe();
            System.debug('getFieldSet: fieldDesc fetched ' + fieldDesc);

            if (fieldDesc.isAccessible()) {
                System.debug('getFieldSet: adding field ' + fieldIter);
                fieldList.add(fieldIter.getFieldPath());
                labelList.add(fieldIter.getLabel());
            }
            else {
                System.debug('getFieldSet: field not acessible ' + fieldIter);
            }
        }
        System.debug('getFieldSet: fieldList prepared ' + fieldList);
        System.debug('getFieldSet: labelList prepared ' + labelList);
        
        System.debug('getFieldSet: END for fieldList with size ' + fieldList.size());
        return descResult;
    }

/***
* @description Simple method to fetch the list of fields allowed for the user included in
*              a list of configured field sets.
* @param       names            	List of Field Set's Dev Names  
* @return      Map<String,Object>   Map of maps containing 3 entries for each fieldSet API name:
*                                   'label' with the label of the field set,
*                                   'fields' with the list of included field API names allowed for the user,
*                                   'labels' with the corresponding field labels
* @exception   none really specific.
***/
    
    @AuraEnabled(cacheable=true)
    public static Map<String,Object> getFieldSetDescs(final list<String> names) {
        System.debug('getFieldSetDescs: START with ' + names.size() + ' elements');
        Map<String,Object> nameDescs = new Map<String,Object>();

        for (String iterName : names) {
            System.debug('getFieldSetDescs: processing field set ' + iterName);
            nameDescs.put(iterName, PEG_Configuration_CTL.getFieldSetDesc(iterName));
        }

        System.debug('getFieldSetDescs: END with nameDescs ' + nameDescs);
        return nameDescs;
    }
    
    
/***
* @description Simple method to fetch the IDs of a list of Record Types
* @param       names            	List of record Type Names as "<object API name>.<Record Type Developer Name>" 
* @return      Map<String,Object>   Map of Object API names with a submap of record type IDs per Record Type name.
* @exception   none really specific.
***/
    
    @AuraEnabled(cacheable=true)
    public static Map<String,Object> getRecordTypeIDs(final list<String> names) {
        System.debug('getRecordTypeIDs: START with name list size ' + names.size());
        
        if ((names == null) || (names.size() == 0)) {
            System.debug('getRecordTypeIDs: END empty');
            return null;
        }  
        
        Map<String,Object> rtIDmap = new Map<String,Object>();
        for (String iter : names) {
            System.debug(LoggingLevel.FINEST,'getRecordTypeIDs: processing ' + iter);
            String[] iterParts = iter.split('\\.');
            System.debug(LoggingLevel.FINEST,'getRecordTypeIDs: iterParts extracted ' + iterParts);
            //ANA06/04/2020 : Check if user has access to RT
            Boolean rtAvailable = Schema.getGlobalDescribe().get(iterParts[0]).getDescribe().getRecordTypeInfosByDeveloperName().get(iterParts[1]) != null; 
            if (iterParts.size() <> 2) throw new AuraHandledException('Record type ID fetch error: ' + iter + ' should be in objectApiName.rtDevName format');
            if (!rtIDmap.containsKey(iterParts[0])) {
                rtIDmap.put(iterParts[0],new Map<String,ID>());
            }

            //
            if(rtAvailable){
                //ANA07/04/2020 : replaced 'getRecordTypeInfosByName()' with 'getRecordTypeInfosByDeveloperName()'
                ((Map<String,ID>)rtIDmap.get(iterParts[0]))
            	.put(iterParts[1],
                      Schema.getGlobalDescribe().get(iterParts[0]).getDescribe()
                        	.getRecordTypeInfosByDeveloperName().get(iterParts[1]).getRecordTypeId());  
            }
        }
        System.debug(LoggingLevel.FINEST,'getRecordTypeIDs: rtIDmap init ' + rtIDmap);
        System.debug('getRecordTypeIDs: END with ID map size ' + rtIDmap.size());
        return rtIDmap;
    }
    
/***
* @description Simple method to fetch the IDs of a list of List Views
* @param       names            	List of list view Names as "<object API name>.<List View Name>" 
* @return      Map<String,ID>   	Map of Object API names with a submap of list view IDs per List View name.
* @exception   none really specific.
***/
    
    @AuraEnabled(cacheable=true)
    public static Map<String,Object> getListViewIDs(final list<String> names) {
        System.debug('getListViewIDs: START with name list size ' + names.size());
        
        if ((names == null) || (names.size() == 0)) {
            System.debug('getListViewIDs: END empty');
            return null;
        }  
        
        Map<String,List<String>> listViewMap = new Map<String,List<String>>();
        Set<String> listViewNames = new Set<String>();
        for (String iter : names) {
            System.debug(LoggingLevel.FINEST,'getListViewIDs: processing ' + iter);
            String[] iterParts = iter.split('\\.');
            System.debug(LoggingLevel.FINEST,'getListViewIDs: iterParts extracted ' + iterParts);
            if (iterParts.size() <> 2) throw new AuraHandledException('List View ID fetch error: ' + iter + ' should be in objectApiName.rtDevName format');
            if (listViewMap.containsKey(iterParts[0])) {
                listViewMap.get(iterParts[0]).add(iterParts[1]);
            }
            else {
                List<String> newList = new List<String>{iterParts[1]};
                listViewMap.put(iterParts[0],newList);
            } 
            listViewNames.add(iterParts[1]);
        }
        System.debug(LoggingLevel.FINEST,'getListViewIDs: listViewMap init' + listViewMap);
        System.debug(LoggingLevel.FINEST,'getListViewIDs: listViewNames init' + listViewNames);
        System.debug('getListViewIDs: listViewMap init with size ' + listViewMap.size());
        System.debug('getListViewIDs: listViewNames init with size ' + listViewNames.size());
                
        List<ListView> lvList = [SELECT SObjectType, DeveloperName FROM ListView
                                 WHERE SObjectType in :listViewMap.keySet()
                                 AND DeveloperName in :listViewNames ];
        System.debug(LoggingLevel.FINEST,'getListViewIDs: listViews fetched ' + lvList);
        System.debug('getListViewIDs: listViews fetched with size ' + lvList.size());
        
        Map<String,Object> lvIDMap = new Map<String,Object>();
        for (ListView iter : lvList) {
            if (listViewMap.get(iter.SObjectType).contains(iter.DeveloperName)) {
                if (!lvIDMap.containsKey(iter.SObjectType)) {
                	lvIDMap.put(iter.SObjectType,new Map<String,ID>());
            	}
            	((Map<String,ID>)lvIDMap.get(iter.SObjectType)).put(iter.DeveloperName,iter.Id);
            }
        }
        System.debug(LoggingLevel.FINEST,'getListViewIDs: lvMap prepared ' + lvIDMap);
        System.debug('getListViewIDs: END with ID Map size ' + lvIDMap.size());
        return lvIDMap;
    }

/***
* @description Simple method to fetch the IDs of a list of Reports
* @param       names            	List of report developer names 
* @return      Map<String,ID>   	Map of Report dev names with related ID.
* @exception   none really specific.
***/
    
    @AuraEnabled(cacheable=true)
    public static Map<String,Object> getReportIDs(final list<String> names) {
        System.debug('getReportIDs: START with name list size ' + names.size());
        
        if ((names == null) || (names.size() == 0)) {
            System.debug('getReportIDs: END empty');
            return null;
        }  
                
        List<Report> reportList = [	SELECT ID, DeveloperName FROM Report
                                 	WHERE DeveloperName in : names ];
        System.debug(LoggingLevel.FINEST,'getReportIDs: reportList fetched ' + reportList);
        System.debug('getReportIDs: reportList fetched with size ' + reportList.size());
        
        Map<String,Object> reportIDMap = new Map<String,Object>();
        for (Report iter : reportList) {
            reportIDMap.put(iter.DeveloperName,iter.Id);
        }
        System.debug(LoggingLevel.FINEST,'getReportIDs: reportIDMap prepared ' + reportIDMap);
        System.debug('getReportIDs: END with ID Map size ' + reportIDMap.size());
        return reportIDMap;
    }
  
/***
* @description Simple method to fetch the possible labels / values of a list of picklists
* @param       names            	List of picklist names (as "ObjectApiName.FieldApiName")
* @return      Map<String,Object>	Map of picklist names with details about label and value.
* @exception   none really specific.
***/
    
    @AuraEnabled(cacheable=true)
    public static Map<String,Object> getPicklistDetails(final list<String> names) {
        System.debug('getPicklistDetails: START with name list size ' + names.size());
        
        if ((names == null) || (names.size() == 0)) {
            System.debug('getPicklistDetails: END empty');
            return null;
        }  
          
        Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();
        Map<String,Object> picklistmap = new Map<String,Object>();
        for (String iter : names) {
            System.debug(LoggingLevel.FINEST,'getPicklistDetails: processing picklist ' + iter);
            String[] iterParts = iter.split('\\.');
            System.debug(LoggingLevel.FINEST,'getPicklistDetails: iterParts extracted ' + iterParts);
            if (iterParts.size() <> 2) {
            	System.debug(LoggingLevel.ERROR,'getPicklistDetails: END / wrong name format ' + iter);
            	throw new AuraHandledException('Picklist fetch error: ' + iter + ' should be in "objectApiName.fieldApiName" format');
            }
            
			Schema.DescribeFieldResult fieldDesc = gd.get(iterParts[0])?.getDescribe()?.fields?.getMap()?.get(iterParts[1])?.getDescribe();
            if (fieldDesc == null) {
            	System.debug(LoggingLevel.ERROR,'getPicklistDetails: END / object or field not found ' + iter);
                throw new AuraHandledException('Picklist fetch error: ' + iter + ' picklist not found');
            }
            
            if (fieldDesc.getType() != Schema.DisplayType.PICKLIST) {
            	System.debug(LoggingLevel.ERROR,'getPicklistDetails: END / field not a picklist ' + iter);
                throw new AuraHandledException('Picklist fetch error: ' + iter + ' field should be a picklist');
            }
            
            List<Schema.PicklistEntry> picklistValues = fieldDesc.getPicklistValues();
            List<Map<String,Object>> outputMap = new List<Map<String,Object>>();
            for (Schema.PicklistEntry iterVal : picklistValues) {
				//System.debug(LoggingLevel.FINEST,'getPicklistDetails: processing iterVal ' + iterVal);
                if (iterVal.isActive()) {
					System.debug(LoggingLevel.FINEST,'getPicklistDetails: registering iterVal ' + iterVal);
                    outputMap.add(new Map<String,Object> {
                    	'label' => iterVal.getLabel(),
                    	'value' => iterVal.getValue(),
                        'isDefault' => iterVal.isDefaultValue()
                	});
                }
                else {
					System.debug(LoggingLevel.FINEST,'getPicklistDetails: iterVal inactive' + iterVal);
                }
            }
        	//picklistmap.put(iter, (Object)(fieldDesc.getPicklistValues()));
        	picklistmap.put(iter, (Object)(outputMap));
        }

		System.debug(LoggingLevel.FINEST,'getPicklistDetails: picklistmap init ' + picklistmap);
        System.debug('getPicklistDetails: END with picklist map size ' + picklistmap.size());
		return picklistmap;
    }

}