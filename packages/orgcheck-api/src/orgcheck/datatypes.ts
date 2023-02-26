export class HTMLUtility {

    public static securise(unsafe: any | undefined) {
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

    public static format(label: string | undefined, ...params: Array<any>) {
        if (label === undefined) return '';
        return label.replace(/{(\d+)}/g, (match, index) => { 
            if (index < params.length) {
                const replacementValue = params[index];
                if (replacementValue === undefined) {
                    throw new Error('format: The label references an index ('+index+') which value is undefined in the params list');
                }
                return replacementValue;
            } else {
                throw new Error('format: The label references an index ('+index+') that exceed the params list length ('+params.length+')');
            }
        });
    }

    public static percentage(value: string | number | undefined) {
        if (value === undefined) return '';
        if (value === 0) return '0 %';
        const numValue = (typeof value === 'string' ? Number.parseFloat(value) : value);
        if (Number.isNaN(numValue)) return '';
        return (numValue * 100).toFixed(2) + ' %';
    }

    public static shrink(value: string | undefined, size=150, appendStr='...') {
        if (value === undefined) return '';
        if (value.length > size) return value.substring(0, size) + appendStr;
        return value;
    }
}