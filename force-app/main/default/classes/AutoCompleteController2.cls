public with sharing class AutoCompleteController2 {    
    @AuraEnabled (cacheable=true)
    public static List<ObjectWrapper> getObjectNames() {
        Map<String, List<String>> awObjectMapping = new Map<String, List<String>>();
              
        awObjectMapping = new Map<String ,List<String>> {
            'profile' => new List<String>{'Account', 'Contact', 'PersonAccount'},
            'employment' => new List<String>{'Account', 'Custom', 'childsOfAccount'}
        };

        List<ObjectWrapper> listOfObjects = new List<ObjectWrapper>();
        Integer uniqueKeyGen = 1;
        //List<String> objectsNeeded = awObjectMapping.get(awObjectName.toLowerCase());
        
        for(Schema.SObjectType objTyp : Schema.getGlobalDescribe().Values()){
            if(supportedObjects.contains(objTyp.getDescribe().getName()) && objTyp.getDescribe().isUpdateable() && objTyp.getDescribe().isAccessible() && objTyp.getDescribe().isCreateable() && objTyp.getDescribe().isSearchable() && objTyp.getDescribe().isQueryable()){
                listOfObjects.add(new ObjectWrapper(objTyp.getDescribe().getName(),objTyp.getDescribe().getLabel(),uniqueKeyGen));
                uniqueKeyGen++; 
            }
            if(uniqueKeyGen > 5) {
              //break;
            }
        } 
        
        listOfObjects.sort();
        System.debug(listOfObjects);
        return listOfObjects;
    }
    
    public class ObjectWrapper implements Comparable {
        @AuraEnabled public string value;
        @AuraEnabled public string label;   
        @AuraEnabled public integer uniqueid;        

        public ObjectWrapper(String value, String label, integer uniqueid) {
            this.value = value;
            this.label = label;   
            this.uniqueid = uniqueid;          
        }                  
        public  Integer compareTo(Object objToCompare) {
            return label.compareTo(((ObjectWrapper)objToCompare).label); 
        } 
    }
    
    private static List<String> supportedObjects = new List<String>{'Account', 'AccountContactRelation', 'AccountForecast', 'AccountProductForecast',
    'AccountProductPeriodForecast', 'AccountPartner', 'AccountTeamMember', 'ActionCadence', 'ActionPlanItem',
    'AssessmentTask', 'AssessmentTaskOrder', 'Asset', 'AssetRelationship', 'AssignedResource', 'AttachedContentNote',
    'BasicDataRecord', 'BusinessAccount', 'BusinessMilestone', 'BusinessProfile', 'Campaign', 'CampaignMember',
    'CareBarrier', 'CareBarrierType', 'CareProgram', 'CareProgramEnrollee', 'Case', 'Claim', 'ClaimCase',
    'ClaimItem', 'ClaimParticipant', 'Contact', 'ContactRequest', 'ContentDocument',
    'ContentNote', 'ContentVersion', 'ContentWorkspace', 'Contract', 'ContractContactRole',
    'ContractLineItem', 'CoverageType', 'CustomerProperty', 'DataExportDefinition',
    'DataStreamDefinition', 'DeleteEvent', 'DigitalSignature', 'ElectronicMediaGroup', 'Entitlement',
    'EntityArchivingSetup', 'EnvironmentHubMember', 'Image', 'InsuranceClaimAsset', 'InsurancePolicy',
    'InsurancePolicyAsset', 'InsurancePolicyCoverage', 'InsurancePolicyMemberAsset', 'InsurancePolicyParticipant',
    'InsuranceProfile', 'JobProfile', 'KnowledgeArticleVersion', 'Lead', 'LicensingRequest', 'LoanApplicant',
    'LoanApplicationLiability', 'LoyaltyProgramCurrency', 'LoyaltyProgramMember', 'LoyaltyProgramPartner', 'LoyaltyTier',
    'LoyaltyTierGroup', 'MaintenanceAsset', 'MaintenancePlan', 'MarketingAction', 'MarketingResource', 'Note',
    'OperatingHours', 'Opportunity', 'OpportunityLineItem', 'OpportunityLineItemSchedule', 'OpportunityPartner',
    'OpportunityTeamMember', 'Order', 'OrderItem', 'OrderItemSummaryChange', 'OrderSummary', 'OrgMetric',
    'OrgMetricScanSummary', 'OrgMetricScanResult', 'Partner', 'PersonLifeEvent',
    'PriceAdjustmentSchedule', 'Pricebook2', 'PricebookEntry', 'Producer', 'ProducerPolicyAssignment',
    'Product2', 'Product2DataTranslation', 'ProductCategoryDataTranslation', 'ProductCoverage', 'ProductMedia',
    'Quote', 'QuoteDocument', 'QuoteLineItem', 'RecordType', 'ResourceAbsence', 'ResourcePreference',
    'RetailVisitKpi', 'RetailVisitWorkTask', 'RetailVisitWorkTaskOrder', 'SalesAgreement', 'SalesAgreementProduct',
    'SecuritiesHolding', 'ServiceAppointment', 'ServiceContract', 'ServiceCrew', 'ServiceCrewMember',
    'ServiceResource', 'ServiceResourceCapacity', 'ServiceResourceSkill', 'ServiceTerritory',
    'ServiceTerritoryLocation', 'ServiceTerritoryMember', 'Shift', 'Shipment', 'SkillRequirement',
    'SocialPost', 'SurveyInvitation', 'SurveyResponse', 'SurveySubject', 'Tenant', 'TimeSheet',
    'TimeSheetEntry', 'TimeSlot', 'UsageEntitlement', 'UsageEntitlementPeriod', 'User', 'Visit',
    'WebStoreSearchProdSettings', 'WorkerCompCoverageClass', 'WorkOrder', 'WorkOrderLineItem', 'WorkType'};
     
}