//BUDGET CONTROLLER MODULE

//Use IIFE to create a module pattern - Allows for Data Privacy with a new scope, not visible form the outsude scope. Variable x and function add are created in this scope
var budgetController = (function(){

     //budgetController.x will result in undefined
     var x = 23;
                        
     //budgetController.add will result in undefined
     var add = function(a){
         return x + a;
     }
     
     return {
         //Returns an empty object. Add a method below
         //budgetController.publicTest(100); will result in 123
         //This can be used even after the add function has finished executing, returned, due to closures
         //Inner funtion always has access to the outer function's variables and parameters, even after return
         publicTest: function(b){
             //call the add function with argument b
             return add(b);
         }
     }
})();

//IIFE returns immediately and is gone
//publicTest function will always have access to var x and add function due to the closure
    
//publicTest method is i the public scope
//variables x and a are private because they are IN the Closure
//Only publicTest function can access them
    
//Essentially, budgetController variable is an object containing the method publicTest. publicTest method then uses the add and x variable, even after the function has finished executing. This works due to closures. x and add variables are private because they are in the closure, even after the IIFE ha returned
    

//#############################################################


//UI CONTROLLER MODULE
var UIController = (function(){
    
    
    
})();


//#############################################################



//CONTROLLER MODULE - This will be the link between the UI module and the Budget Controller Module

//Use different names as arguments to make more efficient incase name change
var controller = (function(budgetCtrl, UICtrl){
    
    //returns 28
    var z = budgetCtrl.publicTest(5);
    
    return {
        anotherPublic: function(){
            console.log(z);
        }
    }
    
})(budgetController, UIController);










