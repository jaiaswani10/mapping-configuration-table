public with sharing class AutoCompleteController {    
    @AuraEnabled (cacheable=true)
    public static List<ObjectWrapper> getObjectNames(String awObjectName) {
        Map<String, List<String>> awObjectMapping = new Map<String, List<String>>();
              
        awObjectMapping = new Map<String ,List<String>> {
            'profile' => new List<String>{'Account', 'Contact', 'Person Account'},
            'employment' => new List<String>{'Account', '__c', 'childsOfAccount'}
        };

        List<ObjectWrapper> listOfObjects = new List<ObjectWrapper>();
        Integer uniqueKeyGen = 1;
        List<String> objectsNeeded = awObjectMapping.get(awObjectName.toLowerCase());
        
        for(Schema.SObjectType objTyp : Schema.getGlobalDescribe().Values()){
            if(objTyp.getDescribe().getName().contains('__c')){// && objTyp.getDescribe().isUpdateable() && objTyp.getDescribe().isAccessible() && objTyp.getDescribe().isCreateable() && objTyp.getDescribe().isSearchable() && objTyp.getDescribe().isQueryable()){
                System.debug(objTyp.getDescribe().getName());
                listOfObjects.add(new ObjectWrapper(objTyp.getDescribe().getName(),objTyp.getDescribe().getLabel(), uniqueKeyGen));
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
}