export interface IVisitor<T> {
  visit(node: INode, children: T[]): T;
};

export interface INode {
  literal: boolean;
  type: string;
  children: INode[];
  toString(): string;
};

export interface IDefaultNodeMethod {
  (type: string|Array<string>, children: Array<INode>, opts: INodeOptions): INode;
};

export interface INodeOptions {

};

export interface INodeMethod {
  (type: string, children: Array<INode>, opts: INodeOptions): INode;
};

export interface ITerminalMethod {
  (value: string, opts: INodeOptions): INode;
};

export interface INodeFormatterMethod {
  (instance: INode, format: (instance: INode) => string): string;
};

export interface INodeSet {
  get(type: string): INodeMethod;
  attach(type: string, node: INodeMethod);
};

export interface IProductionReference {
  name: string;
  identify(): string;
};

export type RuleSymbol = IProductionReference|RegExp|string;

export interface IProduction {
  name: string;
  rules: Array<Array<RuleSymbol>>;
  push(...rules: Array<Array<RuleSymbol>>): IProduction;
};

export interface IProductionSet {
  push(IProduction): IProductionSet;
  first(): IProduction;
  all(): IProduction[];
};

export interface IFeature {
  name: string;
  productions(): IProductionSet;
  nodes(): INodeSet;
};

export interface IFeatureSet {
  push(IFeature);
  all(): IFeature[];
};
