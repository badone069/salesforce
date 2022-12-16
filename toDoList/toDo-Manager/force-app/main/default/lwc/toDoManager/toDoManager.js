import { LightningElement, track } from 'lwc';

//used track decorator to make properties reactive
export default class ToDoManager extends LightningElement {
    @track time ;
    @track greeting;
    @track todos=[];
    

    //called as soon as your component is initialized
    connectedCallback(){

        this.getTime();
        //this.populateTodos();

        //this.fetchTodos();

        setInterval( () => {
            this.getTime();
        }, 1000*60)
    }

    getTime(){
        const date = new Date();
        const hour = date.getHours();
        const min =  date.getMinutes();

        this.time = `${this.getHour(hour)}:${this.getdoubleDigit(
            min
            )} ${this.getMidday(hour)}`

        this.setGreeting(hour);
    }

    getHour(hour){
        return hour === 0 ? 12 : hour > 12 ? (hour-12): hour;    
    }


    getMidday(hour){
      return hour >=12 ? "PM" : "AM";
    }

    getdoubleDigit(digit){
        return digit<10 ? "0" + digit : digit;
    }


    setGreeting(hour){
        if(hour < 12){
            this.greeting = "Good Morning";

        }else if(hour >= 12 && hour < 17){
                this.greeting="Good Afternoon"
        }else{
            this.greeting="Good Evening";
        }
    }

    addTodoHandler(){
        const inputBox = this.template.querySelector("lightning-input");
        
        const todo ={
            todoId: this.todos.length,
            todoName: inputBox.value,
            done:false,
            todoDate: new Date()
        }

        // addTodo({payload : JSON.stringify(todo)}).then(response =>{
        //     console.log("Item inserted successfully");
        //     this.fetchTodos();
        // }).catch(error =>{
        //     console.error("Error in inserting todo item" + error);
        // })
        this.todos.push(todo);
        inputBox.value="";
    }

    // fetchTodos(){
    //     getCurrentTodos().then(result => {
    //         if(result){
    //             console.log("retrived todos from server", result.length);
    //             this.todos = result;
    //         }
          
    //     }).catch(error => {
    //         console.error("Error in fetching todos" + error);
    //     })
    // }

    get upcomingTasks(){
        return this.todos && this.todos.length 
         ? this.todos.filter( todo => !todo.done) 
         : [];
    }

    get completedTasks(){
        return this.todos && this.todos.length 
        ? this.todos.filter( todo => todo.done) 
        : [];
    }


    populateTodos(){
        const todos =[
            {
                todoId: 0,
                todoName:"feed the dog",
                done: false,
                todoDate: new Date()
            },
            {
                todoId: 1,
                todoName:"wash the car",
                done:false,
                todoDate: new Date()
            },
            {
                todoId: 2,
                todoName:"send email to manager",
                done:true,
                todoDate: new Date()
            }
        ];
        this.todos = todos;
    }
}