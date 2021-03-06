import {EarleyParser, EarleyProcessor} from './earley';
import {INode, INodeMethod, IDefaultNodeMethod, ITerminalMethod, INodeSet, IProductionReference, IProduction, IProductionSet, IFeature, IFeatureSet} from './interfaces';

export class NodeSet<T extends INode> implements INodeSet<T> {
    private _terminal: ITerminalMethod<T>;
    private _default: IDefaultNodeMethod<T>;
    private _nodes: {[type: string]: INodeMethod<T>};

    get default(): IDefaultNodeMethod<T> { return this._default; };
    set default(method: IDefaultNodeMethod<T>) { this._default = method; };
    get terminal(): ITerminalMethod<T> { return this._terminal; };
    set terminal(method: ITerminalMethod<T>) { this._terminal = method; };

    constructor() {
        this._nodes = {};
    };

    get(type: string): INodeMethod<T> {
        return (type in this._nodes) ? this._nodes[type] : null;
    };

    attach(types: string|Array<string>, node: INodeMethod<T>) {
        if(typeof types === 'string') {
            this._nodes[types] = node;

        } else {
            for(let type of types) {
                this._nodes[type] = node;
            }
        }
    };

    lookup(): {[type: string]: INodeMethod<T>} {
        return this._nodes;
    }
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

export class Rule implements IRule {

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

export class Parse<T extends INode> {
    private _parser: Language<T>;
    private _processor: EarleyProcessor;

    constructor(parser: Language<T>, processor: EarleyProcessor) {
        this._parser = parser;
        this._processor = processor;
    };

    completed(): boolean {
        return this._processor.completed();
    };

    tree(): T {
        let nodes = this._parser.nodes();
        let def = nodes.default || function(type:string, children: Array<T>): T {
            let types = children.map((child) => 'name' in child.constructor ? child.constructor['name'] : '<anonymous>');
            throw new Error('could not create node of type "' + type + '" with ' + children.length + ' children of types: ' + types);
        };

        let walk = function(type: string, children: Array<T>): T {
            let factory = nodes.get(type);
            if(factory) {
                return factory(children) ||  def(type, children);

            } else {
                return def(type, children);
            }
        }

        return this._processor.tree<T>(walk, nodes.terminal);
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
        for(let production of this._productions.all()) {
            for(let rule of production.rules) {
                parser.addRule(production.name, rule);
            }
        }

        let processor = parser.parse(entrypoint, source);
        return new Parse<T>(this, processor);
    };

};