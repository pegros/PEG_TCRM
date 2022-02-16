/***
* @description Test class for the PEG_Configuration_CTL class.
* @author      P-E GROS
* @date        Nov. 2019
* @see         PEG_Configuration_CTL
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

@isTest
public class PEG_Configuration_CTL_TST {

/***
* @description Initializes the test context.
***/
    @testSetup
    static void testSetup() {
        System.debug('testSetup: START');

        System.debug('testSetup: END');
    }


/***
* @description Tests the "getFieldSetDesc" method.
***/
    static TestMethod void testGetFieldSetDesc() {
        System.debug('testGetFieldSetDesc: START'); 
        Test.startTest();

        try {
            //TEST WITH FSC standard FieldSet
            //@TODO default FieldSet to define for tests
            Map<String,Object> fsDesc = PEG_Configuration_CTL.getFieldSetDesc('Account.WM_Client_Profile_Header');
            System.debug('testGetFieldSetDesc: no exception raised and desc returned ' + fsDesc);
            //System.assert(true);
            System.assertNotEquals(null, fsDesc);
        }
        catch (Exception e) {
            System.debug('testGetFieldSetDesc: exception raised' + e.getMessage());
            System.assert(false);
        }
            
        try {
            List<String> nameList = new List<String>();
            nameList.add('Account.SF_PEG_DUMMY_FIELDSET');
            PEG_Configuration_CTL.getFieldSetDescs(nameList);
            //sfpegConfiguration_CTL.getFieldSetDesc('Account.SF_PEG_DUMMY_FIELDSET');
            System.debug('testGetFieldSetDesc: no exception raised');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetFieldSetDesc: exception raised' + e.getMessage());
            System.assert(true);
        }

        
        try {
            List<String> nameList = new List<String>();
            nameList.add('Test.Test');
            PEG_Configuration_CTL.getFieldSetDescs(nameList);
            System.debug('testGetFieldSetDesc: no exception raised for Test.Test');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetFieldSetDesc: exception raised for Test.Test' + e.getMessage());
            System.assert(true);
        }
       
        try {
            List<String> nameList = new List<String>();
            nameList.add('Test');
            PEG_Configuration_CTL.getFieldSetDescs(nameList);
            System.debug('testGetFieldSetDesc: no exception raised for Test');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetFieldSetDesc: exception raised for Test' + e.getMessage());
            System.assert(true);
        }
        
        Test.stopTest();
        System.debug('testGetFieldSetDesc: END');
    }

/***
* @description Tests the "getRecordTypeIDs" method.
***/
    static TestMethod void testgetRecordTypeIDs() {
        System.debug('testgetRecordTypeIDs: START'); 
        Test.startTest();

        try {
            Map<String,Object> rtId = PEG_Configuration_CTL.getRecordTypeIDs(new List<String>{'Account.Tiers'});
            System.debug('testgetRecordTypeIDs: no exception raised and RecordTypeId returned ' + rtId);
            System.assert(true);
            System.assertNotEquals(null, rtId);
        }
        catch (Exception e) {
            System.debug('testgetRecordTypeIDs: exception raised' + e.getMessage());
            System.assert(false);
        }
        
        Test.stopTest();
        System.debug('testgetRecordTypeIDs: END');
    }

/***
* @description Tests the "getRecordTypeIDs" method. Test for error
***/
    static TestMethod void testgetRecordTypeIDsNull() {
        System.debug('testgetRecordTypeIDsNull: START'); 
        Test.startTest();

        try {
            Map<String,Object> rtId = PEG_Configuration_CTL.getRecordTypeIDs(new List<String>());
            System.debug('testgetRecordTypeIDsNull: no exception raised and RecordTypeId returned ' + rtId);
            System.assert(true);
            System.assertEquals(null, rtId);
        }
        catch (Exception e) {
            System.debug('testgetRecordTypeIDsNull: exception raised' + e.getMessage());
            System.assert(true);
        }
        
        Test.stopTest();
        System.debug('testgetRecordTypeIDsNull: END');
    }

/***
* @description Tests the "getListViewIDs" method.
***/
    static TestMethod void testgetListViewIDs() {
        System.debug('getListViewIDs: START'); 
        Test.startTest();

        try {
            Map<String,Object> mapLVid = PEG_Configuration_CTL.getListViewIDs(new List<String>{'Account.Tous les comptes'});
            System.debug('getListViewIDs: no exception raised and RecordTypeId returned ' + mapLVid);
            System.assert(true);
            System.assertNotEquals(null, mapLVid);
        }
        catch (Exception e) {
            System.debug('getListViewIDs: exception raised' + e.getMessage());
            System.assert(false);
        }
        
        Test.stopTest();
        System.debug('getListViewIDs: END');
    }

/***
* @description Tests the "getListViewIDs" method. Test for error
***/
    static TestMethod void testgetListViewIDsNull() {
        System.debug('testgetListViewIDsNull: START'); 
        Test.startTest();

        try {
            Map<String,Object> mapLVid = PEG_Configuration_CTL.getListViewIDs(new List<String>());
            System.debug('testgetListViewIDsNull: no exception raised and RecordTypeId returned ' + mapLVid);
            System.assert(true);
            System.assertEquals(null, mapLVid);
        }
        catch (Exception e) {
            System.debug('testgetListViewIDsNull: exception raised' + e.getMessage());
            System.assert(true);
        }
        
        Test.stopTest();
        System.debug('testgetListViewIDsNull: END');
    }

/***
* @description Tests the "getReportIDs" method.
***/
    static TestMethod void testGetReportIDs() {
        System.debug('testGetReportIDs: START'); 
        Test.startTest();

        try {
            Map<String,Object> rptIDs = PEG_Configuration_CTL.getReportIDs(new List<String>{'DummyReportName'});
            System.debug('testGetReportIDs: no exception raised and Report Ids returned ' + rptIDs);
            System.assert(true);
            //System.assertNotEquals(null, rtId);
        }
        catch (Exception e) {
            System.debug('testGetReportIDs: exception raised' + e.getMessage());
            System.assert(false);
        }
        
        try {
            Map<String,Object> rptIDs = PEG_Configuration_CTL.getReportIDs(new List<String>{});
            System.debug('testGetReportIDs: no exception raised and Report Ids returned ' + rptIDs);
            System.assertEquals(null, rptIDs);
        }
        catch (Exception e) {
            System.debug('testGetReportIDs: empty list exception raised' + e.getMessage());
            System.assert(false);
        }
        
        Test.stopTest();
        System.debug('testGetReportIDs: END');
    }
    
    
/***
* @description Tests the "getPicklistDetails" method.
***/
    static TestMethod void testgetPicklistDetails() {
        System.debug('testgetPicklistDetails: START'); 
        Test.startTest();

        try {
            Map<String,Object> picklistMap = PEG_Configuration_CTL.getPicklistDetails(new List<String>{'Opportunity.StageName'});
            System.debug('testgetPicklistDetails: no exception raised and RecordTypeId returned ' + picklistMap);
            System.assert(true);
            System.assertNotEquals(null, picklistMap);
        }
        catch (Exception e) {
            System.debug('testgetPicklistDetails: exception raised' + e.getMessage());
            System.assert(false);
        }
        
        Test.stopTest();
        System.debug('testgetPicklistDetails: END');
    }
}