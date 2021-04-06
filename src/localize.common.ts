import { File, knownFolders, path } from '@nativescript/core';
import { vsprintf } from 'sprintf-js';
import { localizeNative } from './localizenative';

export * from './localizenative';

let currentLocales;

function flatten(obj: any) {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
        if (typeof obj[key] !== null && typeof obj[key] === 'object') {
            const subObj = flatten(obj[key]);
            for (const subKey of Object.keys(subObj)) {
                newObj[`${key}.${subKey}`] = subObj[subKey];
            }
        } else {
            newObj[key] = obj[key];
        }
    }
    return newObj;
}

export function loadLocaleJSON(jsonFileOrData: string | object, shouldFlatten = true) {
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
    if (shouldFlatten && currentLocales) {
        currentLocales = flatten(currentLocales);
    }
}

// function getNested(key: string, obj: object) {
//     if (obj[key]) {
//         obj = obj[key];
//     } else {
//         key.split('.').some(s => {
//             obj = obj[s];
//             return obj === undefined || obj === null;
//         });
//     }
//     if (Array.isArray(obj)) {
//         return obj.join('');
//     }
//     return obj as any;
// }

export function l(key: string, ...args: any[]): string {
    if (currentLocales) {
        try {
            return vsprintf(currentLocales[key] || key, args);

        } catch(err) {
            console.error('l error', err);
            return key;
        }
    } else {
        return localizeNative(key, ...args);
    }
}

export function titlecase(value) {
    return value.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1);
    });
}
export function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.substr(1);
}
export function lt(key: string, ...args: any[]): string {
    return titlecase(l(key, ...args));
}
export function lu(key: string, ...args: any[]): string {
    return l(key, ...args).toUpperCase();
}
export function lc(key: string, ...args: any[]): string {
    return capitalize(l(key, ...args));
}
