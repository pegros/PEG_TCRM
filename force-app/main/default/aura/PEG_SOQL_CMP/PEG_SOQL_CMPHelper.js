({
/***
* @author P-E GROS
* @date   Sept. 2020
* @description  Aura Component to execute any custom SOQL or DML operation from an Aura component
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
	runExecQuery : function(component,query,bypassFLS,bypassSharing,queryType,setStorable,setBackground,callback) {
        //console.log('runExecQuery: START');
       
        if ((! callback) || (! query)) {   
            console.error('runExecQuery: missing parameters');
            return;
        }
        
        let queryAction;
        if (setStorable) {
           queryAction = component.get("c.executeQueryStorable");
           //console.log('runExecQuery: storable query requested',setStorable);
        }
        else {
           queryAction = component.get("c.executeQuery");
           //console.log('runExecQuery: non storable query requested',setStorable);
        }        
        
        queryAction.setParams({
            "queryString":   query,
            "bypassFLS":     bypassFLS,
            "bypassSharing": bypassSharing,
            "queryType":     queryType
        });
        //console.log('runExecQuery: queryAction params set',queryAction.getParams());
            
        if (setBackground) {
           queryAction.setBackground();
        }
        //console.log('runExecQuery: setBackground set',setBackground);
        
        var callbackAction = callback;
        queryAction.setCallback(this, function(response){
            //console.log('runExecQuery: response received',response);
            
            if (response.getState() == "SUCCESS"){
                //console.log('runExecQuery: OK response received',JSON.stringify(response.getReturnValue()));
                callback(response.getReturnValue(),null);
            }
            else {
                console.warn('runExecQuery: KO response received',JSON.stringify(response.getError()));
                callback(null,response.getError());
            }
            //console.log('runExecQuery: END');
        });
        //console.log('runExecQuery: queryAction set',queryAction);
                
        $A.enqueueAction(queryAction);
        //console.log('runExecQuery: queryAction sent');
	},
    runExecDML : function(component, dmlOperation, itemList, callback, bestEffort) {
        //console.log('runExecDML: START');

        if ((! callback) || (! dmlOperation) || (! itemList)) {   
            console.error('runExecDML: missing parameters');
            return;
        }

        //console.log('runExecDML: bestEffort set to ', bestEffort);
        let dmlActionName = (bestEffort ? "c.executeDMLbe" : "c.executeDML");
        //console.log('runExecDML: dmlActionName set to ', dmlActionName);
        var dmlAction = component.get(dmlActionName);
        dmlAction.setParams({
            "itemList": itemList,
            "operation": dmlOperation
        });
        //console.log('runExecDML: dmlAction params set',dmlAction.getParams());

        var callbackAction = callback;
        dmlAction.setCallback(this, function(response){
            //console.log('runExecDML: response received',response);

            if (response.getState() == "SUCCESS"){
                //console.log('runExecDML: OK response received',response.getReturnValue());
                callback(response.getReturnValue(),null);
            }
            else {
                console.warn('runExecDML: KO response received',response.getError());
                callback(null,response.getError());
            }
            //console.log('runExecDML: END');
        });
        //console.log('runExecDML: queryAction set',dmlAction);

        $A.enqueueAction(dmlAction);
        //console.log('runExecDML: queryAction sent');
     },
    // Work in Progress
     runExecMultiQuery : function(component,queryList,setStorable,setBackground,callback) {
        //console.log('runExecMultiQuery: START');

        if ((! callback) || (! queryList)) {   
            console.error('runExecMultiQuery: missing parameters',
                          {"queryList":queryList,"callback":callback});
            return;
        }

        var queryAction = component.get("c.executeMultiQuery");
        queryAction.setParams({
            "queries": queryList
        });
        //console.log('runExecMultiQuery: multiQueryAction params set',queryAction.getParams());
        
        if (setStorable) {
           queryAction.setStorable();
        }
        //console.log('runExecMultiQuery: setStorable set',setStorable);
        
        if (setBackground) {
           queryAction.setBackground();
        }
        //console.log('runExecMultiQuery: setBackground set',setBackground);
        
        var callbackAction = callback;
        queryAction.setCallback(this, function(response){
            //console.log('runExecMultiQuery: response received',response);
            
            if (response.getState() == "SUCCESS"){
                //console.log('runExecMultiQuery: OK response received',response.getReturnValue());
                callback(response.getReturnValue(),null);
            }
            else {
                console.warn('runExecMultiQuery: KO response received',response.getError());
                callback(null,response.getError());
            }
            //console.log('runExecMultiQuery: END');
        });
        //console.log('runExecMultiQuery: multiQueryAction set',queryAction);
                
        $A.enqueueAction(queryAction);
        //console.log('runExecMultiQuery: multiQueryAction sent');
	}
})