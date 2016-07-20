import {Language} from './languages';
import {INode} from './interfaces';

interface INodeFormatterMethod<T extends INode> {
    (instance: T, format: (instance: T) => string): string;
};

export class Formatter<T extends INode> {
    private _language: Language<T>;
    private _matchers: {[type: string]: INodeFormatterMethod<T>};

    constructor(language: Language<T>) {
        this._language = language;
        this._matchers = {};
    };

    on(types: string|string[], method: INodeFormatterMethod<T>) {
        if(typeof types === 'string') {
            this._matchers[types] = method;
        } else {

        for(let type of types) {
            this._matchers[type] = method;
        }
    }
    };

    format(tree: T): string {
        let formatInstance = (instance: T): string => {
            if(instance.type in this._matchers) {
                return this._matchers[instance.type](instance, this.format.bind(this));

            } else {
                return instance.toString();
            }
        };

        return formatInstance(tree);
    };

};