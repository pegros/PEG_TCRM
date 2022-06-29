/***
* @description Lightning controller to provide custom SOQL and DML execution feature to Lightning components.
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

public with sharing class PEG_SoqlOperation_CTL {

  // Private Exception
  public class PEG_Exception extends Exception  {}

  // Private method to execute query without sharing.
  private without sharing class PEG_SoqlSubOperation_CTL {
        public list<sObject> executeQuery(String queryString) {
            System.debug('executeSubQuery : query requested '  + queryString);
            return Database.query(queryString);
        }
  }
      
  // ------------------------------------------------------------------------  
  @AuraEnabled
  public static list<sObject> executeQuery(String  queryString,
                                           Boolean bypassFLS,
                                           Boolean bypassSharing,
                                           String  queryType) {
     System.debug('executeQuery : query requested '  + queryString);
     System.debug('executeQuery : bypassFLS '        + bypassFLS);
     System.debug('executeQuery : bypassSharing '    + bypassSharing);
     System.debug('executeQuery : queryType '        + queryType);
                                                                                      
     try {
         
         // Bypass & Security controls
         if ((bypassFLS) || (bypassSharing)) {
             System.debug('executeQuery : bypassFLS or bypassSharing requested.');
             if ((queryType == null) || (queryType.length() == 0)) {
                 System.debug('executeQuery: control KO because of missing queryType');
                 throw new PEG_Exception('Control Error: Please request a bypass with a valid queryType.');
             } else {
                 System.debug('executeQuery: fetching query configuration for queryType ' + queryType);
                 PEG_Query__mdt[] queryConfig = [select Bypass_FLS__c , Bypass_Sharing__c, SOQL_RegExp__c
                                                 from  PEG_Query__mdt where DeveloperName  = :queryType  ];
                 System.debug('executeQuery: query configuration fetched ' + queryConfig);
                 if (queryConfig.size() == 1) {
                     if (Pattern.matches(queryConfig[0].SOQL_RegExp__c,queryString)) {
                         System.debug('executeQuery: query regexp OK ' + queryConfig[0].SOQL_RegExp__c);
                         if ((bypassFLS) && (!(queryConfig[0].Bypass_FLS__c))) {
                             System.debug('executeQuery: bypassFLS requested but config KO');
                             throw new PEG_Exception('Control Error: Provided Query Type does not authorize FLS bypass');
                         }
                         if ((bypassSharing) && (!(queryConfig[0].Bypass_Sharing__c))) {
                             System.debug('executeQuery: bypassSharing requested but config KO');
                             throw new PEG_Exception('Control Error: Provided Query Type does not authorize Sharing bypass');
                         }
                         System.debug('executeQuery: bypasses requested OK ');
                     } else {
                         System.debug('executeQuery: query regexp KO ' + queryConfig[0].SOQL_RegExp__c);
                         throw new PEG_Exception('Control Error: Provided SOQL query does not match configured regular expression for Request Type.');
                     }
                 } else {
                     System.debug('executeQuery: query configuration KO ');
                     throw new PEG_Exception('Control Error: Configuration error for Request Type');     
                 }
             }
         } else {
             System.debug('executeQuery : checking that FLS are checked.');
             if (queryString.contains('SECURITY_ENFORCED')){
                 System.debug('executeQuery: FLS control OK');
             } else {
                 System.debug('executeQuery: FLS control KO');
                 throw new PEG_Exception('FLS Control Error: Please apply WITH SECURITY_ENFORCED in SOQL or request a bypass with a valid queryType.');
             }
         }
         
         /*
         if (checkPermissions) {
            PEG_SoqlOperation_CTL.checkAccess(queryString);
            //queryString = queryString + ' WITH SECURITY_ENFORCED';
            System.debug('executeQuery : checkPermissions requested ' + queryString);
         } else {
            System.debug('executeQuery : checkPermissions bypassed');
         }
         */
         
         List<sObject> sobjList;
         if (bypassSharing) {
             System.debug('executeQuery : executing without sharing request');
             PEG_SoqlSubOperation_CTL subHandler = new PEG_SoqlSubOperation_CTL();
             sobjList = subHandler.executeQuery(queryString);
         } else {
             System.debug('executeQuery : executing with sharing request');
             sobjList = Database.query(queryString);
         }
         System.debug('executeQuery : query executed ' + sobjList);
         return sobjList;
     } catch (Exception e) {
         //System.debug('executeQuery : returning error ' + e);
         System.debug('executeQuery : returning error ' + e.getMessage());
         throw new AuraHandledException(e.getMessage());
     }
  }
    
  // ------------------------------------------------------------------------  
  @AuraEnabled(cacheable=true)
  public static list<sObject> executeQueryStorable(String queryString,
                                                   Boolean bypassFLS,
                                                   Boolean bypassSharing,
                                                   String  queryType) {
      System.debug('executeQueryStorable: START');
      System.debug('executeQueryStorable : query requested '  + queryString);
      System.debug('executeQueryStorable : bypassFLS '        + bypassFLS);
      System.debug('executeQueryStorable : bypassSharing '    + bypassSharing);
      System.debug('executeQueryStorable : queryType '        + queryType);
      return PEG_SoqlOperation_CTL.executeQuery(queryString,bypassFLS,bypassSharing,queryType);  
  }
  /*
  // ------------------------------------------------------------------------
  @AuraEnabled
  public static Integer executeCountQuery(String queryString, Boolean checkPermissions) {
     System.debug('executeCountQuery : query requested '  + queryString);
     System.debug('executeCountQuery : checkPermissions ' + checkPermissions);
     
     try {
         if (checkPermissions) {
            PEG_SoqlOperation_CTL.checkAccess(queryString);
            System.debug('executeQuery : checkPermissions requested');
         } else {
            System.debug('executeQuery : checkPermissions bypassed');
         }
         Integer countResult = Database.countQuery(queryString);
         System.debug('executeQuery : countQuery executed ' + countResult);
         return countResult;
     } catch (Exception e) {
         System.debug('executeQuery : returning error ' + e.getMessage());
         throw new AuraHandledException(e.getMessage());
     }
  }
  */
  // ------------------------------------------------------------------------
  @AuraEnabled
  public static list<sObject> executeDML(list<sObject> itemList, string operation) {
     System.debug('executeDML : itemList provided ' + itemList);
     System.debug('executeDML : operation provided ' + operation); 
      
     try {
         switch on operation {
             when 'insert' {
                 insert itemList;
                 System.debug('executeDML : itemList inserted ' + itemList);
             }
             when 'update' {
                 update itemList;
                 System.debug('executeDML : itemList updated ' + itemList);
             }
             /*
             when 'upsert' {
                 upsert itemList;
                 System.debug('executeDML : itemList upserted ' + itemList);
             }
             */
             when 'delete' {
                 delete itemList;
                 System.debug('executeDML : itemList deleted ' + itemList);
             }
             /*
             when 'undelete' {
                 undelete itemList;
                 System.debug('executeDML : itemList undeleted ' + itemList);
             }
             */
             when else {
                 StringException  errInvalid = new StringException();
                 errInvalid.setMessage('Unknown or unsupported operation (' + operation + ') requested!');
                 throw errInvalid;
             }
        }
        return itemList;
    }
    catch (Exception e) {
        System.debug('executeDML : returning error ' + e.getMessage());
        if (e.getTypeName() == 'System.DmlException') {
            System.debug('executeDML : returning DML Exception ' + ((System.DmlException)e).getDmlMessage(0));
            throw new AuraHandledException(((System.DmlException)e).getDmlMessage(0));
        }
        throw new AuraHandledException(e.getMessage());
    }
 }

 @AuraEnabled
 public static list<sObject> executeDMLbe(list<sObject> itemList, string operation) {
    System.debug('executeDMLbe : itemList provided ' + itemList);
    System.debug('executeDMLbe : operation provided ' + operation); 

    try {
        switch on operation {
            when 'insert' {
                Database.SaveResult[] results = database.insert(itemList,false);
                System.debug('executeDMLbe : itemList inserted ' + results);
                for (Database.SaveResult iter : results) {
                    if (!iter.isSuccess()) {
                        System.debug('executeDMLbe : issue found on ' + iter.getId() + ' -> ' + iter.getErrors());                 
                    }
                }
            }
            when 'update' {
                Database.SaveResult[] results = database.update(itemList,false);
                System.debug('executeDMLbe : itemList updated ' + results);
                for (Database.SaveResult iter : results) {
                    if (!iter.isSuccess()) {
                        System.debug('executeDMLbe : issue found on ' + iter.getId() + ' -> ' + iter.getErrors());                 
                    }
                }
            }
            /*
            when 'upsert' {
                upsert itemList;
                System.debug('executeDML : itemList upserted ' + itemList);
            }
            */
            when 'delete' {
                Database.DeleteResult[] results = database.delete(itemList,false);
                System.debug('executeDMLbe : itemList deleted ' + results);
                for (Database.DeleteResult iter : results) {
                    if (!iter.isSuccess()) {
                        System.debug('executeDMLbe : issue found on ' + iter.getId() + ' -> ' + iter.getErrors());                 
                    }
                }
            }
            /*
            when 'undelete' {
                undelete itemList;
                System.debug('executeDML : itemList undeleted ' + itemList);
            }
            */
            when else {
                StringException  errInvalid = new StringException();
                errInvalid.setMessage('Unknown or unsupported operation (' + operation + ') requested!');
                throw errInvalid;
            }
       }
       return itemList;
     }
     catch (Exception e) {
        System.debug('executeDML : returning error ' + e.getMessage());
        if (e.getTypeName() == 'System.DmlException') {
            System.debug('executeDML : returning DML Exception ' + ((System.DmlException)e).getDmlMessage(0));
            throw new AuraHandledException(((System.DmlException)e).getDmlMessage(0));
        }
        throw new AuraHandledException(e.getMessage());
     }        
  }
  /*
  // ------------------------------------------------------------------------
  public static void checkAccess(String queryString) {
     System.debug('checkAccess : queryString ' + queryString.toUpperCase());
      
     String simplifiedQuery = (queryString.toUpperCase()).replaceAll('\\(.*\\)', '');
     System.debug('checkAccess : simplifiedQuery ' + simplifiedQuery);
      
     //pattern myPattern = pattern.compile('^\\s*(SELECT)\\s+(.*)\\s+(FROM)\\s+([A-Z0-9_]*)');
     pattern myPattern = pattern.compile('^.*FROM\\s+(\\w+).*$');
     matcher myMatcher = myPattern.matcher(simplifiedQuery);
      
     if (myMatcher.matches()) {
        System.debug('group(0) ' + myMatcher.group(0));
        System.debug('group(1) ' + myMatcher.group(1));
         
        String[] objTypes = new String[]{myMatcher.group(1)};
        
        Schema.DescribeSobjectResult objDesc;
        try {
            objDesc = Schema.describeSObjects(objTypes)[0];
            System.debug('objDesc ' + objDesc);
        } catch (Exception e) {
            SObjectException  errInvalid = new SObjectException();
            errInvalid.setMessage(myMatcher.group(1)
                                  + ' base object of SOQL query not found for Access Control!');
            throw errInvalid;
        }
        if (! objDesc.isAccessible()) {
            NoAccessException errNoAccess = new NoAccessException();
            errNoAccess.setMessage(myMatcher.group(1)
                                   + ' base object of SOQL query not allowed for current User!');
            throw errNoAccess;
        }
        //System.debug('group(2) ' + myMatcher.group(2));
     } else {
        StringException  errInvalid = new StringException();
        errInvalid.setMessage('Error when parsing SOQL query for Access Control!');
        throw errInvalid;
     }
  }
    
  // ------------------------------------------------------------------------  
  public class PEG_MultiSelect_CLS {
      @AuraEnabled public String name {get; set; }
      @AuraEnabled public String icon {get; set; }
      @AuraEnabled public String query {get; set; }
      @AuraEnabled public list<SObject> results {get; set;}
  }
    
  @AuraEnabled
  public static map<String,list<sObject>> executeMultiQuery(map<String,String> queries) {
     //String queriesAsString) {
     System.debug('executeMultiQuery : queries requested '  + queries);
     //System.debug('executeMultiQuery : param is list requested '  (queries instanceof List<object>));
     //list<PEG_SoqlOperation_CTL.PEG_MultiSelect_CLS> queries =
     //    (list<PEG_SoqlOperation_CTL.PEG_MultiSelect_CLS>)
     //    JSON.deserialize(queriesAsString, list<PEG_SoqlOperation_CTL.PEG_MultiSelect_CLS>.class);
     //System.debug('executeMultiQuery : queries requested '  + queries);
                       
     try {
         System.debug('executeMultiQuery : queries number '  + queries.size());
         
         map<String,list<sObject>> results = new map<String,list<sObject>>();
         for (String queryItem : queries.keySet()) {
         //for (PEG_SoqlOperation_CTL.PEG_MultiSelect_CLS queryItem : queries) {
             System.debug('executeMultiQuery : processing queryItem name ' + queryItem);
             System.debug('executeMultiQuery : processing queryItem value ' + queries.get(queryItem));
             results.put(queryItem,Database.query(queries.get(queryItem)));
             System.debug('executeMultiQuery : query executed ' + results.get(queryItem));
         }
         System.debug('executeMultiQuery : all queries executed ' + results);
         return results;
     } catch (Exception e) {
         System.debug('executeMultiQuery : returning error ' + e.getMessage());
         throw new AuraHandledException(e.getMessage());
     }
  }
  */  
}