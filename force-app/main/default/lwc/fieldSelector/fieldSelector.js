import { LightningElement, api, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';


export default class FieldSelectorr extends LightningElement {
    @api disabled;
    @api selectedValue;
    @api selectedObject;

    objectName;
    dataList;
    value;
            
    
    setValue(event) {        
        this.value = JSON.parse(event.detail);
        if (this.value.value) {
            this.objectName = this.value.value;
        }        
        
        const selectedEvent = new CustomEvent('fieldselected', { detail: JSON.stringify(this.value) });
        this.dispatchEvent(selectedEvent);
    }

    @wire(getObjectInfo, { objectApiName: '$selectedObject' })
    objectInfo({ error, data }) {
        if (data) {            
            // console.log('@wire called: Object Info', data);
            let {fields} = data; //new Object(data.fields);
            let fieldsModelList = [];
            
            let uniqueKey = 1;
            for (let fieldName in fields) {                
                let fieldInfo = fields[fieldName];

                if(fieldInfo.updateable == true){
                    let {label, apiName, dataType, referenceToInfos, relationshipName, updateable} = fieldInfo;
                        
                    let fieldObj = {label, value: apiName, dataType, referenceToInfos, relationshipName, updateable, 
                        isReference : fieldInfo['dataType'] == 'Reference' ? true : false, 
                        uniqueid: uniqueKey
                    }                        
                    fieldsModelList.push(fieldObj);     
                    uniqueKey += 1;      
                }                                                               
            }       
            // console.log(fieldsModelList);     
            this.dataList = fieldsModelList;
            
        }    
        else if (error) {                 
            this.dataList = undefined;
        }
    }
}