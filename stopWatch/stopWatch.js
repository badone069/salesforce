import { LightningElement ,api,track,wire} from 'lwc';
import setTime from '@salesforce/apex/timerapex.setTime';
import checkStatus from '@salesforce/apex/caseStatus.checkStatus';


export default class StopWatch extends LightningElement {
    @api recordId;
    @track timer;
    @track timer1 = '00:00:00';
    timerRef;
    wireResponse=[];
    @track showClock2;
    @track showClock1;
    @track response=[];
    @track response2 =[];
    @track saveTime
    @track showWarning = false;
    totalSecond;
    @wire(checkStatus, { recordId: '$recordId'})
    wireCallBack({error,data}){
        if(data){
            console.log('in data if ');
            this.error=undefined;
            
            this.wireResponse=data;
            console.log('this.wireResponse '+ JSON.stringify(this.wireResponse));
            if(this.wireResponse[0]=='New' && this.wireResponse[1]=='true'){
                this.showClock1=true;
                
            }
            console.log('data',data); 
            this.status=data[1];
            console.log('in if wireResponse',JSON.stringify(this.wireResponse));
        } 
        if(this.wireResponse[2] != null && this.wireResponse[1]=='false'){
            this.showClock2 = true;
            let  h = Math.floor(( (this.wireResponse[2]))/ (1000 * 60 * 60));
            let m =  Math.floor(((this.wireResponse[2]) % (1000 * 60 * 60)) / (1000 * 60));
            let s = Math.floor((this.wireResponse[2] % (1000 * 60))/1000);
            this.timer1 = h + ':' + m + ':' + s;
            //console.log('in error ');
           //this.error=error;
           //this.wireResponse=undefined;
        }
    };


  

    setTimer(){
     
      
        this.totalSecond =0;
        let h1 = parseInt(this.response[0]);
        let m1 = parseInt(this.response[1]);
       let s1 = parseInt(this.response[2]);
      console.log('h1,m1,s1',h1,m1,s1);
       let mh = h1*3600000;
       let mm = m1*60000;
       let ms = s1*1000;

       this.totalSecond = mh + mm + ms;
       console.log('time' + mh + mm + ms);
         this.timerRef = window.setInterval(()=>{
   

       let  h = Math.floor(( (this.totalSecond))/ (1000 * 60 * 60));
       let m =  Math.floor(((this.totalSecond) % (1000 * 60 * 60)) / (1000 * 60));
       let s = Math.floor((this.totalSecond % (1000 * 60))/1000);

 
        this.timer = (h)+ ":" + ((m)%60) + ":" + (s); 
        console.log('this.timer '+this.timer);
        this.totalSecond += 100;

        }, 100)

       
          
    }

    connectedCallback(){
        setTime({
            Msgbody : this.recordId,
        })
        .then(result => {
            this.response= result;
            console.log('Time' + this.response);
            
           
            this.setTimer();
      
          if(parseInt(this.response[0]) >=4){
            this.showWarning = true;
          }
        })

        
     }
}