import { LightningElement , api} from 'lwc';
import uploadFile from '@salesforce/apex/FileUploadClass.uploadFile';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class FileUploader extends LightningElement {
    
    
    @api recordId;
    @api search
    fileData
    openFileUpload(event){
        //accessing files
        const file=event.target.files[0]
        //reading file async
        var reader = new FileReader()

        //after files get uploaded
        //created arrow function so we can use this function inside it
        reader.onload = ()=>{

            //read data from the object
            var base64 = reader.result.split(',')[1]
            this.fileData = {
                'filename': file.name,
                'base64': base64,
                'recordId': this.recordId
            }
            console.log(this.fileData);
        }
        //converts data into binary encoded base64
        reader.readAsDataURL(file)
    }

    handleClick(){
        const {base64, filename, recordId} = this.fileData
        uploadFile({base64, filename, recordId}).then(result=>{
            this.fileData = null
           var title = `${filename} uploaded successfully !`
           this.toast(title)
        })
         loadData({fileData})
            .then(result => {
                console.log("hey" + JSON.stringify(result));
            })
            .catch(error => {
                this.error = error;
            });
    
    }

    toast(title){
     
        const event = new ShowToastEvent({
            title,
            variant: "success",
            message:
                'File Uploaded'
        });
        this.dispatchEvent(event);
    }
}
