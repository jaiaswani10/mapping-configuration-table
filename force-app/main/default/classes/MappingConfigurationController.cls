public with sharing class MappingConfigurationController {    
    @AuraEnabled (cacheable=true)
        public static List<Mapping_Configuration__c> getMappingConfigurations(String awObjectName) {              
            awObjectName = awObjectName.toLowerCase(); 
            System.debug(awObjectName);     
            List<Mapping_Configuration__c> mappingConfigurations = new List<Mapping_Configuration__c>();            
            mappingConfigurations = [SELECT Id, Name, AW_Field__c, AW_Object__c, Salesforce_Field__c, Salesforce_Object__c FROM Mapping_Configuration__c  WHERE AW_Object__c = :awObjectName];  
            System.debug(mappingConfigurations);
            return mappingConfigurations;
        }   
        
        @AuraEnabled (cacheable=true)
        public static List<AW_Metadata__mdt> getMappingConfigurationsMetadata(String awObjectName) {        
            awObjectName = awObjectName.toLowerCase();      
            System.debug(awObjectName);
            List<AW_Metadata__mdt> mappingConfigurations = new List<AW_Metadata__mdt>();            
            mappingConfigurations = [SELECT Serial_Number__c, AW_Field__c, AW_Object__c FROM AW_Metadata__mdt WHERE AW_Object__c = :awObjectName  ORDER BY Serial_Number__c NULLS LAST];  
            System.debug(mappingConfigurations);
            return mappingConfigurations;
        }

        @AuraEnabled
        public static List<Mapping_Configuration__c> saveMappingConfigurations(List<Mapping_Configuration__c> mappingConfigurations) {
            try {
                UPSERT mappingConfigurations;
                return mappingConfigurations;
            }
            catch(Exception e) {
                throw new AuraHandledException(e.getMessage());
            }            
        }

        @AuraEnabled (cacheable=true)
        public static List<Mapping_Configuration__History> getMappingConfigurationsHistory(String mapCofigId) {                    
            List<Mapping_Configuration__History> mappingConfigurationHistories = new List<Mapping_Configuration__History>();            
            mappingConfigurationHistories = [SELECT Id, ParentId, CreatedById, CreatedBy.Name, FORMAT(CreatedDate), Field, DataType, OldValue, NewValue FROM Mapping_Configuration__History WHERE ParentId = :mapCofigId ORDER BY CreatedDate DESC];  
            System.debug(mappingConfigurationHistories);
            return mappingConfigurationHistories;
        }
}
