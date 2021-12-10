({
/***
* @author P-E GROS
* @date   Sept. 2020
* @description  Aura Component to display a message in a standardised way
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
	CONFIGURATION : {
        "strong": {
            "info": {
                "iconName": "info_alt",
                "iconVariant": "inverse",
                "theme": "slds-theme_info",
                "textVariant":"slds-text-color_inverse"
            },
            "warning": {
                "iconName": "warning",
                "iconVariant": "warning",
                "theme": "slds-theme_warning",
                "textVariant":"slds-text-color_inverse"
            },
            "error": {
                "iconName": "error",
                "iconVariant": "inverse",
                "theme": "slds-theme_error",
                "textVariant":"slds-text-color_inverse"
            },         

            "success": {
                "iconName": "success",
                "iconVariant": "inverse",
                "theme": "slds-theme_success",
                "textVariant":"slds-text-color_inverse"
            }
        },
        "light": {
            "info": {
                "iconName": "info_alt",
                "iconVariant": "",
                "theme": "slds-theme_default",
                "textVariant":"slds-text-color_default"
            },
            "warning": {
                "iconName": "warning",
                "iconVariant": "warning",
                "theme": "slds-theme_default",
                "textVariant":"slds-text-color_error"
            },
            "error": {
                "iconName": "error",
                "iconVariant": "error",
                "theme": "slds-theme_default",
                "textVariant":"slds-text-color_error"
            }, 
            "success": {
                "iconName": "success",
                "iconVariant": "success",
                "theme": "slds-theme_default",
                "textVariant":"slds-text-color_success"
            }
        }
    },
    setConfiguration : function (component,helper) {
        console.log('setConfiguration: START');

         //let newVariant = event.getParam("value");
        let newVariant = component.get("v.variant");
        console.log('setConfiguration: newVariant fetched',newVariant);
        let theme = component.get("v.theme");
        console.log('setConfiguration: theme fetched',theme);
        
        if ((helper.CONFIGURATION[theme]) && (helper.CONFIGURATION[theme][newVariant])) {
            component.set("v.configuration",helper.CONFIGURATION[theme][newVariant]);
            console.log('setConfiguration: configuration updated',helper.CONFIGURATION[theme][newVariant]);
        }
        else {
           console.warn('setConfiguration: variant unsupported ',newVariant);
        }
        
        console.log('setConfiguration: END');       
    }, 
    setErrorMessage  : function (component,helper) {
        console.log('setErrorMessage: START');

        let error = component.get("v.error");
        console.log('setErrorMessage: error fetched',error);
        
        let errorMessage = '';
        if (error) {
            errorMessage = helper.parseError(helper,error);
            console.log('setErrorMessage: new error message generated ',errorMessage); 
        }
        else {
            console.log('setErrorMessage: no error message to set');             
        }
        //ANA08/07/2020: US Siret Correction
        /*if(component.get("v.title") == "Validation Adresse"){
            component.set("v.errorMessage",errorMessage.replace(/[\r\n]+/g, "\n"));
        }else{
            component.set("v.errorMessage",errorMessage);

        }*/
        component.set("v.errorMessage",errorMessage);
        console.log('setErrorMessage: END');
    },
    parseError : function (helper,error) {
        //console.log("parseError START with", JSON.stringify(error));
        let errorMessage = '';
        
        if (! error) {
            //console.log("parseError END no error");
            return '';
        }
        if (typeof error != 'object') {
            //console.log("parseError END no object");
            return '';
        }
        
        if (error.constructor === [].constructor) {
            console.log("parseError : processing error list");
            error.forEach(function(errorItem){
                console.log("parseError : processing error item",errorItem);
                let newMsg = helper.parseError(helper,errorItem);
                if (newMsg) errorMessage += newMsg + '\n';
                //errorMessage += helper.parseError(helper,errorItem) + '\n';
            });
        }
        else {
            console.log("parseError : processing error object");
            if (error["message"]) {
                //console.log("parseError : message field found");
                errorMessage += error["message"] + '\n';

                //ANA08/07/2020: US Siret Correction
                /*if(this.IsJsonString(error["message"])){
                    if(JSON.parse(error["message"]).message != null){
                        errorMessage = JSON.parse(error["message"]).message + '\n';
                    }
                    if(JSON.parse(error["message"]).details != null && JSON.parse(error["message"]).details[0].message){
                        errorMessage += JSON.parse(error["message"]).details[0].message;
                    }
                }*/
            }
            for (var fieldItem in error) {
                console.log("parseError : processing fieldItem",fieldItem);
                if ((error[fieldItem]) && ((error[fieldItem]).constructor === [].constructor)) {
                    console.log("parseError : propagating to list fieldItem");
                    let newMsg = helper.parseError(helper,error[fieldItem]);
                    if (newMsg) errorMessage += newMsg + '\n';
                    //errorMessage += helper.parseError(helper,error[fieldItem]);
                }
            }
            if (errorMessage) errorMessage = errorMessage.slice(0,-1);
            //errorMessage = errorMessage.slice(0,-1);
        }
        
        //console.log("parseError END with", errorMessage);
        return errorMessage;
    },
    IsJsonString : function (str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
})