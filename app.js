//BUDGET CONTROLLER MODULE

//Use IIFE to create a module pattern - Allows for Data Privacy with a new scope, not visible form the outsude scope. Variable x and function add are created in this scope
var budgetController = (function () {

    //Storing Expenses & Income
    //Each new item will have a Description and a Value
    //ID different Incomes and Expenditure logs

    //Use A Function Contructor to create Multiple inc/exp Objects

    //For function Constructor, Capitalise
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        //Store the calculated percentage here
        this.percentage = -1; //Not Defined
    };

    //Create a new method on the Expense function constructor (object) called calcPercentage
    //Add this to the prototype property of Expense object so that all of the objects created through the Expense prototype will inherit this method (prototype chain)
    //Pass in totalIncome to calculate the percentage of an expense
    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    //Create a separate function to getPercentage
    Expense.prototype.getPercentages = function () {
        return this.percentage; //Return Expense.percentage
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //Private Function to Calculate Total Income and Total Expense - Reusable
    //type = exp or inc
    var calculateTotal = function (type) {
        var sum = 0;
        //Use current element argument, renamed 'cur'
        data.allItems[type].forEach(function (cur) {
            sum += cur.value; //We called it value in the Income object
        });

        //Store this Total Sum inside our data structure: data Object
        data.totals[type] = sum;
    };

    //Aggregate Data structure wherever possible
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 //Non Existant
    };

    //Public Method - Allow other modules to add new item into our data structure
    return {
        //Item Attributes
        addItem: function (type, des, val) {
            var newItem, ID;

            //Create New ID
            //ID = last ID + 1
            //Get Last Value:
            //Select exp or inc Array, then search last index position
            //Retrieve ID property of this position + 1 (Arrays are zero based)

            //Check Arrays are not Empty first
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }



            //Create new item based on 'inc' or 'exp' type - Dropdown Selection
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Push into our data structure
            //Store item in data/allItems Object in the exp[] or inc[] Array
            data.allItems[type].push(newItem);

            //Return the new element
            return newItem;

        },

        //To Delete an Item, we need to know the type and ID
        deleteItem: function (type, id) {
            var ids, index;

            //loop through ALL Elements in an inc or exp Array using map()
            //Also accepts up to 3 arguments
            //map() returns a brand new Array!
            ids = data.allItems[type].map(function (current) {
                return current.id; //e.g [1, 2, 4, 8, 9] (Remove those deleted by user
            });

            //Find Index of each ID in the new Array. e.g. el 8 = index 3
            index = ids.indexOf(id);

            //Array Index of -1 means item not found in Array being searched
            if (index !== -1) {
                //splice() method removes array element(s) at a given position
                //1) Position to start deleting
                //2) No. elements to delete
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            //Calculate Total Income  Expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate the Bidget: Income - Expenses
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage of income that we spent
            if (data.totals.inc > 0) { //Cannot calculate % if 0 income
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {

            //Calculate percentage for Each Expense in the object
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc); //Must pass in income
            });
        },

        getPercentages: function () {
            //Loop through array and return and store something in a var
            var allPerc = data.allItems.exp.map(function (cur) {
                //Return the result of the getPercentages method on each element in the exp array and store in the allPer array
                return cur.getPercentages();
            });
            //Return the array with all of the calculated percentages on the expenses
            return allPerc;
        },

        //Return Budget Values
        //obj values
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        //Test PubMeth
        testing: function () {
            console.log(data);
        }
    };

})();



//#############################################################


//UI CONTROLLER MODULE
var UIController = (function () {

    //Unify DOM Queries, so that you only have to change them in one place
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    //Moved to Private Scope as this function will not be used outside this UI Module
    //input: Number to format, type of inc + or exp -
    var formatNumber = function (num, type) {
        var numSplit, int, dec;
        /*

        1. + or - before number
        2. exactly 2 decimal points
        3. comma separating thousands

        */

        //Absolute removes the sign of the number, e.g. -200 -> 200
        num = Math.abs(num); //Overwrite num var
        num = num.toFixed(2); //Strings and Numbers can have methods.This accesses the number's prototype property

        //Split 23043.3224 -> 23043, 32 & store in 2 Arrays
        numSplit = num.split('.');

        int = numSplit[0];

        //If more than 100, so 1000+
        if (int.length > 3) {
            //Take part of a string. 1. index, 2. How many chars
            //e.g. int = 2345.5654 -> int.substr(0, 2) returns 23
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        //Ternary Operator | returns '-' or '+' first
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };


    //MOVED TO PRIVATE SCOPE - Reusable in UIController Module

    //Create a function and pass in a NodeList and a callback function, which will hold the current element and the index in an array
    var nodeListForEach = function (list, callback) {
        //Loop through a NodeList. With each iteration, the callback function gets called
        for (var i = 0; i < list.length; i++) {
            //Call callback function | callback(current, index)
            //current -> current position in the list
            //index -> i
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            //Return 3 properties. This stores the user input data in an object
            return {
                type: document.querySelector(DOMstrings.inputType).value, //Either 'inc' or 'exp'
                description: document.querySelector(DOMstrings.inputDescription).value,
                //Convert Value Input from string to a Decimal Number
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            //Create HTML string with placeholder text for Income or Expense
            //Wrap placeholder with inside percentage signs like %test-data% so that its easy to find

            //PLACEHOLDERS: %id%, %description%, %value%

            if (type === 'inc') {

                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if (type === 'exp') {

                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace placeholder text with actual data

            //Overwite
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            //The formatNumber() fn will be called with the value and the type will be formatted and replaced with string
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert HTML into the DOM
            //element will be class .income__list or .expenses__list
            //html will be stored (at the bottom of) as a child of income / expenses lists
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        //Pass in ID HTML references to build a div wrapping the input item
        deleteListItem: function (selectorID) {
            //Move up DOM to parent to remove child
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFileds: function () {
            var fields, fieldsArr;

            //fields variable holds the result of the selection
            //CSS Syntax - Comma Separated
            //QuerySelector returns a list. We want an array!
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            //Convert list returned from querySelectorAll() to an Array using slice()
            //Slice returns a copy of the Array its called on - Usually called on an array. We need a hack to trick the list using the call() method
            //slice() method is stored in the Array Prototype
            //call method can be called on a function
            //Set this variable to fields

            //This is now an Array. We can now loop through and clear fields
            fieldsArr = Array.prototype.slice.call(fields);

            //FOR EACH LOOP - Arrays
            //The anonymous fuction below is a callback function and can receive up to 3 arguments. This callback fn is then passed to each element in the array
            //We have access to:
            // 1) Current Value - Value of the Array being processed
            // 2) Index Number
            // 3) Entire Array
            // These can be renamed
            fieldsArr.forEach(function (current, index, array) {
                //Sets ALL Values to empty String
                current.value = "";
            });

            //Change Target to "Add Description" field after submit
            //fieldsArr[0] === inputDescription AKA "Add Description"
            //filedsArr[1] === inputValue AKA "Value"
            fieldsArr[0].focus();
        },

        //We need to pass in the object storing all of this data
        displayBudget: function (obj) {

            var type;
            obj.budget > 0 ? type === 'inc' : type = 'exp';

            //We don't know what the type is here
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            //Type known
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            //Type known
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            //Appropriately show % Sign, OR leave blank
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        //Pass in percentages array that we stored in our controller
        displayPercentages: function (percentages) {

            //Loop over all the Elements (DOM Nodes) in our selection and change the text content property of them all to update the percentage on the UI

            //Nodelist does not have the forEach() method on it. Here is an alternative way

            //Returns a Nodelist
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            // 1. Call nodeListForEach function and pass a callback function into it: function(current, index){ ... };
            // 2. This function is assigned to the callback parameter in the nodeListForEach function above
            // 3. Then Loop through NodeList. With each iteration, the callback function gets called with CURRENT and INDEX arguments
            // 4. Now we have access to current element and current index which can be used below to dislay percentages to UI
            nodeListForEach(fields, function (current, index) {

                //Get text content of the cuttent element in the current index. Give this the value of the corresponding percentage from the percentage[] array. 0, 1, 2, 3...

                //Add a conditional to check percentage is set

                //percentage at position index | current percentage
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });


        },

        displayDate: function () {
            var now, month, months, year;
            //Date Object Constructor
            now = new Date(); //Returns Today

            //Array containing all Month names
            month = now.getMonth(); //Returns Current Month [ZERO BASED]
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            year = now.getFullYear(); //Returns Current Year
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function () {

            //Select all the fields to be changed colour on change
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        //Pass DOMstrings Object to the PUBLIC scope so it can be used in other controllers
        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();


//#############################################################



//GLOBAL APP CONTROLLER
//- This will be the link between the UI module and the Budget Controller Module

//Use different names as arguments to make more agile
//Decide here what happens to each event and delegate to other controllers
var controller = (function (budgetCtrl, UICtrl) {

    //Place all Event Listeners in 1 function
    var setupEventListeners = function () {

        //Store reference to DOMstrings Object here from UIController
        var DOM = UIController.getDOMstrings();

        //Add Event Handler on Button
        //Renamed from DOMstrings to DOM
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        //Use this on Global Document Scope for 'Enter' keypress
        document.addEventListener('keypress', function (event) {

            //Access keypress properties by: console.log(event);
            //Old browsers use 'which' property instead of 'keyCode'
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }

        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        //On Change
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    //This function will simply return the budget and display it
    var updateBudget = function () {

        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget(); //Must Store in a VAR as we are                                               //returning something

        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    //Update Percentages
    var updatePercentages = function () {
        //1. Calculate Percentages
        budgetCtrl.calculatePercentages();

        //2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    //When User hits the add item button
    var ctrlAddItem = function () {
        var input, newItem;

        // 1. Get the field input data
        var input = UIController.getInput(); //Public Method

        //Input Description should not be Empty
        // AND Number should not be NaN
        // AND input should be more than 0
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the new item to UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear the Fields
            UICtrl.clearFileds();

            //5. Calculate and update budget
            updateBudget();

            //6. Calculate and update percentages
            updatePercentages();

        }
    };

    //Use event argument to find out what the TARGET Element is (where it first fired)
    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        //Set event listener on the first Element that ALL INC and EXP items have in common to allow for Event Delegation (bubble up parent nodes) via traversal
        //Get ID of the
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            //IDs look something like inc-1, exp-2
            //Using the split() method, we can separate these into an array and use this data
            splitID = itemID.split('-');
            type = splitID[0];
            //Convert String to Integer
            ID = parseInt(splitID[1]);

            //1. Delete Item from Data Structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete Item from UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show New Budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();
        }
    };

    //Call setupEventListeners function via Public Method
    //Event listeners are only going to be setup once we call the init function
    return {
        //Initialisation
        init: function () {
            console.log('Application has started');

            //Display Current Year
            UICtrl.displayDate();

            //Reset Values when page loads
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1 //Non Existant
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

//Initialisation Function - Setup Event Listeners
controller.init();
