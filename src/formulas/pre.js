let mathInputBox = document.querySelector(".math-input");
let insertBtn = document.querySelector(".insert-btn");
let formulaBtn = document.querySelector(".formulas-btn");
let interactiveField = document.querySelector(".interactive");
let formulaReadyBtn = document.querySelector(".formula-ready");
let insertDm = document.querySelector(".insert-dm");

/** @type {string} */
let state = "none";

/** @param {HTMLElement} elem */
function insertContent(elem) {
    interactiveField.append(elem);
}


async function formulaInput() {
    document.querySelectorAll(".dropdown-menu.show").forEach((el)=>el.classList.remove("show"));
    formulaBtn.classList.add("disabled");
    insertBtn.classList.add("disabled");
    let prevState = state;
    state = "disabled";

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
    formulaBtn.classList.remove("disabled");
    insertBtn.classList.remove("disabled");
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
 * @param {Formula} formula element with visualised formula
 */
function insertFormula(formula) {
    let elem = document.createElement("div");
    elem.innerHTML = `$$${formula.toTex()}$$`;
    elem.className = "content-formula";

    MathJax.Hub.Queue(
        ["Typeset", MathJax.Hub, elem],
        [prepareHTML, elem, formula],
        [insertContent, elem],
    );
}
