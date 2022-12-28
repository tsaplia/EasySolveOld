function cmCopy(event){
    if (activeFormulas.length != 1 || ![states.formula, states.formulaFocus].includes(state)) return;
    let TeX = activeFormulas[0].main.toTex();
    if (TeX) {
        navigator.clipboard.writeText(TeX);
    }
    event.preventDefault();
}
document.addEventListener("copy", cmCopy);
document.querySelector("#copy-btn").addEventListener("click", cmCopy); 

async function cmEdit(event){
    if(activeFormulas.length==1 && activeFormulas[0].main instanceof Formula){
        menu.classList.remove("active-cm");
        replaceFormula(await formulaInput(activeFormulas[0].main.toTex()), activeFormulas[0].HTML.parentElement.parentElement);
    }
}
document.querySelector("#edit-btn").addEventListener("click", cmEdit); 

async function cmPaste(event){
    if(event.target.tagName=="TEXTAREA") return;
    console.log(event.target);
    try{
        let text = await navigator.clipboard.readText();
        let formula = formulaFromTeX(text);
        if(activeFormulas.length==1 && activeFormulas[0].main instanceof Formula){
            insertFormula(formula, activeFormulas[0].HTML.parentElement.parentElement)
        }else{
            insertFormula(formula);
        }
    }catch{
        console.log("Can not paste formula");
        return;
    }
    event.preventDefault();
}
document.addEventListener("paste", cmPaste);
document.querySelector("#paste-btn").addEventListener("click", cmPaste); 

function cmDelete(event){
    for(let active of activeFormulas){
        if(active.main instanceof Formula) deleteContent(active.HTML.parentElement.parentElement)
    }
}
document.querySelector("#delete-btn").addEventListener("click", cmDelete); 

