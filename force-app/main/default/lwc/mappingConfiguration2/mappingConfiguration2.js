import { LightningElement, track } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import MAPPING_CONFIGURATION from '@salesforce/schema/Mapping_Configuration__c';
import AW_FIELD from '@salesforce/schema/Mapping_Configuration__c.AW_Field__c';
import AW_OBJECT from '@salesforce/schema/Mapping_Configuration__c.AW_Object__c';
import SF_FIELD from '@salesforce/schema/Mapping_Configuration__c.Salesforce_Field__c';
import SF_OBJECT from '@salesforce/schema/Mapping_Configuration__c.Salesforce_Object__c';
import ID_FIELD from '@salesforce/schema/Mapping_Configuration__c.Id';  
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getMappingConfigurations from '@salesforce/apex/MappingConfigurationController2.getMappingConfigurations';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

export default class MappingConfiguration extends LightningElement {
    
    @track mappingConfigurations = [
        {
            index: "0", Salesforce_Object__c: "",
             AW_Object__c: "", AW_Field__c: "", 
             Salesforce_Field__c: "", Id:"",
             showEditButton: false, showSaveButton: true, 
             disabled: false}];
    
    connectedCallback() {
        getMappingConfigurations()
            .then((result) => {                        
                this.mappingConfigurations = [];
                this.mappingConfigurations = result.map((mapConf, index) => {
                    let {AW_Field__c, AW_Object__c, Salesforce_Field__c, Salesforce_Object__c, Id} = mapConf;
                    let sno = index + 1;
                    return  {
                            Id, 
                            index : index,
                            AW_Field__c, 
                            AW_Object__c, 
                            Salesforce_Field__c, 
                            Salesforce_Object__c, 
                            showEditButton: true, 
                            showSaveButton: false, 
                            disabled: true,
                            sno                  
                        };                       
                        
                });
                //console.log(this.mappingConfigurations);
            })
            .catch(error => console.log(error));
    }


    
    setValue(event) {
        console.log('setValue', event.detail);

        let index = event.currentTarget.dataset.index;
        let fieldName =  event.currentTarget.dataset.fieldName;
        let selectedObjectMeta = JSON.parse(event.detail);
                                
        this.mappingConfigurations[index][fieldName] = selectedObjectMeta.value;    
        
        if(fieldName == 'Salesforce_Object__c') {
            this.mappingConfigurations[index]['Salesforce_Field__c'] = '';
        }

        console.log("this.mappingConfigurations[index][fieldName]: ", fieldName, this.mappingConfigurations[index][fieldName]);   
    }

    editMapping(event) {
        let index = event.currentTarget.dataset.index;
        let mappingConfigurationRecord = this.mappingConfigurations[index];
        mappingConfigurationRecord.showEditButton = false;
        mappingConfigurationRecord.showSaveButton = true;
        mappingConfigurationRecord.disabled = false;

    }

    saveMapping(event) {
        let index = event.currentTarget.dataset.index;

        let mappingConfigurationRecord = this.mappingConfigurations[index];
        
        const fields = {};
        
        fields[AW_OBJECT.fieldApiName] = mappingConfigurationRecord.AW_Object__c;
        fields[SF_FIELD.fieldApiName] = mappingConfigurationRecord.Salesforce_Field__c;
        fields[SF_OBJECT.fieldApiName] = mappingConfigurationRecord.Salesforce_Object__c;
        fields[AW_FIELD.fieldApiName] = mappingConfigurationRecord.AW_Field__c;
       
        if(mappingConfigurationRecord.Id) {
            fields[ID_FIELD.fieldApiName] = mappingConfigurationRecord.Id;            
        }

        let recordInput;

        if(mappingConfigurationRecord.Id) {
            recordInput = { fields };
            updateRecord(recordInput)
            .then(mappingConfigRec => this.resultHandler(mappingConfigRec, mappingConfigurationRecord))              
            .catch(error => this.errorHandler(error, this));
        }
        else {
            recordInput = { apiName: MAPPING_CONFIGURATION.objectApiName, fields };
            createRecord(recordInput)
            .then(mappingConfigRec => this.resultHandler(mappingConfigRec, mappingConfigurationRecord))           
            .catch(error => this.errorHandler(error, this));
        }        
    }

    errorHandler(error, context) {
        context.dispatchEvent(
            new ShowToastEvent({
                title: 'Error creating record',
                message: error.body.message,
                variant: 'error',
            }),
        );
    }

    resultHandler(mappingConfigRec, mappingConfigurationRecord) {
        mappingConfigurationRecord.Id = mappingConfigRec.Id;
        mappingConfigurationRecord.showEditButton = true;
        mappingConfigurationRecord.showSaveButton = false;
        mappingConfigurationRecord.disabled = true;

        refreshApex(this.mappingConfigurations);
       
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Mapping Configuration Created/Updated',
                variant: 'success',
            }),
        );
    }

    setFieldValue(event) {
        let index = event.currentTarget.dataset.index;
        let fieldName =  event.currentTarget.dataset.fieldName;
        let value =  event.currentTarget.value;
        this.mappingConfigurations[index][fieldName] = value;        
    }
}