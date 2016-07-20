export interface INode {
    type: string;
    complete: boolean;
    children: INode[];
    toString(): string;
};
export interface IDefaultNodeMethod<T extends INode> {
    (type: string|Array<string>, children: Array<T>): T;
};

export interface INodeMethod<T extends INode> {
    (children: Array<T>): T;
};

export interface ITerminalMethod<T extends INode> {
    (value: string): T;
};

export interface INodeSet<T extends INode> {
    get(type: string): INodeMethod<T>;
    attach(type: string, node: INodeMethod<T>);
    lookup(): {[type: string]: INodeMethod<T>};

    terminal: ITerminalMethod<T>;
    default: IDefaultNodeMethod<T>;
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