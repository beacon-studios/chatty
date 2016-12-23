import {INode, INodeSet, INodeMethod, IDefaultNodeMethod} from '../interfaces';
import {Node} from './Node';
import {TerminalNode} from './TerminalNode';

export class NodeSet implements INodeSet {
  private _nodes: {[type: string]: INodeMethod};

  constructor() {
    this._nodes = {};
  }

  get(type: string): INodeMethod {
    return (type in this._nodes) ? this._nodes[type] : null;
  }

  attach(types: string|Array<string>, node: INodeMethod) {
    if(typeof types === 'string') {
      this._nodes[types] = node;

    } else {
      for(let type of types) {
        this._nodes[type] = node;
      }
    }
  }
};
