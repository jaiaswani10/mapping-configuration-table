public with sharing class MappingConfigurationController2 {    
    @AuraEnabled (cacheable=true)
        public static List<Mapping_Configuration__c> getMappingConfigurations() {                            
            List<Mapping_Configuration__c> mappingConfigurations = new List<Mapping_Configuration__c>();            
            mappingConfigurations = [SELECT Id, Name, AW_Field__c, AW_Object__c, Salesforce_Field__c, Salesforce_Object__c FROM Mapping_Configuration__c];                               
            System.debug(mappingConfigurations);
            return mappingConfigurations;
        }   
        
        @AuraEnabled (cacheable=true)
        public static List<AW_Metadata__mdt> getMappingConfigurationsMetadata() {                    
            List<AW_Metadata__mdt> mappingConfigurations = new List<AW_Metadata__mdt>();            
            mappingConfigurations = [SELECT Serial_Number__c, AW_Field__c, AW_Object__c FROM AW_Metadata__mdt ORDER BY Serial_Number__c NULLS LAST];                                  
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
}