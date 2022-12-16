import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import chartjs from '@salesforce/resourceUrl/chartJs';

const generateRandomNumber = () => {
    return Math.round(Math.random() * 13);
};

export default class LibsChartjs extends LightningElement {
    error;
    chart;
    chartjsInitialized = false;

    config = {
        type: 'doughnut',
       
        data: {
            datasets: [
                {
                    data: [
                        generateRandomNumber(),
                        generateRandomNumber()
                       
                    ],
                    
                    backgroundColor: [
                        
                        'rgb(75, 192, 192)',
                        'rgb(255, 255, 255)'
                        
                    ],
                    label: 'Dataset 1'
                }
            ],
          
           
        },
        options: {
            responsive: false,
        
          
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    };

    renderedCallback() {
        if (this.chartjsInitialized) {
            return;
        }
        this.chartjsInitialized = true;

        loadScript(this, chartjs)
            .then(() => {
               
                
                const canvas = document.createElement('canvas');
                canvas.setAttribute('style','position:relative; top: -41px; width: 67px; height: 67px; color: black; left: -20px;');
                
              
                this.template.querySelector('div.chart').appendChild(canvas);
                const ctx = canvas.getContext('2d');
               

                
                this.chart = new window.Chart(ctx, this.config);
            })
            .catch((error) => {
                this.error = error;
            });
    }
}