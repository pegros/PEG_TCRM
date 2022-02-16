---
# PEG TCRM Components
---

## Introduction

The **PEG_TCRM** package basically provides a single configurable Aura Lightning component (**PEG_AnalyticsMassAction_CMP**) enabling to leverage any Tableau CRM Dashboard to trigger
a mass creation of records in the Salesforce "core" platform. 

It provides an alternative to the Tableau CRM mass actions requiring a VF page to implement
the logic, providing 2 main benefits:
* remain within the current browser tab / console application (e.g. stay in the current
campaign record page)
* easily contextualise the action to the current record/user (e.g. add members to the campaign
record being currently displayed)

Such an approach enables to replace possibly complex/slow query/filter Lightning components
by scalable Tableau CRM dashboards to trigger mass operations on Salesforce core data.
Real-life examples include:
* Contact / Lead targeting for campaigns

![Campaign Example!](/media/massActionExampleCampaign.png)

* Account owner change / portfolio reassignment

![Portfolio Example!](/media/massActionExamplePortfolio.png)

It basically provides a single mass Action button which becomes active once the component has been completely initialized (all Dashboard metadata fetched and processed).
When clicking on this action, the component executes the following operations:
* target record IDs fetch via **SAQL** based on the current dashboard filtering state 
* target ID list filtering via a **SOQL** query to remove any already proccessed ones
* user operation confirmation (with possible entry of additional data to be replicated
on all records to be created)
* mass insert of records in Salesforce core database

![User Confirmation Popup!](/media/massActionExamplePopup.png)


The component heavily relies on the standard [wave:dashboard](https://developer.salesforce.com/docs/component-library/bundle/wave:waveDashboard/documentation) and [wave:sdk](https://developer.salesforce.com/docs/component-library/bundle/wave:sdk/example) components to respectively
display a Tableau CRM Dashboard (and retrieve its filter state) and fetch its metadata (datasets used, filters available, connections set).

The component works by rebuilding a SAQL query out of the dashboard metadata and its current filter
state (it is indeed not accessible/provided as in the standard VF page mass action approach).
Therefore, only relatively simple Tableau CRM dashboards may be used (but it is often enough),
the following features being currently not supported:
* bindings
* SAQL steps

Also, the standard _max 10 000 rows_ **SAQL** limit apply to target records in Tableau CRM,
but batch/pagination size may be set in the component to avoid governor limits / timeouts
when executing the mass action on Salesforce core side.


## Package Content

**PEG_AnalyticsMassAction_CMP** is the main Lightning Aura component of the package.

It however leverages various features provided by the following element (inherited from a former
Aura based PEG Lightning Components package):
* 4 Lightning Aura components
    * **PEG_Merge_CMP** to fetch and merge contextual data into configuration
    (SAQL targeting and SOQL control queries)
    * **PEG_Message_CMP** to display information/error messages
    * **PEG_SOQL_CMP** to execute SOQL queries and insert DML operations
    * **PEG_ContextLoader_CMP**, as an optional add-on to load various metadata
    into the context (e.g. Record Type IDs)
* 2 Apex Controllers (+ related test classes)
    * **PEG_SoqlOperation_CTL** to execute SOQL queries and insert DML operations
    (for the **PEG_SOQL_CMP** component)
    * **PEG_Configuration_CTL** to fetch various metadata (for the **PEG_ContextLoader_CMP**
    component)
* 1 Custom Metadata (and related records)
    * **PEG_Query__mdt** : to define SOQL queries bypassing FLS / Sharing (if needed)
* Various custom labels (used in the **PEG_AnalyticsMassAction_CMP** component)


## Installation

To retrieve the SFDX project, you may simply execute a git clone from the GitHub repository.
> git clone git@github.com:pegros/PEG_TCRM.git

Via SFDX you may then deploy it on you Org
> sfdx force:source:deploy  -w 10 --verbose -p force-app -u <yourOrgAlias>


## Configuration

All Aura components include extensive documentation in their standard _auradoc_ files which
may be accessed in the **Aura>c** filter of the component library on any sandbox where the
package is deployed (via the `/docs/component-library/overview/components` relative URL).

Most of not all of the configuration happens in the App Builder. The main properties are:
* `Dashboard Name` containing the API Name of the Tableau CRM Dashboard to be used
* `Dataset Name` identifying the dataset to be used for the SAQL targeting query
(within the possible N connected ones used by the Dashboard) 
* `ID Field Name` identifying the field in this dataset to be used as target IDs
* `Use Group by?` (optional) to implement a group by SAQL query if multiple entries may
have the same target ID in the dataset (and reduce the impact of the max. 10 000 rows constraint)
* `SOQL Control Query` providing the SOQL query template to be used to filter out already
existing records (returning target record IDs with an `in {{{ROWS}}}` where clause evaluated
upon action) 
* `Target Record Template` containing a JSON object record template which will be replicated
for each target record to be inserted (with at least the `sobjectType` property set)
* `Target Lookup Field` indicating the API Name of the ID field to be retrieved in the SOQL control query
and applied on the target records.
* `Action Input Fields` providing an optional set of field API names to display a form
in the action confirmation popup, the values of which being replicated on all target records.
* `Batch Size` setting a max. number of rows per `insert` operation, the component iterating
untill all target records have been inserted. 

![App Builder Configuration!](/media/massActionConfiguration.png)

*Note*:
* for the `SOQL Control Query` and the `Target Record Template` properties, all **merge** tokens
supported by the ***PEG_Merge_CMP*** component may be used (e.g. `{{{recordId}}}` or `{{{userId}}}`).
* for some tokens (e.g. Record Type IDs), the **PEG_Context_CMP** needs to be initialized via the
**PEG_ContextLoader_CMP** in the utility bar.


For the above example (to add Contacts as members to a campaign), the following properties should be set as follows:
* `SOQL Control Query` (to fetch all Contact IDs already presente as members of the current campaign)
```
SELECT ContactId FROM CampaignMember WHERE CampaignId = '{{{recordId}}}' and LeadOrContactId in {{{ROWS}}}  WITH SECURITY_ENFORCED
```
* `Target Record Template` (to initialize new members for the current campaign)
```
{"sobjectType": "CampaignMember","CampaignId" :"{{{recordId}}}" }
```
* `Target Lookup Field` (to clearly set the member ID as Contacts)
```
ContactId
```
* `Action Input Fields` (to ask the user for a member status upon confirmation)
```
[{"name":"Status","required":"true"}]
```

For the Dashboard filter, the following example enables to filter identified 
Campaign targets based on a sub-campaign record dedicated to a specific agency:
```
{"datasets":{"Targets":[
    {"fields":["CampaignId"],"filter":{"operator":"in","values":["{{{Object.ParentId}}}"]},"locked":true,"hidden":true},
    {"fields":["AgencyId"],"filter":{"operator":"in","values":["{{{Object.Agency__c}}}"]},"locked":true,"hidden":true}
]}}
```