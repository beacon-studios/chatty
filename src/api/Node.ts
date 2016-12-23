import {INode, INodeOptions} from '../interfaces';

export class Node implements INode {
  public literal: boolean;

  constructor(public type: string, public children: INode[], private _opts: INodeOptions) {
    this.literal = false;
  }

  toString() {
    return this.children.map(child => child.toString()).join('');
  }

};
