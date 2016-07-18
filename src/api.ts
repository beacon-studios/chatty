import {Language, Feature, ProductionReference, Production, FeatureSet, ProductionSet, NodeSet} from './languages';
import {INode} from './interfaces';
export {Node} from './languages';

export class Parser {
    private _languages: {[name: string]: Language<any>};

    constructor() {
        this._languages = {};
    };

    language<T extends INode>(name: string): Language<T> {
        let language = new Language<T>(name, new ProductionSet(), new NodeSet<T>(), new FeatureSet<T>());
        this._languages[name] = language;
        return language;
    };
};