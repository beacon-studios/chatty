import {Language, Feature, ProductionReference, Production, FeatureSet, ProductionSet, NodeSet} from './languages';
import {INode} from './interfaces';
import {Formatter} from './patterns';
export {INode} from './interfaces';

export class Parser {
    private _languages: {[name: string]: Language<Node>};

    constructor() {
        this._languages = {};
    };

    language(name: string): Language<Node> {
        if(name in this._languages) {
            return this._languages[name];

        } else {
            let language = new Language<Node>(name, new ProductionSet(), new NodeSet<Node>(), new FeatureSet<Node>());
            this._languages[name] = language;
            return language;
        }
    };
    
    formatter(language: string): Formatter<Node> {
        if(language in this._languages) {
            return new Formatter<T>(<Language<T>> this._languages[language]);

        } else {
            throw new Error('language "' + language + '" not found');
        }
    };
};

export class TerminalNode implements INode {
    private _value: string;
    get type(): string { return 'TERMINAL'; };
    get children(): INode[] { return []; };

    constructor(value: string) {
        this._value = value;
    };

    toString(): string {
        return this._value;
    };
};

export class Node implements INode {
    private _type: string;
    private _children: INode[];
    get type() { return this._type; };
    get children() { return this._children; };

    constructor(language: Language, type: string, children: INode[]) {
        this._type = type;
        this._children = children;
    };

    toString(): string {
        return this._children.map((child) => child.toString()).join('');
    };

};