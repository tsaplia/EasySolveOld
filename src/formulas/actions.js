/**
 * Wrap changed parts depending on the equality mode and focus mode
 * @param {Block} newPart equlity part
 * @param {ActiveFormula} active
 * @param {boolean} focused
 * @return {Formula}
 */
function _wrapPart(newPart, active, focused=false) {
    if (focused) {
        newPart = active.formula.substituteMultiplier(active.mult, active.term, new Formula([newPart]));
        return _wrapPart(newPart, active);
    }
    if(newPartMode==newPartModes.addToEnd){
        active.formula.equalityParts.push(newPart);
        return active.formula.copy();
    }
    return active.formula.copyWithModifiedPart(newPart, active.term);
}

/**
 * Insert formula to IF depanding on newPartMode
 * @param {Formula} formula 
 * @param {HTMLElement} activeHTML rendered active elment
 */
function _addFormula(formula, activeHTML){
    if(newPartMode == newPartModes.newLine){
        insertFormula(formula);
    }else{
        replaceFormula(formula, activeHTML);
    }
}

let formulaActions = [
    {
        buttonId: "separate-btn",
        check() {
            return activeFormulas[0].formula.equalityParts.length >= 2 && activeFormulas.length == 1 &&
                (_getActiveType(activeFormulas[0].main) == _activeTypes.term ||
                _getActiveType(activeFormulas[0].main) == _activeTypes.mult);
        },
        caller() {
            if (_getActiveType(activeFormulas[0].main) == _activeTypes.term) {
                insertFormula( activeFormulas[0].formula.separateTerm(activeFormulas[0].main));
            }else{
                insertFormula(activeFormulas[0].formula.separateMultiplier(activeFormulas[0].main,
                    activeFormulas[0].term));
            }
        },
    },
    {
        buttonId: "substitute-btn",
        check() {
            return activeFormulas.length == 2 && activeFormulas[0].main.isEqual(activeFormulas[1].main) &&
                activeFormulas[0].formula.isSeparatedTerm(activeFormulas[0].term) &&
                (_getActiveType(activeFormulas[0].main) == _activeTypes.term ||
                (_getActiveType(activeFormulas[0].main) == _activeTypes.mult &&
                activeFormulas[0].formula.isSeparatedMultiplier(activeFormulas[0].main)));
        },
        caller() {
            let newPart;
            if (_getActiveType(activeFormulas[0].main) == _activeTypes.term) {
                newPart = activeFormulas[1].formula.substituteTerm(activeFormulas[1].main,
                    activeFormulas[0].formula);
            } else {
                newPart = activeFormulas[1].formula.substituteMultiplier(activeFormulas[1].main,
                    activeFormulas[1].term, activeFormulas[0].formula);
            }
            let focused = (state == states.formulaFocus &&
                activeFormulas[1].formula.equalityParts[0]==focusFormulaConfig.path.mult);
            _addFormula(_wrapPart(newPart, focused?focusFormulaConfig.path: activeFormulas[1], focused),
                activeFormulas[1].HTML);
        },
    },
    {
        buttonId: "common-denominator-btn",
        check() {
            if (activeFormulas.length<2 || !activeFormulas.every((item) => item.main instanceof Term)) return false;
            let part = activeFormulas[0].formula._getActivePart(activeFormulas[0].main);
            return activeFormulas.every((item) => item.formula._getActivePart(item.main)==part);
        },
        caller() {
            let terms = activeFormulas.map((value) => value.main);
            let newPart = activeFormulas[0].formula.toCommonDenominator(...terms);
            let focused = (state == states.formulaFocus &&
                activeFormulas[0].formula.equalityParts[0]==focusFormulaConfig.path.mult);
            _addFormula(_wrapPart(newPart, focused?focusFormulaConfig.path: activeFormulas[0], focused), 
                activeFormulas[0].HTML);
        },
    },
    {
        buttonId: "open-bracket-btn",
        check() {
            return activeFormulas.length == 1 && activeFormulas[0].main instanceof Block;
        },
        caller() {
            let newPart;
            if(activeFormulas[0].term.content.includes(activeFormulas[0].main)){
                newPart = activeFormulas[0].formula.openBrackets(activeFormulas[0].main, activeFormulas[0].term);
            }else{
                newPart = activeFormulas[0].formula.openBracketsFrac(activeFormulas[0].main, activeFormulas[0].term);
            }
            let focused = (state == states.formulaFocus &&
                activeFormulas[0].formula.equalityParts[0]==focusFormulaConfig.path.mult);
            _addFormula(_wrapPart(newPart, focused?focusFormulaConfig.path: activeFormulas[0], focused), 
                activeFormulas[0].HTML);
        },
    },
    {
        buttonId: "out-bracket-btn",
        check() {
            if (activeFormulas.length<2 || !activeFormulas.every((item) => item.main instanceof Term)) return false;
            let part = activeFormulas[0].formula._getActivePart(activeFormulas[0].main);
            return activeFormulas.every((item) => item.formula._getActivePart(item.main)==part);
        },
        async caller() {
            let multFormula = await formulaInput();
            if (multFormula.equalityParts.length>1) return;
            let multBlock = multFormula.equalityParts[0];
            let terms = [...activeFormulas.map((value) => value.main)];
            let newPart = activeFormulas[0].formula.moveOutOfBracket(terms, multBlock);
            let focused = (state == states.formulaFocus &&
                activeFormulas[0].formula.equalityParts[0]==focusFormulaConfig.path.mult);
            _addFormula(_wrapPart(newPart, focused?focusFormulaConfig.path: activeFormulas[0], focused), 
                activeFormulas[0].HTML);
        },
    },
    {
        buttonId: "multiply-btn",
        check() {
            return _getActiveType(activeFormulas[0].main) == _activeTypes.formula && activeFormulas.length == 1;
        },
        async caller() {
            let multFormula = await formulaInput();
            if (multFormula.equalityParts.length>1) return;
            let multBlock = multFormula.equalityParts[0];

            insertFormula(activeFormulas[0].formula.multiply(multBlock));
        },
    },
    {
        buttonId: "remove-eponent-btn",
        check() {
            return activeFormulas.length==1 && activeFormulas[0].main instanceof Power &&
                activeFormulas[0].formula.isSeparatedMultiplier(activeFormulas[0].main);
        },
        caller() {
            insertFormula(activeFormulas[0].formula.removeExponent(activeFormulas[0].main));
        },
    },
    {
        buttonId: "add-btn",
        check() {
            return activeFormulas.every((item)=> _getActiveType(item.main) == _activeTypes.formula );
        },
        caller() {
            insertFormula(activeFormulas[0].main.add(...activeFormulas.slice(1).map((value) => value.main)));
        },
    },
    {
        buttonId: "substract-btn",
        check() {
            return activeFormulas.length == 2 &&
                activeFormulas.every((item)=>_getActiveType(item.main) == _activeTypes.formula);
        },
        caller() {
            insertFormula(activeFormulas[0].main.subtract(activeFormulas[1].main));
        },
    },
    {
        buttonId: "devide-btn",
        check() {
            return activeFormulas.length == 2 &&
                activeFormulas.every((item)=> _getActiveType(item.main) == _activeTypes.formula );
        },
        caller() {
            insertFormula(activeFormulas[0].main.divide(activeFormulas[1].main));
        },
    },
    {
        buttonId: "focus-btn",
        check() {
            return (state==states.formula && activeFormulas.length==1 && activeFormulas[0].main instanceof Block) ||
                (state == states.formulaFocus);
        },
        caller() {
            if (state==states.formula && activeFormulas.length==1 && activeFormulas[0].main instanceof Block) {
                state = states.formulaFocus;
                document.querySelector(`#${this.buttonId}`).innerHTML = "Remove focus";
                focusFormulaConfig = {
                    path: activeFormulas[0],
                    handlers: [],
                };
                deleteActive(activeFormulas[0].main);
                formulaHandler(new Formula([focusFormulaConfig.path.main]), focusFormulaConfig.path.HTML);
                prepareTerms(focusFormulaConfig.path.HTML, focusFormulaConfig.path.main);
            }else if(state == states.formulaFocus){
                deleteActiveAll();
                state = states.none;
                document.querySelector(`#${this.buttonId}`).innerHTML = "Focus";
                for (let handler of focusFormulaConfig.handlers) {
                    handler.target.removeEventListener("click", handler.func);
                }
                deleteTermGroups(focusFormulaConfig.path.HTML);
                focusFormulaConfig = null;
            }
        },
    }
];
