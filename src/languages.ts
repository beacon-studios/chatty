import {EarleyParser} from './earley';
import {INode, INodeMethod, INodeSet, IProductionReference, IProduction, IProductionSet, IFeature, IFeatureSet} from './interfaces';

export class NodeSet<T extends INode> {
    private _terminal: INodeMethod<T>;
    private _nodes: {[type: string]: INodeMethod<T>};

    constructor() {
        this._nodes = {};
    };

    attach(type: string, node: INodeMethod<T>) {
        this._nodes[type] = node;
    };

    lookup(): {[type: string]: INodeMethod<T>} {
        return this._nodes;
    };

    terminal(method: INodeMethod<T>) {
        this._terminal = method;
    };
};

export class ProductionReference implements IProductionReference {
    private _name: string;

    get name() { return this._name; };

    constructor(name: string) {
        this._name = name;
    };

    identify(): string {
        return '<' + this.name + '>';
    };
};

export class Production implements IProduction {
    private _name: string;
    private _rules: Array<Array<ProductionReference|RegExp|string>>;

    get name() { return this._name; };
    get rules() { return this._rules; };

    constructor(name: string) {
        this._name = name;
        this._rules = [];
    };

    push(...rules: Array<Array<ProductionReference|RegExp|string>>): Production {
        this._rules.push(...rules);
        return this;
    };

};

export class ProductionSet implements IProductionSet {
    private _productions: {[name: string]: IProduction};

    constructor() {
        this._productions = {};
    };
    push(production: IProduction) {
        if(production.name in this._productions) {
            this._productions[production.name].push(...production.rules);

        } else {
            this._productions[production.name] = production;
        }

        return this;
    };

    all(): IProduction[] {
        return Object.keys(this._productions).map((k) => this._productions[k]);
    };
};

export class Feature<T extends INode> implements IFeature<T> {
    private _name: string;
    private _productions: IProductionSet;
    private _nodes: INodeSet<T>;

    get name() { return this._name; };

    constructor(name: string, productions: IProductionSet, nodes: INodeSet<T>) {
        this._name = name;
        this._productions = productions;
        this._nodes = nodes;
    };

    productions(): IProductionSet {
        return this._productions;
    };

    nodes(): INodeSet<T> {
        return this._nodes;
    };
};

export class FeatureSet<T extends INode> implements IFeatureSet<T> {
    private _features: {[name: string]: IFeature<T>};

    constructor() {
        this._features = {};
    };
    push(feature: IFeature<T>) {
        this._features[feature.name] = feature;
    };

    all(): IFeature<T>[] {
        return Object.keys(this._features).map((k) => this._features[k]);
    };
};

export class Node implements INode {
    private _type: string;
    private _children: Array<INode|string>;
    get length(): number { return this._children.reduce((val, c) => val + c.length, 0); };

    constructor(type: string, children: Array<INode|string>) {
        this._type = type;
        this._children = children;
    };
};

export class Language<T extends INode> {
    private _name: string;
    private _productions: IProductionSet;
    private _nodes: INodeSet<T>;
    private _features: IFeatureSet<T>;

    constructor(name: string, productions: IProductionSet, nodes: INodeSet<T>, features: IFeatureSet<T>) {
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

    nodes(): INodeSet<T> {
        return this._nodes;
    };

    parse(source: string, entrypoint: string) {
        let parser = new EarleyParser();
        let productions = this._productions.all();
        let nodes = this._nodes.lookup();

        for(let production of this._productions.all()) {
            for(let rule of production.rules) {
                parser.addRule(production.name, rule);
            }
        }

        let walk = function(type: string, children: Array<T|string>): T {
            if(type in nodes) {
                return nodes[type](children) || new defaultClass(type, children);

            } else {
                return new defaultClass(type, children);
            }
        }

        let processor = parser.parse(entrypoint, source);
        return processor.tree<T>(walk);
    };

};