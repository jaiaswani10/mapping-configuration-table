import { LightningElement, track, wire } from 'lwc'
import { createRecord } from 'lightning/uiRecordApi'
import MAPPING_CONFIGURATION from '@salesforce/schema/Mapping_Configuration__c'
import AW_FIELD from '@salesforce/schema/Mapping_Configuration__c.AW_Field__c'
import AW_OBJECT from '@salesforce/schema/Mapping_Configuration__c.AW_Object__c'
import SF_FIELD from '@salesforce/schema/Mapping_Configuration__c.Salesforce_Field__c'
import SF_OBJECT from '@salesforce/schema/Mapping_Configuration__c.Salesforce_Object__c'
import ID_FIELD from '@salesforce/schema/Mapping_Configuration__c.Id'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import getMappingConfigurations from '@salesforce/apex/MappingConfigurationController.getMappingConfigurations'
import getMappingConfigurationsMetadata from '@salesforce/apex/MappingConfigurationController.getMappingConfigurationsMetadata'
import saveMappingConfigurations from '@salesforce/apex/MappingConfigurationController.saveMappingConfigurations'
import { updateRecord } from 'lightning/uiRecordApi'
import { refreshApex } from '@salesforce/apex'
import mappingConfigMessageChannel from '@salesforce/messageChannel/MappingConfigMessageChannel__c'
import {publish, MessageContext} from 'lightning/messageService'



export default class MappingConfiguration extends LightningElement {

    @track mappingConfigurations = [];
    @track cloneMappingConfigurations = [];
    mapConfigMetadata = [];
    // [{
    //     index: "0", Salesforce_Object__c: "",
    //     AW_Object__c: "", AW_Field__c: "",
    //     Salesforce_Field__c: "", Id: "",
    //     showEditButton: false, showSaveButton: true,
    //     disabled: false
    // }];

    mappingConfMetaMap = new Map();

    isLoading = true;
    _pageIndex = 0;
    cofigTablePageNames = ['Profile', 'Employment'];

    hasNextPageAvailable = this._pageIndex < this.cofigTablePageNames.length;
    hasPreviousPageAvailable = false;


    pageName = this.cofigTablePageNames[this._pageIndex];
    cardHeading = this.pageName + " Mapping Configurations";

    enableEditAll = true;

    @wire(MessageContext)
    messageContext;


    @wire(getMappingConfigurations, { 'awObjectName': '$pageName' })
    wiredMappingConfigs({ error, data }) {
        this.isLoading = true;
        console.log(this.pageName);
        console.log(this.cofigTablePageNames[this._pageIndex]);
        console.log(this._pageIndex);
        if (data) {
            this.handleMappingConfigurations(data);
        }
        if ((!data && !error) || data) {
            getMappingConfigurationsMetadata({ 'awObjectName': this.pageName })
                .then(result => {
                    this.mapConfigMetadata = result;
                    this.handleMetadataMappingConfigurations(result);                    
                    this.isLoading = false;
                })
                .catch(error => { console.log(error); this.isLoading = false });
        }
        else if (error) {
            this.mappingConfigurations = undefined;
            this.isLoading = false;
        }
    }

    setValue(event) {
        let index = event.currentTarget.dataset.index;
        let fieldName = event.currentTarget.dataset.fieldName;
        let selectedObjectMeta = JSON.parse(event.detail);

        this.mappingConfigurations[index][fieldName] = selectedObjectMeta.value;

        if (fieldName == 'Salesforce_Object__c') {
            this.mappingConfigurations[index]['Salesforce_Field__c'] = '';
        }
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
        

    resultHandler(mappingConfigRec, mappingConfigurationRecord) {
        mappingConfigurationRecord.Id = mappingConfigRec.Id;
        mappingConfigurationRecord.showEditButton = true;
        mappingConfigurationRecord.showSaveButton = false;
        mappingConfigurationRecord.disabled = true;

        refreshApex(this.mappingConfigurations);
        this.isLoading = false;
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

    handleMappingConfigurations(mappingConfigurationsRes) {
        if (mappingConfigurationsRes) {
            mappingConfigurationsRes.map((mapConf, index) => {
                let { AW_Field__c, AW_Object__c, Salesforce_Field__c, Salesforce_Object__c, Id } = mapConf;
                Salesforce_Field__c = Salesforce_Field__c || ""
                Salesforce_Object__c = Salesforce_Object__c || ""
                let metaConfigWrap;
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

        // this.enableEditAll = this.mappingConfigurations.every(metaConfig => metaConfig.Id);
        this.cloneMappingConfigurations = JSON.parse(JSON.stringify(this.mappingConfigurations));
    }

    nextPage() {
        this._pageIndex += 1;
        if (this.cofigTablePageNames.length > this._pageIndex && this.cofigTablePageNames[this._pageIndex]) {
            this.isLoading = true;
            this.pageName = this.cofigTablePageNames[this._pageIndex];
        }
        this.cardHeading = this.pageName + " Mapping Configurations";
        this.hasNextPageAvailable = this._pageIndex < this.cofigTablePageNames.length - 1;
        this.hasPreviousPageAvailable = this._pageIndex > 0 && this._pageIndex < this.cofigTablePageNames.length;
    }

    previousPage() {
        this._pageIndex -= 1;
        if (this.cofigTablePageNames.length > this._pageIndex && this.cofigTablePageNames[this._pageIndex]) {
            this.isLoading = true;
            this.pageName = this.cofigTablePageNames[this._pageIndex];
        }
        this.cardHeading = this.pageName + " Mapping Configurations";
        this.hasNextPageAvailable = this._pageIndex < this.cofigTablePageNames.length - 1;
        this.hasPreviousPageAvailable = this._pageIndex > 0 && this._pageIndex < this.cofigTablePageNames.length;
    }

    errorHandler(error, context) {
        this.isLoading = false;
        context.dispatchEvent(
            new ShowToastEvent({
                title: 'Error creating record',
                message: error.body.message,
                variant: 'error',
            }),
        );
    }

    saveMapping(event) {
        this.isLoading = true;
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

    editMapping(event) {
        let index = event.currentTarget.dataset.index;
        let mappingConfigurationRecord = this.mappingConfigurations[index];
        mappingConfigurationRecord.showEditButton = false;
        mappingConfigurationRecord.showSaveButton = true;
        mappingConfigurationRecord.disabled = false;
    }

    selectRow(event) {
        const recordId = event.currentTarget.dataset.recordId;
        let res = publish(this.messageContext, mappingConfigMessageChannel, {recordId});        
    }
}