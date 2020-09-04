import { vsprintf } from 'sprintf-js';
import { android as _android } from '@nativescript/core/application';
import * as utils from '@nativescript/core/utils/utils';

export * from './localize.common';

declare var java: any;

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
    } catch (error) {
        localizedString = key;
    }
    return vsprintf(localizedString, args);
}


export function overrideNativeLocale(lang: string): boolean {
    const locale = new java.util.Locale(lang.substring(0, 2));
    java.util.Locale.setDefault(locale);

    const resources = _android.context.getResources();
    const configuration = resources.getConfiguration();
    configuration.locale = locale;

    resources.updateConfiguration(configuration, resources.getDisplayMetrics());
    return true;
}
