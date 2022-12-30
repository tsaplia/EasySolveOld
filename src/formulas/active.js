
let _activeTypes = {
    mult: 0,
    term: 1,
    formula: 2,
};

/**
 * Returns type of active element
 * @param {MathStructure} struct active element
 * @return {number} active element type id
 */
function _getActiveType(struct) {
    if (struct instanceof Formula) {
        return _activeTypes.formula;
    } if (struct instanceof Term) {
        return _activeTypes.term;
    } if (struct instanceof MathStructure) {
        return _activeTypes.mult;
    }
    throw new Error("Struct must be MathStructure instance");
}

/**
 * Is it possible to work with formulas
 * @return {boolean}
 */
function _stateCheck() {
    return [states.formula, states.none, states.formulaFocus].includes(state);
}


/**
 * Set selected element
 * @param {ActiveFormula} active description of selected element
 */
function setActive(active) {
    deleteActiveAll();
    _setStyle(active);
    activeFormulas.push(active);

    if (state==states.none) state = states.formula;
}

/**
 * Add element to selected list
 * @param {ActiveFormula} active description of selected element
 */
function addActive(active) {
    for (let key in active) {
        deleteActive(active[key]);
    }

    _setStyle(active);
    activeFormulas.push(active);
    if (state==states.none) state = states.formula;
}

/**
 * set css class to html element depending on the activeType
 * @param {ActiveFormula} active selected element
 */
function _setStyle(active) {
    switch (_getActiveType(active.main)) {
    case _activeTypes.formula:
        active.HTML.classList.toggle("active-formula");
        break;
    case _activeTypes.term:
        active.HTML.classList.toggle("active-term");
        break;
    case _activeTypes.mult:
        active.HTML.classList.toggle("active-mult");
        break;
    }
}

/**
 * Remove element from selected
 * @param {MathStructure} elem
 */
function deleteActive(elem) {
    for (let i = 0; i < activeFormulas.length; i++) {
        if (activeFormulas[i].main == elem) {
            _setStyle(activeFormulas[i]);
            activeFormulas.splice(i, 1);
            break;
        }
    }
    if(activeFormulas.length == 0 && state!=states.formulaFocus) state = states.none;
}

/**
 * Remove all selected elements
 */
function deleteActiveAll() {
    for (let obj of activeFormulas) {
        _setStyle(obj);
    }

    activeFormulas = [];
}

/**
 * Is element selected
 * @param {MathStructure} elem  checked element
 * @param {string} [param = "main" ] one of Active properties in witch
 * @return {boolean}
 */
function _isActive(elem, param = "main") {
    for (let obj of activeFormulas) {
        if (obj[param] == elem) {
            return true;
        }
    }
    return false;
}

/**
 * Add a handler and save it depending on the state
 * @param {HTMLElement} elem
 * @param {EventHandlerFunc} func
 */
function _addHandler(elem, func) {
    elem.addEventListener("click", func);
    if (state == states.formulaFocus && focusFormulaConfig.path.HTML.contains(elem)) {
        focusFormulaConfig.handlers.push({target: elem, func: func});
    }
}

/**
 * Set click handler for multiplier
 * @param {MathStructure} mult
 * @param {HTMLElement} elem
 */
function multiplierHandler(mult, elem) {
    _addHandler(elem, (event) => {
        if (!_stateCheck() || (state == states.formulaFocus && mult==focusFormulaConfig.path.mult)) return;

        if (_isActive(mult)) {
            deleteActive(mult);
            event.stopPropagation();
            return;
        };

        event.clickDescription = {
            main: mult,
            HTML: elem,
            mult: mult,
        };
    });
}

/**
 * Set click handler for term
 * @param {Term} term
 * @param {HTMLElement} elem
 */
function termHandler(term, elem) {
    _addHandler(elem, (event) => {
        if (!_stateCheck()) return;

        if (event.clickDescription) {
            if (!_isActive(term, "term")) {
                event.clickDescription.main = term;
                event.clickDescription.HTML = elem;
                delete event.clickDescription.mult;
            }
        } else {
            event.clickDescription = {
                main: term,
                HTML: elem,
            };
        }
        event.clickDescription.term = term;

        if (event.clickDescription.main == term && _isActive(term)) {
            deleteActive(term);
            event.stopPropagation();
        }
    });
}

/**
 * Set click handler for formula
 * @param {Formula} formula
 * @param {HTMLElement} elem
 */
function formulaHandler(formula, elem) {
    _addHandler(elem, (event) => {
        if (!_stateCheck()) return;
        event.stopPropagation();

        if (!event.clickDescription) {
            event.clickDescription = {
                main: formula,
                HTML: elem,
            };
        }
        event.clickDescription.formula = formula;

        if (event.clickDescription.main == formula && _isActive(formula)) {
            deleteActive(formula);
            return;
        }

        if (event.shiftKey) {
            addActive(event.clickDescription);
        } else {
            setActive(event.clickDescription);
        }
    });
}


