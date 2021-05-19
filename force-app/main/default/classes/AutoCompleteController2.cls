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
            if(objTyp.getDescribe().isUpdateable() && objTyp.getDescribe().isAccessible() && objTyp.getDescribe().isCreateable() && objTyp.getDescribe().isSearchable() && objTyp.getDescribe().isQueryable()){
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
     
}