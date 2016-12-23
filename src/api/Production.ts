import {ProductionReference} from './ProductionReference';
import {IProduction, RuleSymbol} from '../interfaces';

export class Production implements IProduction {
    public name: string;
    public rules: Array<Array<RuleSymbol>>;

    constructor(name: string) {
        this.name = name;
        this.rules = [];
    };

    push(rule: Array<RuleSymbol>): Production {
        this.rules.push(rule);
        return this;
    };

};
