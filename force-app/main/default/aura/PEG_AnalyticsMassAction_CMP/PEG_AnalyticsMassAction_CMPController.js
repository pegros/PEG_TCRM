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
	handleInit : function(component, event, helper) {
        console.log('handleInit: START');
        helper.doInit(component,event, helper);
        console.log('handleInit: END');	
	},
    handleDBLoaded: function(component, event, helper) {
        console.log('handleDBLoaded: START');
        helper.finalizeInit(component,event,helper);
        console.log('handleDBLoaded: END');
    },
    launchAction: function(component, event, helper) {
        console.log('launchAction: START');
        helper.startAction(component,event,helper);
        console.log('launchAction: END');
    },
    confirmAction: function(component, event, helper) {
        console.log('confirmAction: START');
        helper.doAction(component,event,helper);
        console.log('confirmAction: END');
    },
    cancelAction: function(component, event, helper) {
        console.log('cancelAction: START');
        component.set("v.actionError",null);
        component.set("v.isRunning",false);
        console.log('cancelAction: END');
    },
    handleSubmit : function(component, event, helper) {
        console.log('handleSubmit: START');
        console.log('handleSubmit: event params ',JSON.stringify(event.getParams()));  

        event.preventDefault();
        helper.doAction(component, event, helper);
        
        console.log('handleSubmit: END');
    },
    handleLoad : function(component, event, helper) {
        console.log('handleLoad: START');
        console.log('handleLoad: event params ',JSON.stringify(event.getParams()));
        console.log('handleLoad: END');        
    },
    handleFieldChange : function(component, event, helper) {
        console.log('handleFieldChange: START');
        console.log('handleFieldChange: event params ',JSON.stringify(event.getParams()));
        let fieldName = event.getSource().get("v.fieldName");
        console.log('handleFieldChange fieldName',fieldName);      
        let fieldValue = event.getParams().value;
        console.log('handleFieldChange fieldValue',fieldValue);
        console.log('handleFieldChange: END');        
    }
})