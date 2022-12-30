let formulaInputBox = document.querySelector(".math-input");
let textInputBox = document.querySelector(".text-input");
let textInputArea = document.querySelector(".text-input-area");

const mqConfig = {
    supSubsRequireOperand: true,
    maxDepth: 4,
    handlers: {
        enter: function() {
        },
    },
};
const formulaInputField = MQ.MathField(document.querySelector("#mq-math-field"), mqConfig);
const mathInputField = MQ.MathField(document.querySelector("#mq-text-field"), mqConfig);

function _prepareInput(inputBox){
    document.querySelectorAll(".dropdown-menu.show").forEach((el)=>el.classList.remove("show"));
    inputBox.style.display = "flex";
    let prevState = state;
    state = states.disabled;
    return prevState;
}

function _removeInput(inputBox, prevState){
    inputBox.style.display = "none";
    state = prevState;
}

function _getFormulaInput() {
    return new Promise((resolve, reject) => {
        document.querySelector(".formula-ready").addEventListener("click", function(e) {
            resolve(formulaInputField.latex());
        });
    });
}

async function formulaInput(defaultTeX="") {
    let prevState = _prepareInput(formulaInputBox);
    formulaInputField.latex(defaultTeX);

    let formula = null;
    while (!formula) {
        let userInput = await _getFormulaInput();
        try {
            formula = formulaFromTeX(userInput);
        } catch (error) {
            console.log(error);
        }
    }
    formulaInputField.latex("");
    _removeInput(formulaInputBox,prevState);

    return formula;
}


function _getTextInput() {
    return new Promise((resolve, reject) => {
        document.querySelector(".text-ready").addEventListener("click", function(e) {
            resolve(textInputArea.value);
        });
    });
}

async function textInput(defaultTeX="") {
    let prevState = _prepareInput(textInputBox);
    textInputArea.value = defaultTeX;
    
    let text = await _getTextInput();
    while (!checkText(text)) {
        text = await _getTextInput();
    }
    _removeInput(textInputBox,prevState);
    textInputArea.value = "";

    return text;
}

/**
 * Is text correct for MathJax
 * @param {string} text 
 * @return {boolean} 
 */
 function checkText(text){
    let elem = document.createElement("div");
    elem.innerHTML = text;
    MathJax.typeset([elem]);
    return !elem.querySelector("mjx-merror");
}

