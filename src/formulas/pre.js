let mathInputBox = document.querySelector(".math-input");
let insertBtn = document.querySelector(".insert-btn");
let formulaBtn = document.querySelector(".formulas-btn");
let interactiveField = document.querySelector(".interactive");
let formulaReadyBtn = document.querySelector(".formula-ready");

let states = {
    none: 0,
    disabled: 1,
    formula: 2,
    formulaFocus: 3,
};

/** @type {number} */
let state = states.none;

let newPartModes = {
    newLine: 0,
    addToEnd: 1,
    replace: 2
}
/**@type {number} */
let newPartMode = newPartModes.addToEnd;

/**
 * @callback EventHandlerFunc
 * @type {{path:Active, handlers:Array<{target:HTMLElement, func: HandlerFunc}>}} */
let focusFormulaConfig = null;

/**
 * @param {HTMLElement} elem 
 * @param {?HTMLElement} before 
 */
function insertContent(elem, before) {
    deleteActiveAll();
    if(before){
        interactiveField.insertBefore(elem,before);
    }else{
        interactiveField.append(elem);
    }
}

/**
 * @param {HTMLElement} elem element fith formula to be deleted
 */
function deleteContent(elem){
    interactiveField.removeChild(elem);
}

async function formulaInput(defaultTeX="") {
    inputField.latex(defaultTeX);

    document.querySelectorAll(".dropdown-menu.show").forEach((el)=>el.classList.remove("show"));
    let prevState = state;
    state = states.disabled;

    mathInputBox.style.display = "flex";
    let formula = null;
    while (!formula) {
        let userInput = await _getUserInput();
        try {
            formula = formulaFromTeX(userInput);
        } catch (error) {
            console.log(error);
        }
    }
    inputField.latex("");

    mathInputBox.style.display = "none";
    state = prevState;

    return formula;
}

function _getUserInput() {
    return new Promise((resolve, reject) => {
        formulaReadyBtn.addEventListener("click", function(e) {
            resolve(inputField.latex());
        });
    });
}


/**
 * Add formula element to interactiveField
 * @param {Formula} formula formula to be inserted
 * @param {?HTMLElement} before insert before 
 */
function insertFormula(formula, before) {
    let elem = document.createElement("div");
    elem.innerHTML = `\\(${formula.toTex()}\\)`;
    elem.className = "content-formula";

    MathJax.typeset([elem]);
    insertContent(elem, before);
    prepareHTML(elem, formula);
}

/**
 * Replace rendered formula
 * @param {Formula} formula new formula
 * @param {HTMLElement} elem element with redered formula
 */
function replaceFormula(formula,elem){
    insertFormula(formula, elem);
    deleteContent(elem);
}

/**
 * Get ineractive field child node that conteins element
 * @param {HTMLElement} elem 
 * @return {?HTMLElement}
 */
function getFormulaHTML(elem){
    for(let child of interactiveField.children){
        if(child.contains(elem)) return child;
    }
}

