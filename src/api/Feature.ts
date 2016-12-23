import {INode, IFeature, INodeSet, IProductionSet} from '../interfaces';

export class Feature implements IFeature {
    private _name: string;
    private _productions: IProductionSet;
    private _nodes: INodeSet;

    get name() { return this._name; };

    constructor(name: string, productions: IProductionSet, nodes: INodeSet) {
        this._name = name;
        this._productions = productions;
        this._nodes = nodes;
    };

    productions(): IProductionSet {
        return this._productions;
    };

    nodes(): INodeSet {
        return this._nodes;
    };
};
