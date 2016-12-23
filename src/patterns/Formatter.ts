import {Language} from '../api';
import {INode, INodeFormatterMethod} from '../interfaces';

export class Formatter {
  private _language: Language;
  private _matchers: {[type: string]: INodeFormatterMethod};

  constructor(language: Language) {
    this._language = language;
    this._matchers = {};
  }

  on(types: string|string[], method: INodeFormatterMethod) {
    if(typeof types === 'string') {
      this._matchers[types] = method;

    } else {
      for(let type of types) {
        this._matchers[type] = method;
      }
    }
  }

  format(tree: INode): string {
    let formatInstance = (instance: INode): string => {
      if(instance.type in this._matchers) {
        return this._matchers[instance.type](instance, this.format.bind(this));

      } else {
        return instance.toString();
      }
    };

    return formatInstance(tree);
  }

};
