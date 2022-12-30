interactiveField.addEventListener("click", (event) => {
    if (event.target == interactiveField) {
        deleteActiveAll();
    }
});

document.querySelector(".insert-formula-btn").addEventListener("click", async ()=>{
    insertFormula(await formulaInput());
});

document.querySelector(".insert-text-btn").addEventListener("click", async ()=>{
    insertText(await textInput());
});


document.querySelector(".insert-math-btn").addEventListener("click",()=>{
    if(mathInputField.latex()){
        textInputArea.value += ` \\(${mathInputField.latex()}\\) `;
        mathInputField.latex("");
        textInputArea.focus()
    }
});

for (let action of formulaActions) {
    document.querySelector(`#${action.buttonId}`).addEventListener("click", async ()=>{
        if (![states.formula, states.formulaFocus].includes(state) || !action.check()) return;
        action.caller();
    });
}

document.querySelectorAll("input[name='new-part-mod']").forEach(elem => {
    elem.addEventListener("click", ()=>newPartMode = elem.value-'0');
});
