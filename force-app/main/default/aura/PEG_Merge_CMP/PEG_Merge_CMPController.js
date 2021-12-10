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
    triggerMerge : function(component,event,helper) {
        //console.log('triggerMerge: START');
        
        let methodArg = event.getParam('arguments');
        //console.log('mergeTemplate: methodArg fetched',JSON.stringify(methodArg));
        
        if (! methodArg.callback) {
            console.error('mergeTemplate: missing callback arguments',JSON.stringify(methodArg));
            component.find('notifLib').showNotice({
              "variant": "error",
              "header" : "Missing argument for merge !",
              "message": "Callback parameter is missing in triggerMerge() method."
            });
            return;
        }
        
        if (! methodArg.template) {
            console.error('mergeTemplate: missing template arguments',JSON.stringify(methodArg));
            methodArg.callback(null,[{"message":"Template parameter is missing in triggerMerge() method."}]);
            return;
        }
        
        helper.mergeTemplate(methodArg.template,
                             methodArg.row,
                             methodArg.callback,
                             component,helper);
        //console.log('triggerMerge: END');
    },
    
    triggerUserMerge : function(component, event, helper) {
        //console.log('triggerUserMerge: START');
        helper.mergeUserFields(component, event, helper);
        //console.log('triggerUserMerge: END');
    },
    
    triggerObjectMerge : function(component, event, helper) {
        //console.log('triggerObjectMerge: START');
        helper.mergeObjectFields(component, event, helper);
        //console.log('triggerObjectMerge: END');
    },
    triggerContextMerge : function (component, event, helper) {
        //console.log('triggerContextMerge: START');
        
        let fetchContext = component.get("v.fetchContext");
        //console.log('triggerContextMerge: fetchContext fetched',fetchContext);
        
        if (fetchContext) {
            //console.log('triggerContextMerge: processing event');
            helper.mergeContextFields(component,event,helper);
        }
        else {
            //console.log('triggerContextMerge: event ignored');
        }
        
        //console.log('triggerContextMerge: END');
    },
    triggerAction : function(component, event, helper) {
        //console.log('triggerAction: START');
        
        let methodArg = event.getParam('arguments');
        //console.log('triggerAction: methodArg from event',JSON.stringify(methodArg));
       
        if (! methodArg.action) {
            console.error('mergeTemplate: missing action arguments',JSON.stringify(methodArg));
            methodArg.callback(null,[{"message":"Action parameter is missing in triggerAction() method."}]);
            return;
        }
        
        helper.mergeAction(methodArg.action,
                           methodArg.row,
                           methodArg.callback,
                           component, helper);
        //console.log('triggerAction: END');
    }
    /*,
    // WORK IN PROGRESS
    handleCallback : function(component,event,helper) {
        console.log('handleCallback: START');
        
        let channel = event.getParam('channel');
        console.log('handleCallback: event channel received',channel);
		
        let message = event.getParam('message');
        console.log('handleCallback: event message received',JSON.stringify(message));
        
        let cmpId = component.getGlobalId();
        console.log('handleCallback: cmpId',cmpId);
        
        if (   (channel === 'PEG_Callback')
            && (message.sourceId === cmpId)) {
            console.warn('handleCallback: callback OK');
            $A.get('e.force:refreshView').fire();
            console.warn('handleCallback: refreshed');
        } else {
            console.warn('handleCallback: callback ignored');
        }
        
        
        console.log('handleCallback: END');
    }*/
})