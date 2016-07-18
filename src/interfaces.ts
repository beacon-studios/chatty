export interface INode {
    length: number;
};

export interface INodeMethod<T extends INode> {
    (children: Array<T|string>): T;
};

export interface INodeSet<T extends INode> {
    attach(type: string, node: INodeMethod<T>);
    lookup(): {[type: string]: INodeMethod<T>};
    terminal(method: INodeMethod<T>);
};

export interface IProductionReference {
    name: string;
    identify(): string;
};

export interface IProduction {
    name: string;
    rules: Array<Array<IProductionReference|RegExp|string>>;
    push(...rules: Array<Array<IProductionReference|RegExp|string>>): IProduction;
};

export interface IProductionSet {
    push(IProduction): IProductionSet;
    all(): IProduction[];
};

export interface IFeature<T extends INode> {
    name: string;
    productions(): IProductionSet;
    nodes(): INodeSet<T>;
};

export interface IFeatureSet<T extends INode> {
    push(IFeature);
    all(): IFeature<T>[];
};