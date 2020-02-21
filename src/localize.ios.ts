import { vsprintf } from 'sprintf-js';
import { setString } from '@nativescript/core/application-settings';

import { convertAtSignToStringSign } from './placeholder';

export * from './localize.common';
import * as common from './localize.common';

let bundle:NSBundle;

const getBundle = (function() {
    return function() {
        if (!bundle) {
            bundle = NSBundle.mainBundle;
        }
        return bundle;
    };
})();

export function localizeNative(key: string, ...args: string[]): string {
    const localizedString = getBundle().localizedStringForKeyValueTable((key), key, null);
    return vsprintf(convertAtSignToStringSign(localizedString), args);
}
(common as any).localizeNative = localizeNative;


export function overrideNativeLocale(locale: string): boolean {
    const path = NSBundle.mainBundle.pathForResourceOfType(locale.substring(0, 2), 'lproj');

    if (!path) {
        return false;
    }

    bundle = NSBundle.bundleWithPath(path);
    NSUserDefaults.standardUserDefaults.setObjectForKey([locale], 'AppleLanguages');
    NSUserDefaults.standardUserDefaults.synchronize();

    return true;
}
