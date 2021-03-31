import { vsprintf } from 'sprintf-js';
import { convertAtSignToStringSign } from './placeholder';
let bundle: NSBundle;

const getBundle = (function () {
    return function () {
        if (!bundle) {
            bundle = NSBundle.mainBundle;
        }
        return bundle;
    };
})();

export function localizeNative(key: string, ...args: string[]): string {
    try {
        const localizedString = getBundle().localizedStringForKeyValueTable(key, key, null);
        return vsprintf(convertAtSignToStringSign(localizedString), args);
    } catch (error) {
        return key;
    }
}

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
