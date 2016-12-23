import {Node} from './Node';
import {INodeOptions} from '../interfaces';

export class TerminalNode extends Node {
    private _value: string;

    constructor(value: string, opts: INodeOptions) {
        super('$', [], opts);
        this._value = value;
        this.literal = true;
    }

    toString() {
        return this._value;
    }
};
