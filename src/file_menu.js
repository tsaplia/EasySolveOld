let shotBox = document.querySelector("#shot-box");
let screenshot = document.getElementById('screenshot');

function download(data, filename, type) {  
    let a = document.createElement("a");
    
    let url = type!="canvas" ? URL.createObjectURL(new Blob([data], {type: type})) :
        data.toDataURL("image/png");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 0); 
}

function latexWrap(text){
    return  `
\\documentclass{article}
\\usepackage[utf8]{inputenc}
${text}
\\begin{document}
\\end{document}
`
}

document.querySelector("#save-latex").addEventListener("click",()=>{
    if(state==state.DIS) return;
    let data = ""
    for(let content of interactiveField.children){
        data += contentTeX[content.hashId]+"\\par\n"
    }
    data = data.replace("\\(","$").replace("\\)","$");
    download(latexWrap(data), "if-project.tex", "tex");
});

document.querySelector("#save-image").addEventListener("click",()=>{
    if(state==state.DIS) return;
    state.disable=true;
    html2canvas(interactiveField).then( (canvas) => {
            screenshot.appendChild(canvas);
            shotBox.style.display = "block";
    });
});

document.querySelector("#cancel-shot").addEventListener("click", ()=>{
    state.disable = false;
    shotBox.style.display = "none";
    screenshot.innerHTML = "";
});

document.querySelector("#save-shot").addEventListener("click", ()=>{
    download(screenshot.firstChild, "if-screenshot", "canvas");
    document.querySelector("#cancel-shot").click();
});
