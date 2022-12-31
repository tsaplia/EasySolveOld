function cmCopy(event){
    if (selected.formulas.length != 1 || state!=state.FORMULA) return;
    let TeX = selected.formulas[0].main.toTex();
    if (TeX) {
        navigator.clipboard.writeText(TeX);
    }
    event.preventDefault();
}

async function cmEdit(event){
    if(selected.formulas.length==1 && selected.formulas[0].main instanceof Formula){
        menu.classList.remove("active-cm");
        replaceFormula(await formulaInput(selected.formulas[0].main.toTex()), selected.formulas[0].HTML);
    }
}

async function cmPaste(event){
    if(event.target.tagName=="TEXTAREA") return;
    console.log(event.target);
    try{
        let text = await navigator.clipboard.readText();
        let formula = formulaFromTeX(text);
        if(selected.formulas.length==1 && selected.formulas[0].main instanceof Formula){
            insertFormula(formula, selected.formulas[0].HTML.parentElement.parentElement)
        }else{
            insertFormula(formula);
        }
    }catch{
        console.log("Can not paste formula");
        return;
    }
    event.preventDefault();
}

function cmDelete(event){
    for(let active of selected.formulas){
        if(active.main instanceof Formula) deleteContent(active.HTML.parentElement.parentElement)
    }
}

document.addEventListener("copy", cmCopy);
document.addEventListener("paste", cmPaste);
document.querySelector("#paste-btn").addEventListener("click", cmPaste); 
document.querySelector("#copy-btn").addEventListener("click", cmCopy); 
document.querySelector("#edit-btn").addEventListener("click", cmEdit); 
document.querySelector("#delete-btn").addEventListener("click", cmDelete); 