
/* ===================================
   NOVACALC - CALCULATOR JAVASCRIPT
=================================== */

// Get the calculator display elements.
const display = document.getElementById("display");
const previousValue = document.getElementById("previous-value");
const displayLabel = document.getElementById("display-label");

// Get the calculator button container.
const buttons = document.querySelector(".buttons");

// Store the current and previous numbers.
let currentInput = "0";
let previousInput = null;

// Store the selected arithmetic operator.
let operator = null;

// Track whether the next digit starts a new number.
let shouldResetDisplay = false;

// Track whether the calculator is showing an error.
let hasError = false;


/* 1. Update the calculator display */

function updateDisplay() {
    display.textContent = currentInput;

    // Show the previous number and operator when available.
    if (operator !== null && previousInput !== null) {
        previousValue.textContent =
            `${previousInput} ${getOperatorSymbol(operator)}`;
    } else {
        previousValue.textContent = "";
    }
}


/* 2. Convert operators into display symbols */

function getOperatorSymbol(op) {
    const symbols = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    };

    return symbols[op] || op;
}


/* 3. Display an error message */

function showError(message) {
    currentInput = message;
    previousInput = null;
    operator = null;
    shouldResetDisplay = true;
    hasError = true;

    previousValue.textContent = "";
    displayLabel.textContent = "INVALID OPERATION";

    updateDisplay();
}


/* 4. Reset the calculator completely */

function clearCalculator() {
    currentInput = "0";
    previousInput = null;
    operator = null;
    shouldResetDisplay = false;
    hasError = false;

    displayLabel.textContent = "READY TO CALCULATE";

    updateDisplay();
}


/* 5. Add a digit to the current number */

function appendNumber(number) {
    // Start fresh after an error.
    if (hasError) {
        clearCalculator();
    }

    // Start a new number after choosing an operator or
    // completing a calculation.
    if (shouldResetDisplay) {
        currentInput = number;
        shouldResetDisplay = false;
    } else if (currentInput === "0") {
        // Replace the initial zero.
        currentInput = number;
    } else {
        // Limit the input length to avoid excessively
        // long numbers in the calculator display.
        if (currentInput.replace(/[^0-9]/g, "").length >= 15) {
            return;
        }

        currentInput += number;
    }

    displayLabel.textContent = "ENTERING NUMBER";

    updateDisplay();
}


/* 6. Add a decimal point */

function addDecimal() {
    if (hasError) {
        clearCalculator();
    }

    // Start a new decimal number when necessary.
    if (shouldResetDisplay) {
        currentInput = "0.";
        shouldResetDisplay = false;
    } else if (!currentInput.includes(".")) {
        currentInput += ".";
    }

    displayLabel.textContent = "ENTERING NUMBER";

    updateDisplay();
}


/* 7. Change the sign of the current number */

function changeSign() {
    if (hasError) {
        clearCalculator();
        return;
    }

    // Do not change an empty or zero value.
    if (Number(currentInput) === 0) {
        return;
    }

    // Add or remove the negative sign.
    currentInput = currentInput.startsWith("-")
        ? currentInput.slice(1)
        : "-" + currentInput;

    updateDisplay();
}


/* 8. Delete the last digit */

function deleteDigit() {
    if (hasError || shouldResetDisplay) {
        clearCalculator();
        return;
    }

    // Remove the final character.
    currentInput = currentInput.slice(0, -1);

    // Show zero if the input becomes empty.
    if (currentInput === "" || currentInput === "-") {
        currentInput = "0";
    }

    updateDisplay();
}


/* 9. Perform an arithmetic calculation */

function calculate(firstNumber, secondNumber, op) {
    switch (op) {
        case "+":
            return firstNumber + secondNumber;

        case "-":
            return firstNumber - secondNumber;

        case "*":
            return firstNumber * secondNumber;

        case "/":
            // Prevent division by zero.
            if (secondNumber === 0) {
                return null;
            }

            return firstNumber / secondNumber;

        default:
            return null;
    }
}


/* 10. Format the calculation result */

function formatResult(result) {
    // Prevent Infinity and NaN from appearing.
    if (!Number.isFinite(result)) {
        return null;
    }

    // Avoid displaying common floating-point precision
    // artifacts, such as 0.1 + 0.2 = 0.30000000000000004.
    return String(Number(result.toPrecision(12)));
}


/* 11. Select an arithmetic operator */

function chooseOperator(selectedOperator) {
    if (hasError) {
        clearCalculator();
    }

    const inputNumber = Number(currentInput);

    // If an operator was already selected and the user
    // enters another number, calculate the intermediate
    // result before choosing the next operator.
    if (
        operator !== null &&
        previousInput !== null &&
        !shouldResetDisplay
    ) {
        const result = calculate(
            Number(previousInput),
            inputNumber,
            operator
        );

        if (result === null) {
            showError("Cannot divide by zero");
            return;
        }

        const formattedResult = formatResult(result);

        if (formattedResult === null) {
            showError("Invalid result");
            return;
        }

        currentInput = formattedResult;
    }

    previousInput = currentInput;
    operator = selectedOperator;
    shouldResetDisplay = true;
    hasError = false;

    displayLabel.textContent = "OPERATOR SELECTED";

    updateDisplay();
}


/* 12. Calculate the final answer */

function calculateResult() {
    if (hasError) {
        clearCalculator();
        return;
    }

    // A calculation requires two numbers and an operator.
    if (operator === null || previousInput === null) {
        return;
    }

    const firstNumber = Number(previousInput);
    const secondNumber = Number(currentInput);
    const selectedOperator = operator;

    // Perform the selected operation.
    const result = calculate(
        firstNumber,
        secondNumber,
        selectedOperator
    );

    // Handle invalid calculations.
    if (result === null) {
        showError(
            selectedOperator === "/" && secondNumber === 0
                ? "Cannot divide by zero"
                : "Invalid operation"
        );
        return;
    }

    // Format the result before displaying it.
    const formattedResult = formatResult(result);

    if (formattedResult === null) {
        showError("Invalid result");
        return;
    }

    // Display the completed calculation.
    previousValue.textContent =
        `${firstNumber} ${getOperatorSymbol(selectedOperator)} ${secondNumber} =`;

    currentInput = formattedResult;
    previousInput = null;
    operator = null;
    shouldResetDisplay = true;
    hasError = false;

    displayLabel.textContent = "CALCULATION COMPLETE";

    updateDisplay();
}


/* 13. Handle calculator button clicks */

buttons.addEventListener("click", function (event) {
    // Find the clicked button.
    const button = event.target.closest("button");

    // Ignore clicks outside the buttons.
    if (!button) {
        return;
    }

    // Handle number buttons.
    if (button.dataset.number !== undefined) {
        appendNumber(button.dataset.number);
        return;
    }

    // Handle arithmetic operators.
    if (button.dataset.operator) {
        chooseOperator(button.dataset.operator);
        return;
    }

    // Handle special action buttons.
    switch (button.dataset.action) {
        case "clear":
            clearCalculator();
            break;

        case "delete":
            deleteDigit();
            break;

        case "sign":
            changeSign();
            break;

        case "decimal":
            addDecimal();
            break;

        case "equals":
            calculateResult();
            break;
    }
});


/* 14. Support keyboard input */

document.addEventListener("keydown", function (event) {
    const key = event.key;

    // Type numbers from the keyboard.
    if (/^[0-9]$/.test(key)) {
        appendNumber(key);
        return;
    }

    // Support decimal points.
    if (key === ".") {
        addDecimal();
        return;
    }

    // Support arithmetic operators.
    if (["+", "-", "*", "/"].includes(key)) {
        chooseOperator(key);
        return;
    }

    // Calculate when Enter or equals is pressed.
    if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculateResult();
        return;
    }

    // Clear the calculator with Escape.
    if (key === "Escape") {
        clearCalculator();
        return;
    }

    // Delete the last digit using Backspace.
    if (key === "Backspace") {
        deleteDigit();
    }
});


/* 15. Display the current year in the footer */

document.getElementById("year").textContent =
    new Date().getFullYear();


// Initialize the display when the page loads.
updateDisplay();
