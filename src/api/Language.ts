import {INode, INodeSet, IFeatureSet, IProductionSet} from '../interfaces';
import {ProductionReference} from './ProductionReference';
import {Production} from './Production';
import {Parser as EarleyParser} from '../earley';
import {Parse} from './Parse';

export class Language {
    private _name: string;
    private _productions: IProductionSet;
    private _nodes: INodeSet;
    private _features: IFeatureSet;

    constructor(name: string, productions: IProductionSet, features: IFeatureSet) {
        this._name = name;
        this._productions = productions;
        this._nodes = nodes;
        this._features = features;
    };

    ref(name: string): ProductionReference {
        return new ProductionReference(name);
    };

    production(name: string): Production {
        let production = new Production(name);
        this.productions().push(production);
        return production;
    };

    productions(): IProductionSet {
        return this._productions;
    };

    nodes(): INodeSet {
        return this._nodes;
    };

    parse(source: string, entrypoint: string) {
        let parser = new EarleyParser();
        for(let production of this._productions.all()) {
            for(let rule of production.rules) {
                parser.addRule(production.name, rule);
            }
        }

        let processor = parser.parse(entrypoint || this._productions.first().name, source);
        return new Parse(this, processor);
    };

};
