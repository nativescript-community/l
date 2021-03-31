import { vsprintf } from 'sprintf-js';
import * as utils from '@nativescript/core/utils/utils';
import { Application } from '@nativescript/core';

const getResources = (function() {
    let resources = null;
    return function() {
        if (resources === null) {
            resources = utils.ad.getApplicationContext().getResources();
        }
        return resources;
    };
})();

export function localizeNative(key: string, ...args: string[]): string {
    let localizedString;
    try {
        const identifier = utils.ad.resources.getStringId(key);
        localizedString = identifier === 0 ? key : getResources().getString(identifier);
        return vsprintf(localizedString, args);
    } catch (error) {
        return key;
    }
}


export function overrideNativeLocale(lang: string): boolean {
    const locale = new java.util.Locale(lang.substring(0, 2));
    java.util.Locale.setDefault(locale);

    const resources = Application.android.context.getResources();
    const configuration = resources.getConfiguration();
    configuration.locale = locale;

    resources.updateConfiguration(configuration, resources.getDisplayMetrics());
    return true;
}
