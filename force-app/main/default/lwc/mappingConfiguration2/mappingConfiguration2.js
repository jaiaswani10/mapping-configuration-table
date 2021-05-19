import { LightningElement, track, wire } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import MAPPING_CONFIGURATION from '@salesforce/schema/Mapping_Configuration__c';
import AW_FIELD from '@salesforce/schema/Mapping_Configuration__c.AW_Field__c';
import AW_OBJECT from '@salesforce/schema/Mapping_Configuration__c.AW_Object__c';
import SF_FIELD from '@salesforce/schema/Mapping_Configuration__c.Salesforce_Field__c';
import SF_OBJECT from '@salesforce/schema/Mapping_Configuration__c.Salesforce_Object__c';
import ID_FIELD from '@salesforce/schema/Mapping_Configuration__c.Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getMappingConfigurations from '@salesforce/apex/MappingConfigurationController2.getMappingConfigurations';
import saveMappingConfigurations from '@salesforce/apex/MappingConfigurationController2.saveMappingConfigurations';
import getMappingConfigurationsMetadata from '@salesforce/apex/MappingConfigurationController2.getMappingConfigurationsMetadata';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

export default class MappingConfiguration extends LightningElement {

    @track mappingConfigurations = [
        // {
        //     index: "0", Salesforce_Object__c: "",
        //     AW_Object__c: "", AW_Field__c: "",
        //     Salesforce_Field__c: "", Id: "",
        //     showEditButton: false, showSaveButton: true,
        //     disabled: false
        // }
    ];

    mappingConfMetaMap = new Map();
    mapConfigMetadata = [];
    isLoading = true;
    @track cloneMappingConfigurations = [];


    @wire(getMappingConfigurations)
    wiredMappingConfigs({ error, data }) {
        this.isLoading = true;
        if (data) {
            this.handleMappingConfigurations(data);
        }
        if ((!data && !error) || data) {
            getMappingConfigurationsMetadata()
                .then(result => { this.mapConfigMetadata = result; this.handleMetadataMappingConfigurations(result); this.isLoading = false; })
                .catch(error => { console.log(error); this.isLoading = false });
        }
        else if (error) {
            this.mappingConfigurations = undefined;
            this.isLoading = false;
        }
    }

    handleMappingConfigurations(mappingConfigurationsRes) {
        if (mappingConfigurationsRes) {
            mappingConfigurationsRes.map((mapConf, index) => {
                let { AW_Field__c, AW_Object__c, Salesforce_Field__c, Salesforce_Object__c, Id } = mapConf;
                let metaConfigWrap;
                Salesforce_Field__c = Salesforce_Field__c || ""
                Salesforce_Object__c = Salesforce_Object__c || ""
                metaConfigWrap = {
                    Id,
                    index,
                    AW_Field__c,
                    AW_Object__c,
                    Salesforce_Field__c,
                    Salesforce_Object__c,
                    showEditButton: true,
                    showSaveButton: false,
                    disabled: true
                };

                this.mappingConfMetaMap.set(AW_Object__c + AW_Field__c, metaConfigWrap);
                return metaConfigWrap;
            })
        }

        console.log(this.mappingConfMetaMap);
    }

    handleMetadataMappingConfigurations(mappingConfigurationsRes) {

        this.mappingConfigurations = mappingConfigurationsRes.map((mapConf, index) => {
            let { AW_Field__c, AW_Object__c } = mapConf;
            let mapConfMeta;

            if (this.mappingConfMetaMap.has(AW_Object__c + AW_Field__c)) {
                mapConfMeta = this.mappingConfMetaMap.get(AW_Object__c + AW_Field__c)
            }
            else {
                mapConfMeta = {
                    id: '',
                    AW_Field__c,
                    AW_Object__c,
                    Salesforce_Field__c: '',
                    Salesforce_Object__c: '',
                    showEditButton: false,
                    showSaveButton: true,
                    disabled: false,
                };
            }
            mapConfMeta.index = index;
            mapConfMeta.sno = index + 1;
            return mapConfMeta;
        });
        this.cloneMappingConfigurations = JSON.parse(JSON.stringify(this.mappingConfigurations));
    }

    setValue(event) {
        console.log('setValue', event.detail);

        let index = event.currentTarget.dataset.index;
        let fieldName = event.currentTarget.dataset.fieldName;
        let selectedObjectMeta = JSON.parse(event.detail);

        this.mappingConfigurations[index][fieldName] = selectedObjectMeta.value;

        if (fieldName == 'Salesforce_Object__c') {
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

        if (mappingConfigurationRecord.Id) {
            fields[ID_FIELD.fieldApiName] = mappingConfigurationRecord.Id;
        }

        let recordInput;

        if (mappingConfigurationRecord.Id) {
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
        let fieldName = event.currentTarget.dataset.fieldName;
        let value = event.currentTarget.value;
        this.mappingConfigurations[index][fieldName] = value;
    }

    editAll() {
        this.mappingConfigurations.forEach(mapConf => {
            if(mapConf.disabled) {
                mapConf.disabled = false;
            }
        })
    }

    
    saveAll() {        
        const mappingConfigsRecords = [];
        this.mappingConfigurations.filter((mapConfig, index) => {
            const oldMapConf = this.cloneMappingConfigurations[index];
            const keysToCheck = ['Id', 'Salesforce_Object__c', 'Salesforce_Field__c'];

            let rowChanged = false;
            for(const nodeKey of keysToCheck) {
                if(oldMapConf[nodeKey] !== mapConfig[nodeKey]){
                    rowChanged = true;
                    break;
                }
            }

            if (rowChanged) {
                const { AW_Field__c, AW_Object__c, Salesforce_Field__c, Salesforce_Object__c } = mapConfig
                const mapConfRec = { AW_Field__c, AW_Object__c, Salesforce_Field__c, Salesforce_Object__c };
                if (mapConfig.Id) {
                    mapConfRec.Id = mapConfig.Id;
                }
                mappingConfigsRecords.push(mapConfRec);
                return mapConfRec;
            }
        })
        console.log(mappingConfigsRecords);
        if (mappingConfigsRecords.length > 0) {
            this.isLoading = true;
            saveMappingConfigurations({ 'mappingConfigurations': mappingConfigsRecords })
                .then(result => {
                    console.log(result);
                    this.handleMappingConfigurations(result);
                    this.handleMetadataMappingConfigurations(this.mapConfigMetadata);
                    this.isLoading = false;
                    this.showToast('Success', 'Mapping Configuration Created/Updated', 'success');

                }).catch(error => { console.log(error); this.isLoading = false });
        }
        else {
            this.showToast('No Updates', 'No mapping changes', 'warning');
        }

    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            })
        );
    }
}