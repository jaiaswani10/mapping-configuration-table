import { LightningElement, wire } from 'lwc';
import getMappingConfigurationsHistory from '@salesforce/apex/MappingConfigurationController.getMappingConfigurationsHistory'
import mappingConfigMessageChannel from '@salesforce/messageChannel/MappingConfigMessageChannel__c'
import {subscribe, MessageContext} from 'lightning/messageService'

export default class MappingCofigurationHistory extends LightningElement {
    isLoading = false;
    mapConfigHistories;
    recordId = "";

    subscription = null;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.handleSubscribe();
    }

    handleSubscribe() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(this.messageContext, mappingConfigMessageChannel, (message) => {
            console.log(message);
            this.recordId = message.recordId;
        });
    }

    @wire(getMappingConfigurationsHistory, { 'mapCofigId': '$recordId' })
    wiredMappingConfigs({ error, data }) {
        this.isLoading = true;        
        if (data) {
           console.log(data);
           this.mapConfigHistories = data;
           this.isLoading = false;
        }        
        else if (error) {
            this.mappingConfigurations = undefined;
            this.isLoading = false;
        }
    }
}