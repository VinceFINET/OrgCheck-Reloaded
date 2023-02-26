export class HTMLUtility {

    constructor() {
    }

    public securise(unsafe: any | undefined): string {
        if (unsafe === undefined || Number.isNaN(unsafe) || unsafe === null) return '';
        if (typeof(unsafe) !== 'string') return unsafe;
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

export class StringUtility {

    constructor() {
    }

    public format(label: string | undefined, ...params: Array<any>): string {
        if (label === undefined) return '';
        return label.replace(/{(\d+)}/g, (match, index) => { 
            if (index < params.length) {
                const replacementValue = params[index];
                if (replacementValue === undefined) {
                    throw new Error('format: The label references an index ('+index+') which value is undefined in the params list');
                }
                return replacementValue;
            } else {
                throw new Error('format: The label references an index ('+index+') which exceeds the params list length ('+params.length+')');
            }
        });
    }

    public percentage(value: string | number | undefined): string {
        if (value === undefined) return '';
        if (value === 0) return '0 %';
        const numValue = (typeof value === 'string' ? Number.parseFloat(value) : value);
        if (Number.isNaN(numValue)) return '';
        return (numValue * 100).toFixed(2) + ' %';
    }

    public shrink(value: string | undefined, size=150, appendStr='...'): string {
        if (value === undefined) return '';
        if (value.length > size) return value.substring(0, size) + appendStr;
        return value;
    }
}

export class ArrayUtility {

    constructor() {
    }

    public concat(array1: Array<any>, array2: Array<any>, property?: string): Array<any> {
        if (property === undefined) {
            let uniq_items_to_add;
            if (array1) {
                uniq_items_to_add = array1.filter((item) => array2.indexOf(item) < 0);
            } else {
                uniq_items_to_add = [];
            }
            if (array2) {
                return array2.concat(uniq_items_to_add);
            } else {
                return uniq_items_to_add;
            }
        } else {
            let new_array = [];
            let array2_keys = [];
            if (array2) for (let i = 0; i < array2.length; i++) {
                const item2 = array2[i];
                array2_keys.push(item2[property]);
                new_array.push(item2);
            }
            if (array1) for (let i = 0; i < array1.length; i++) {
                const item1 = array1[i];
                const key1 = item1[property];
                if (array2_keys.indexOf(key1) < 0) {
                    new_array.push(item1);
                }
            }
            return new_array;
        }
    }
}