"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtility = exports.HTMLUtility = void 0;
class HTMLUtility {
    static securise(unsafe) {
        if (unsafe === undefined || Number.isNaN(unsafe) || unsafe === null)
            return '';
        if (typeof (unsafe) !== 'string')
            return unsafe;
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
exports.HTMLUtility = HTMLUtility;
class StringUtility {
    static format(label, ...params) {
        if (label === undefined)
            return '';
        return label.replace(/{(\d+)}/g, (match, index) => {
            if (index < params.length) {
                const replacementValue = params[index];
                if (replacementValue === undefined) {
                    throw new Error('format: The label references an index (' + index + ') which value is undefined in the params list');
                }
                return replacementValue;
            }
            else {
                throw new Error('format: The label references an index (' + index + ') that exceed the params list length (' + params.length + ')');
            }
        });
    }
    static percentage(value) {
        if (value === undefined)
            return '';
        if (value === 0)
            return '0 %';
        const numValue = (typeof value === 'string' ? Number.parseFloat(value) : value);
        if (Number.isNaN(numValue))
            return '';
        return (numValue * 100).toFixed(2) + ' %';
    }
    static shrink(value, size = 150, appendStr = '...') {
        if (value === undefined)
            return '';
        if (value.length > size)
            return value.substring(0, size) + appendStr;
        return value;
    }
}
exports.StringUtility = StringUtility;
