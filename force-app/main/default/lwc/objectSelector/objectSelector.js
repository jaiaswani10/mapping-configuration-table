import { LightningElement, wire, api } from 'lwc';
import getObjectNames from '@salesforce/apex/AutoCompleteController.getObjectNames';

export default class ObjectSelector extends LightningElement {     

    @api disabled;
    @api selectedValue;
    @api objectsNeeded;

    objectName;
    dataList;
    value;
    
    @wire(getObjectNames, {'awObjectName': '$objectsNeeded'})
    wiredGetObjectNames({ error, data }) {
        if (data) {
            this.dataList = data;
            this.error = undefined;
        } else if (error) {
            this.handleError(error)
            this.dataList = undefined;
        }
    }

    // connectedCallback() {
    //     getObjectNames(objectsNeeded)
    //         .then(result => {
    //             this.dataList = result;
    //         })
    //         .catch(error => this.handleError(error));
    // }

    
    setValue(event) {        
        this.value = JSON.parse(event.detail);
        if (this.value.value) {
            this.objectName = this.value.value;
        }        
        
        const selectedEvent = new CustomEvent('objectselected', { detail: JSON.stringify(this.value) });
        this.dispatchEvent(selectedEvent);
    }
}