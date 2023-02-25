const PRECISION = 3;
function _toPrecision(num){
    return Number.parseFloat(num.toPrecision(PRECISION));
}
/**
 * @param {Block} block 
 * @returns {string}
 */
function calculate(block){
    let res = _toPrecision(calcBlock(block));
    if(Math.abs(res)==Infinity || isNaN(res)) throw new Error("Can not calculate given expression!"); 
    let exp = Number(res.toExponential().match(/e(.+)/)[1]);
    exp = Math.sign(exp)*Math.floor((Math.abs(exp)+1)/3)*3
    let base = _toPrecision(res/10**exp);
    return base.toString() + (exp?`\\cdot 10^{${exp}}`:"");
}

function calcBlock(block){
    return block.content.reduce((acc, cur)=>acc+calcTerm(cur), 0);
}
   
function calcTerm(term){
    return Number(term.sign+"1")*term.content.reduce((acc, cur)=>acc*calcMult(cur),1);
}

function calcMult(mult){
    if(mult instanceof Block)return calcBlock(mult);
    if(mult instanceof Frac) return calcFrac(mult);
    if(mult instanceof Power)return calcPower(mult);
    if(mult instanceof Sqrt)return calcSqrt(mult);
    if(mult instanceof Func) return calcFunc(mult);
    if(mult instanceof Num) return mult.value;
}

function calcFrac(frac){
    return calcTerm(frac.numerator) / calcTerm(frac.denomerator);
}

function calcPower(power){
    return calcMult(power.base)**calcMult(power.exponent);
}

function calcSqrt(sqrt){
    let base = calcMult(sqrt.content), root = calcBlock(sqrt.root).toFixed(1)-0;
    if(!Number.isInteger(root)) return NaN;
    if(root%2 && base<0) return -((-base)**(1/root));
    return base**(1/root);
}

function calcFunc(func){
    let num = calcBlock(func.content);
    if(!func.name.toString().startsWith("arc")) num *=Math.PI/180;
    let res = availibleMathFunc[func.name](num);
    return res>1000?Infinity:res;
}
