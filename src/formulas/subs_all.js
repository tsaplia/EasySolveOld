function subsBlock(block){
 return new Block(block.content.map(term=>subsTerm(term)));
}

function subsTerm(term){
    return new Term(term.content.map(mult=>subsMult(mult)),term.sign);
}

function subsMult(mult){
    if(mult instanceof Block)return subsBlock(mult);
    if(mult instanceof Frac) return subsFrac(mult);
    if(mult instanceof Power)return subsPower(mult);
    if(mult instanceof Sqrt)return subsSqrt(mult);
    if(mult instanceof Func) return subsFunc(mult);
    if(mult instanceof Variable)return subsVariable(mult);
    if(mult instanceof Num) return mult;
}

function subsFrac(frac){
    return new Frac(subsTerm(frac.numerator), subsTerm(frac.denomerator));
}

function subsPower(power){
    return new Power(subsMult(power.base), subsMult(power.exponent));
}

function subsSqrt(sqrt){
    return new Sqrt(subsMult(sqrt.content), subsBlock(sqrt.root));
}

function subsFunc(func){
    return new Func(func.name, subsBlock(newFunc.content));
}

function subsVariable(variable){
    if(!IFVariables[variable.toTex()]) return variable;

    let mult = IFVariables[variable.toTex()];
    if(mult.content.length==1 && mult.content[0].content.length==1 && mult.content[0].sign=="+") {
        mult = mult.content[0].content[0];
    }
    return mult;
}
