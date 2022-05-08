import { vsprintf } from 'sprintf-js';
import { Application, Device, Utils} from '@nativescript/core';

let resources: android.content.res.Resources;
function getResources() {
    if (!resources) {
        resources = (Utils.ad.getApplicationContext() as android.content.Context).getResources();
    }
    return resources;
};

export function localizeNative(key: string, ...args: string[]): string {
    let localizedString;
    try {
        const identifier = Utils.ad.resources.getStringId(key);
        localizedString = identifier === 0 ? key : getResources().getString(identifier);
        return vsprintf(localizedString, args);
    } catch (error) {
        return key;
    }
}

const sdkVersion = parseInt(Device.sdkVersion, 10);

export function overrideNativeLocale(lang: string): boolean {
    const locale = new java.util.Locale(lang);
    java.util.Locale.setDefault(locale);

    const resources = getResources();
    const configuration = resources.getConfiguration();
    configuration.locale = locale;
    if (sdkVersion < 17) {
        resources.updateConfiguration(configuration, resources.getDisplayMetrics());
    } else {
        (Utils.ad.getApplicationContext() as android.content.Context).createConfigurationContext(configuration);
    }
    return true;
}
