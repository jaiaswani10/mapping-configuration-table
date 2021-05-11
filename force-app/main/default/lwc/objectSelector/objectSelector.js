import { LightningElement, api } from 'lwc';
import getObjectNames from '@salesforce/apex/AutoCompleteController.getObjectNames';

export default class ObjectSelector extends LightningElement {        
    @api disabled;
    @api selectedValue;

    objectName;
    dataList;
    value;
    
    

    connectedCallback() {
        getObjectNames()
            .then(result => {
                this.dataList = result;
            })
            .catch(error => this.handleError(error));
    }

    
    setValue(event) {        
        this.value = JSON.parse(event.detail);
        if (this.value.value) {
            this.objectName = this.value.value;
        }        
        
        const selectedEvent = new CustomEvent('objectselected', { detail: JSON.stringify(this.value) });
        this.dispatchEvent(selectedEvent);
    }
}