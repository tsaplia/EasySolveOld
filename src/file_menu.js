function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) 
        window.navigator.msSaveOrOpenBlob(file, filename);
    else {
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
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
    let data = ""
    for(let content of interactiveField.children){
        data += contentTeX[content.hashId]+"\\par\n"
    }
    data = data.replace("\\(","$").replace("\\)","$");
    download(latexWrap(data), "if-project.tex", "tex");
});