export interface IDefaultNodeMethod<T> {
    (type: string, children: Array<T>): T;
};

export interface INodeMethod<T> {
    (children: Array<T>): T;
};

export interface ITerminalMethod<T> {
    (value: string): T;
};

export interface INodeSet<T> {
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

export interface IFeature<T> {
    name: string;
    productions(): IProductionSet;
    nodes(): INodeSet<T>;
};

export interface IFeatureSet<T> {
    push(IFeature);
    all(): IFeature<T>[];
};