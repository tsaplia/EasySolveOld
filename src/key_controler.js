document.addEventListener("keydown", (event)=>{
    if (state==state.DIS) return;
    if(!event.altKey || !event.ctrlKey) return;
    console.log("1")
    switch (event.code){
        case "KeyF":
            document.querySelector(".insert-formula-btn").click();
        case "KeyT":
            document.querySelector(".insert-text-btn").click();
    }
})

document.addEventListener("keydown", (event) => {
    if (state!=state.DIS) return;
    if(event.code != "Enter") return;
    if(currentInput==formulaInputField){
        document.querySelector(".formula-ready").click();
    }else if(currentInput==mathInputField){
        document.querySelector(".text-ready").click();
    }
})