/***
* @description Test class for the PEG_SoqlOperation_CTL class.
* @author      P-E GROS
* @date        Nov. 2019
* @see         PEG_SoqlOperation_CTL
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
private class PEG_SoqlOperation_CTL_TST {
    
/***
* @description Test Method for executeQuery
* @see executeQuery
***/
        
    @isTest
    static void testExecuteQuery () {
        String testQuery = 'select Id,Name from Account WITH SECURITY_ENFORCED';
        
        system.debug('testExecuteQuery: standard execution');
        List<sObject> sobjList = PEG_SoqlOperation_CTL.executeQuery(testQuery,false,false,'');
        System.assertEquals(0,sobjList.size());
        system.debug('testExecuteQuery: standard execution OK');

        system.debug('testExecuteQuery: storable execution');
        sobjList = PEG_SoqlOperation_CTL.executeQueryStorable(testQuery,false,false,'');
        System.assertEquals(0,sobjList.size());
        system.debug('testExecuteQuery: storable execution OK');
        
        system.debug('testExecuteQuery: execution with missing SECURITY_ENFORCED');
        testQuery = 'SELECT Id,Name FROM Account';
        try {
            sobjList = PEG_SoqlOperation_CTL.executeQuery(testQuery,false,false,'');
            System.assert(false);
        } catch (Exception error) {
            //OK
            System.assert(true);
        }
        system.debug('testExecuteQuery: execution with missing SECURITY_ENFORCED OK');
        
        system.debug('testExecuteQuery: execution with bypass and missing queryType');
        try {
            sobjList = PEG_SoqlOperation_CTL.executeQuery(testQuery,true,false,'');
            System.assert(false);
        } catch (Exception error) {
            //OK
            System.assert(true);
        }
        system.debug('testExecuteQuery: execution with bypass and missing queryType OK');
        

        testQuery = 'select Name from Account LIMIT 0';
        system.debug('testExecuteQuery: execution with authorized FLS bypass');
        sobjList = PEG_SoqlOperation_CTL.executeQueryStorable(testQuery,true,false,'TEST_OK');
        System.assertEquals(0,sobjList.size());
        system.debug('testExecuteQuery: execution with authorized FLS bypass OK');
        
        
        system.debug('testExecuteQuery: execution with authorized Sharing bypass');
        sobjList = PEG_SoqlOperation_CTL.executeQueryStorable(testQuery,true,true,'TEST_OK');
        System.assertEquals(0,sobjList.size());
        system.debug('testExecuteQuery: execution with authorized Sharing bypass OK');
       
        system.debug('testExecuteQuery: execution with unauthorized FLS bypass');
        try {
            sobjList = PEG_SoqlOperation_CTL.executeQuery(testQuery,true,true,'TEST_Sharing_OK');
            System.assert(false);
        } catch (Exception error) {
            System.assert(true);
            //OK
        }
        system.debug('testExecuteQuery: execution with unauthorized FLS OK');
        
        system.debug('testExecuteQuery: execution with unauthorized Sharing bypass');
        try {
            sobjList = PEG_SoqlOperation_CTL.executeQuery(testQuery,true,true,'TEST_FLS_OK');
            System.assert(false);
        } catch (Exception error) {
            System.assert(true);
            //OK
        }
        system.debug('testExecuteQuery: execution with unauthorized Sharing OK');
        
        system.debug('testExecuteQuery: execution with wrong query Type');
        try {
            sobjList = PEG_SoqlOperation_CTL.executeQuery(testQuery,true,true,'AZERTYUIOPQSDFGHJKLM');
            System.assert(false);
        } catch (Exception error) {
            System.assert(true);
            //OK
        }
        system.debug('testExecuteQuery: execution with wrong query Type OK');
        
        system.debug('testExecuteQuery: execution with non matching regexp');
        testQuery = 'select Name from Account';
        try {
            sobjList = PEG_SoqlOperation_CTL.executeQuery(testQuery,true,true,'TEST_OK');
            System.assert(false);
        } catch (Exception error) {
            System.assert(true);
            //OK
        }
        system.debug('testExecuteQuery: execution with non matching regexp OK');
    }
    
/***
* @description Test Method for executeQuery
* @see executeDML
***/
    
    @isTest
    static void testExecuteDML () {
       
        List<SObject> testList = new List<SObject>();
         
        ID userId = UserInfo.getUserId();
        system.debug('testExecuteDML : userId fetched ' + userId);
        
        FeedItem newFeed = new FeedItem();
        newFeed.type = 'TextPost';
        newFeed.IsRichText = true;
        newFeed.parentId = userId;
        newFeed.body = '<p>Test Content</p>';
        system.debug('testExecuteDML : newFeed init ' + newFeed);
        testList.add(newFeed);

        List<sObject> testList2 = PEG_SoqlOperation_CTL.executeDML(testList,'insert');
        System.assertEquals(1,testList2.size());        
        system.debug('testExecuteDML : newFeed created ' + testList2);
        
        ((FeedItem)(testList2[0])).body = '<p>Test Content 2</p>';
        testList = PEG_SoqlOperation_CTL.executeDML(testList2,'update');
        System.assertEquals(1,testList.size());
        system.debug('testExecuteDML : newFeed updated ' + testList);
        
        /*
        ((FeedItem)(testList[0])).body = '<p>Test Content 3</p>';
        testList2 = PEG_SoqlOperation_CTL.executeDML(testList,'upsert');
        System.assertEquals(1,testList2.size());
        system.debug('testExecuteDML : newFeed upserted ' + testList2);
        */
        
        testList = PEG_SoqlOperation_CTL.executeDML(testList2,'delete');
        System.assertEquals(1,testList.size());
        system.debug('testExecuteDML : newFeed deleted ' + testList);
        
        /*
        testList = PEG_SoqlOperation_CTL.executeDML(testList2,'undelete');
        System.assertEquals(1,testList.size());
        system.debug('testExecuteDML : newFeed undeleted ' + testList);
        */
        try {
            testList = PEG_SoqlOperation_CTL.executeDML(testList2,'dummy');
            System.assert(false);
        } catch (Exception error) {
            System.assert(true);
            //OK
        }
    }
}