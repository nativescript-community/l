import { File, knownFolders, path } from '@nativescript/core/file-system';
import { vsprintf } from 'sprintf-js';

let currentLocales = undefined;
export function loadLocaleJSON(jsonFileOrData: string | object) {
    if (typeof jsonFileOrData === 'string') {
        if (jsonFileOrData.indexOf('~/') === 0) {
            jsonFileOrData = path.join(knownFolders.currentApp().path, jsonFileOrData.replace('~/', ''));
        }
        if (!/.(json|zip)$/.test(jsonFileOrData)) {
            jsonFileOrData += '.json';
        }
        currentLocales = JSON.parse(File.fromPath(jsonFileOrData).readTextSync());
    } else if (typeof jsonFileOrData === 'object') {
        currentLocales = jsonFileOrData;
    }
}

export let localizeNative = function(key: string, ...args: string[]): string {
    throw 'unimplemented';
};

function getNested(key: string, obj: object) {
    if (obj[key]) {
        obj = obj[key];
    } else {
        key.split('.').some(s => {
            obj = obj[s];
            return obj === undefined || obj === null;
        });
    }
    if (Array.isArray(obj)) {
        return obj.join('');
    }
    return obj as any;
}

export function l(key: string, ...args: string[]): string {
    if (currentLocales) {
        return vsprintf(getNested(key, currentLocales) || key, args);
    } else {
        return localizeNative(key, ...args);
    }
}

export function titlecase(value) {
    return value.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
export function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.substr(1).toLowerCase();
}
export function lt(key: string, ...args: string[]): string {
    return titlecase(l(key, ...args));
}
export function lu(key: string, ...args: string[]): string {
    return l(key, ...args).toUpperCase();
}
export function lc(key: string, ...args: string[]): string {
    return capitalize(l(key, ...args));
}
