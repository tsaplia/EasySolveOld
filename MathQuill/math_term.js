function Term(content, sign = "+") {
    this.sign = sign; // plus(+) or minus(-)
    this.content = content; // array of structures like Variable, Funk, Frac...

    this._isFraction = () => this.content.length == 1 && this.content[0] instanceof Frac;

    this.changeSign = function() {
        this.sign = this.sign=="+" ? "-": "+";
    };

    this.allMultipliers = function() {
        let multipliers = [];

        getBlockMultipliers = (block) => {
            let multipliers = [];

            if (block.content.length == 1) {
                block.content[0].content.forEach((elem) => {
                    multipliers.push(elem);
                });
            } else {
                multipliers.push(block);
            }

            return multipliers;
        };

        for (let item of this.content) {
            if (!(item instanceof Frac)) {
                multipliers.push(item);
                continue;
            }

            multipliers.push(...getBlockMultipliers(item.numerator),
                ...getBlockMultipliers(item.denomerator));
        }

        return multipliers;
    };

    this._removeExtraBlocks = function(start = 0, end = this.content.length) {
        let modified = false;
        for (let i = start; i < end; i ++) {
            let term = this.content[i];
            if (!(term instanceof Block)) continue;

            if (term.content.length == 1) {
                this.content.splice(this.content.indexOf(term), 1, ...term.content[0].content);
                modified = true;
            }
        }

        return modified;
    };

    this.mul = function(...items) {
        for (let item of items) {
            if (item instanceof Term) {
                this.content.push(...item.content);

                if (item.sign == "-") this.changeSign();
            } else {
                this.content.push(item);
            }
        }
    };

    this.devide = function(...items) {
        this.transformToFrac();

        let numerator = this.content[0].numerator;
        let denomerator = this.content[0].denomerator;

        for (let item of items) {
            if (item instanceof Term) {
                if (item.sign == "-") {
                    this.changeSign();
                }
                this.devide(...item.content);
            } else if (item instanceof Frac) {
                denomerator.content[0].content.push(item.numerator);
                numerator.content[0].content.push(item.denomerator);
            } else {
                denomerator.content[0].content.push(item);
            }
        }

        numerator.content[0]._removeExtraBlocks();
        denomerator.content[0]._removeExtraBlocks();

        if (denomerator.toTex() === "1") {
            this.content = numerator.content[0];
        }
    };

    this.transformToFrac = function() {
        if (this._isFraction()) return;

        let denomerator = new Block([new Term([])]);
        let numerator = new Block([new Term([])]);

        for (let item of this.content) {
            if (item instanceof Frac) {
                denomerator.content[0].content.push(item.denomerator);
                numerator.content[0].content.push(item.numerator);
            } else {
                numerator.content[0].content.push(item);
            }
        }
        numerator.content[0]._removeExtraBlocks();
        denomerator.content[0]._removeExtraBlocks();

        if (!denomerator.content[0].content.length) {
            denomerator.content[0].content.push(new Num(1));
        }

        this.content = [new Frac(numerator, denomerator)];
    };

    this._removeFractions = function() {
        for (let i=0; i<this.content.length; i++) {
            let item = this.content[i];

            if (!(item instanceof Frac)) continue;

            this.content.splice(i, 1, item.numerator);

            if (item.denomerator.content.length > 1) {
                this.content.push(new SupSub(item.denomerator), upperIndex = Block.wrap(new Num(1), "-"));
                continue;
            }

            item.denomerator.content[0]._removeExtraBlocks();
            item.denomerator.content[0].content.forEach((elem)=>{
                let newStruct;
                if (elem instanceof SupSub) {
                    newStruct = new SupSub(elem.base, elem.upperIndex.copy());
                    newStruct.upperIndex.changeSignes();
                } else {
                    newStruct = new SupSub(elem, Block.wrap(new Num(1), "-"));
                }
                this.content.push(newStruct);
            });
        }
        this._removeExtraBlocks();
    };

    this.toTex = function() {
        let str = "";
        for (let i = 0; i < this.content.length; i++) {
            if (!isNaN(this.content[i].toTex()[0]) && i > 0) {
                str += "\\cdot ";
            }
            if (this.content[i] instanceof Block) {
                str += `\\left(${this.content[i].toTex()}\\right)`;
            } else {
                str += this.content[i].toTex();
            }
        }
        console.assert(this.content.length, "Empty term content");
        return str;
    };

    this.isEqual = function(other) {
        if (this.sign != other.sign || !(other instanceof Term) ||this.content.length != other.content.length) {
            return false;
        }

        for (let i = 0; i < this.content.length; i++) {
            if (!this.content[i].isEqual(other.content[i])) return false;
        }

        return true;
    };

    this.isSame = function(other) {
        if (!(other instanceof Term)) return false;

        let thisProto = this._getComparativeProto();
        let otherProto = other._getComparativeProto();

        return thisProto.isEqual(otherProto);
    };

    this._getComparativeProto = function() {
        let proto = new Term([...this.content]);

        proto.transformToFrac();
        proto.deleteNumbersDeep();
        proto.content[0].numerator.content[0]._sort();
        proto.content[0].denomerator.content[0]._sort();

        return proto;
    };

    this.copy = function() {
        return new Term([...this.content], this.sign);
    };

    this.simplify = function() {
        this._removeExtraBlocks();
        this._removeFractions();
        this._createPowers();
        this._convertNegativePowers();

        if (!this._isFraction()) {
            this._removeExtraPowers();
        } else {
            this.content[0].numerator.content[0]._removeExtraPowers();
            this.content[0].denomerator.content[0]._removeExtraPowers();
        }

        this.mergeNumbers();

        if (this._isFraction()) {
            this.content[0].numerator._removeExtraBlocks();
            this.content[0].denomerator._removeExtraBlocks();

            if (this.content[0].denomerator.toTex()=="1") {
                this.content = [this.content[0].denomerator];
            }
        }

        this._removeExtraBlocks();
    };

    this._createPowers = function() {
        this._sort();

        for (let i=0; i < this.content.length - 1; i++) {
            let currrentBase; let nextBase; let currentPow; let nextPow;

            [currrentBase, currentPow] = SupSub.getPower(this.content[i]);
            [nextBase, nextPow] = SupSub.getPower(this.content[i+1]);

            if ( ! currrentBase.isEqual(nextBase)) continue;

            let sumPow = currentPow.copy();
            sumPow.add(nextPow);
            sumPow.simplify();

            this.content.splice(i, 2, new SupSub(currrentBase, sumPow));
            i--;
        }
    };

    this.deleteNumbers = function() {
        this._removeExtraBlocks();

        let prod = 1;

        for (let i=0; i<this.content.length; i++) {
            if (this.content[i] instanceof Num) {
                prod *= this.content[i].value;
                this.content.splice(i, 1);
                i--;
            }
        }

        if (!this.content.length) {
            this.content.push(new Num(1));
        }

        return prod;
    };

    this.deleteNumbersDeep = function() {
        this._removeExtraBlocks();

        let denomProd = 1;
        let numProd = 1;

        for (let i=0; i<this.content.length; i++) {
            if (this.content[i] instanceof Num) {
                numProd *= this.content[i].value;
                this.content.splice(i, 1);
                i--;
            }
            if (!(this.content[i] instanceof Frac)) continue;

            this.content[i] = this.content[i].copy();
            if (this.content[i].numerator.content.length == 1) {
                numProd *= this.content[i].numerator.content[0].deleteNumbers();
            }
            if (this.content[i].numerator.content.length == 1) {
                denomProd *= this.content[i].denomerator.content[0].deleteNumbers();
            }
        }

        return [numProd, denomProd];
    };


    this.mergeNumbers = function() {
        this.insertCoef(...this.deleteNumbersDeep());
        this.emptyContentCheck();
    };


    this.insertCoef = function(numProd, denomProd) {
        if (denomProd == 1 && numProd == 1) return;

        if (this._isFraction()) {
            if (numProd != 1) {
                this.content[0].numerator.content[0].unshift(new Num(numProd));
            }
            if (denomProd != 1) {
                this.content[0].denomerator.content[0].unshift(new Num(denomProd));
            }
        } else {
            if (denomProd == 1) {
                this.content.unshift(new Num(numProd));
            } else {
                this.content.unshift(new Frac( Block.wrap(new Num(numProd)), Block.wrap(new Num(denomProd))));
            }
        }
    };

    this.getRatio = function() {
        return this.copy().deleteNumbersDeep();
    };

    this._sort = function() {
        this.content.sort( (a, b) => {
            return a.toTex() < b.toTex() ? -1: 1;
        });
    };

    this._removeExtraPowers = function() {
        for (let i = 0; i < this.content.length; i++) {
            if (!(this.content[i] instanceof SupSub)) continue;

            if (this.content[i].upperIndex.toTex() == "1") {
                this.content.splice(i, 1, this.content[i].base);
            } else if (this.content[i].upperIndex.toTex()=="0" || this.content[i].base.toTex()=="1") {
                this.content.splice(i, 1, new Num(1));
            }
        }
    };

    this._convertNegativePowers = function() {
        let denomerator = new Term([]);
        let numerator = new Term([]);

        for (let item of this.content) {
            if (item instanceof SupSub && item.upperIndex.content[0].sign == "-") {
                let newPower = item.upperIndex.copy();
                newPower.changeSignes();
                denomerator.content.push(new SupSub(item.base, newPower));
            } else {
                numerator.content.push(item);
            }
        }

        if (!numerator.content.length) {
            numerator.content.push(new Num(1));
        }

        if (denomerator.content.length > 0) {
            this.content = [new Frac(new Block([numerator]), new Block([denomerator]))];
        } else {
            this.content = numerator.content;
        }
    };

    this.emptyContentCheck = function() {
        if (this._isFraction()) {
            if (!this.content[0].numerator.content[0].content.length) {
                this.content[0].numerator.content[0].content.push(new Num(1));
            }
            if (!this.content[0].denomerator.content[0].content.length) {
                this.content[0].denomerator.content[0].content.push(new Num(1));
            }
        } else {
            if (!this.content.length) {
                this.content.push(new Num(1));
            }
        }
    };
}

Term.fromHTML = function(elem) {
    let content = [];
    let sign = "+";

    for (let child of elem.children) {
        if (child.classList.contains(classNames.breacker)) {
            sign = child.innerHTML.replace(specialSymbols.minus.sym, "-");
            continue;
        }

        if (child.classList.contains(classNames.operator)) continue;

        content.push(getMathStructure(child));
    }

    let term = new Term(content, sign);
    term.HTMLElement = elem;
    return term;
};