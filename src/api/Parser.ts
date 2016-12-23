import {Language} from './Language';
import {FeatureSet} from './FeatureSet';
import {ProductionSet} from './ProductionSet';
import {NodeSet} from './NodeSet';
import {Formatter} from '../patterns';

export class Parser {
    private _languages: {[name: string]: Language};

    constructor() {
      this._languages = {};
    };

    language(name: string): Language {
      if(name in this._languages) {
        return this._languages[name];

      } else {
        let language = new Language(name, new ProductionSet(), new NodeSet(), new FeatureSet());
        this._languages[name] = language;
        return language;
      }
    }

    formatter(language: string): Formatter {
      if(language in this._languages) {
        return new Formatter(this._languages[language]);

      } else {
        throw new Error('language "' + language + '" not found');
      }
    }
};
