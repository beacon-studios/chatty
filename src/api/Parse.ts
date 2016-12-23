import {Language} from './Language';
import {Processor as EarleyProcessor} from '../earley';
import {INode, INodeOptions} from '../interfaces';
import {Node} from './Node';
import {TerminalNode} from './TerminalNode';

export class Parse {
  private _parser: Language;
  private _processor: EarleyProcessor;

  constructor(parser: Language, processor: EarleyProcessor) {
    this._parser = parser;
    this._processor = processor;
  }

  completed(): boolean {
    return this._processor.completed();
  }

  tree(): INode {
    let nodes = this._parser.nodes();

    let walk = function(type: string, children: Array<INode>): INode {
      let factory = nodes.get(type);
      let opts = {};
      if(factory) {
        return factory(type, children, opts) ||  new Node(type, children, opts);

      } else {
        return new Node(type, children, opts);
      }
    }

    return this._processor.tree(walk, (value: string, opts: INodeOptions) => new TerminalNode(value, opts));
  }

};
