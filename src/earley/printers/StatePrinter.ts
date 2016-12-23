import {Pushdown, Item} from '../parsing';

type StatePrinterModes = 'start' | 'current';

export class StatePrinter {

  print(pushdown: Pushdown, mode: StatePrinterModes = 'start') {
    const lines = [];

    for(let i = 0; i < pushdown.length; i++) {
      lines.push(`=== ${i} ===`);

      const items = pushdown.get(i);
      for(const item of items) {
        lines.push(this.printItem(item, mode));
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  printItem(item: Item, mode: StatePrinterModes = 'start') {
    let msg = '';

    for(let k = 0; k < item.rule.length; k++) {
      const symbol = item.rule[k];
      if(k == item.current) msg += ' ●';
      msg += ' ' + symbol.identify();
    }

    if(item.current == item.rule.length) {
      msg += ' ●';
    }

    return `${item.production.name} -> ${msg} (${item[mode]})`;
  }

};
