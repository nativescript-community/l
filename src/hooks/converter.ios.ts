import * as fs from 'fs';
import * as path from 'path';
import * as plist from 'simple-plist';

import { ConverterCommon } from './converter.common';
import { DataProvider, I18nEntries, Languages } from './data.provider';
import { encodeValue } from './resource.ios';

export class ConverterIOS extends ConverterCommon {
    protected cleanObsoleteResourcesFiles(resourcesDirectory: string, languages: Languages): this {
        fs.readdirSync(resourcesDirectory)
            .filter((fileName) => {
                const match = /^(.+)\.lproj$/.exec(fileName);
                return match && !languages.has(match[1]);
            })
            .map((fileName) => path.join(resourcesDirectory, fileName))
            .filter((filePath) => fs.statSync(filePath).isDirectory())
            .forEach((lngResourcesDir) => {
                ['InfoPlist.strings', 'Localizable.strings'].forEach((fileName) => {
                    const resourceFilePath = path.join(lngResourcesDir, fileName);
                    this.removeFileIfExists(resourceFilePath);
                });
                this.removeDirectoryIfEmpty(lngResourcesDir);
            });
        const settingsBundlePath = path.join(this.appResourcesDirectoryPath, 'Settings.bundle');
        if (fs.existsSync(settingsBundlePath)) {
            //we copy the 'Localizable.strings' for each settings page
            fs.readdirSync(settingsBundlePath)
                .filter((fileName) => {
                    const match = /^(.+)\.lproj$/.exec(fileName);
                    return match && !languages.has(match[1]);
                })
                .map((fileName) => path.join(resourcesDirectory, fileName))
                .filter((filePath) => fs.statSync(filePath).isDirectory())
                .forEach((lngResourcesDir) => {
                    fs.readdirSync(lngResourcesDir).forEach((fileName) => {
                        this.removeFileIfExists(path.join(lngResourcesDir, fileName));
                    });
                    this.removeDirectoryIfEmpty(lngResourcesDir);

                });
        }
        return this;
    }

    protected createLanguageResourcesFiles(language: string, isDefaultLanguage: boolean, i18nEntries: I18nEntries): this {
        const infoPlistStrings: I18nEntries = new Map();
        const projectData = this.projectData;
        const appId = projectData.nsConfig.id;
        const encodedEntries = this.encodeI18nEntries(i18nEntries);
        encodedEntries.forEach((value, key) => {
            if (key.startsWith('ios.info.plist.')) {
                infoPlistStrings.set(key.substring(15), value);
            }
        });
        const languageResourcesDir = path.join(this.appResourcesDirectoryPath, `${language}.lproj`);
        this.createDirectoryIfNeeded(languageResourcesDir)
            .writeStrings(languageResourcesDir, 'Localizable.strings', encodedEntries)
            .writeStrings(languageResourcesDir, 'InfoPlist.strings', infoPlistStrings);
        if (isDefaultLanguage) {
            infoPlistStrings.set('CFBundleDevelopmentRegion', language);
            this.writeInfoPlist(infoPlistStrings);
        }
        const settingsBundlePath = path.join(this.appResourcesDirectoryPath, 'Settings.bundle');
        if (fs.existsSync(settingsBundlePath)) {
            //we copy the 'Localizable.strings' for each settings page
            fs.readdirSync(settingsBundlePath)
                .filter((fileName) => fileName.endsWith('.plist'))
                .forEach((settingsPagePlist) => {
                    const settingsLanguageResourcesDir = path.join(settingsBundlePath, `${language}.lproj`);
                    this.createDirectoryIfNeeded(settingsLanguageResourcesDir);
                    fs.copyFileSync(
                        path.join(languageResourcesDir, 'Localizable.strings'),
                        path.join(settingsLanguageResourcesDir, settingsPagePlist.split('.').slice(0, -1).join('.')+'.strings')
                    );
                });
        }
        return this;
    }

    // private encodeI18nEntries(i18nEntries: I18nEntries): I18nEntries {
    //     const encodedI18nEntries: I18nEntries = new Map();
    //     i18nEntries.forEach((value, key) => {
    //         const encodedKey = key;
    //         const encodedValue = encodeValue(value);
    //         encodedI18nEntries.set(encodedKey, encodedValue);
    //     });
    //     return encodedI18nEntries;
    // }

    private encodeI18nEntries(i18nEntries: I18nEntries, encodedI18nEntries:I18nEntries = new Map()): I18nEntries {
        const projectData = this.projectData;
        const appId = projectData.nsConfig.id as string;
        i18nEntries.forEach((value, key) => {
            let encodedKey = key;
            let forceWrite = false;
            if (encodedKey.startsWith('$' + appId)) {
                encodedKey = encodedKey.substring(appId.length + 2);
                forceWrite = true;
            } else if (encodedKey.startsWith('$')) {
                return;
            }
            const encodedValue = encodeValue(value);
            if (encodedKey.startsWith('android.strings.')) {
               return;
            } else if (encodedKey === 'app.name') {
                if (forceWrite || !encodedI18nEntries.has('ios.info.plist.CFBundleDisplayName')) {
                    encodedI18nEntries.set('ios.info.plist.CFBundleDisplayName', encodedValue);
                }
            } else {
                if (forceWrite || !encodedI18nEntries.has(encodedKey)) {
                    encodedI18nEntries.set(encodedKey, encodedValue);
                }
            }
        });
        return encodedI18nEntries;
    }

    // private encodeI18nEntries(i18nEntries: I18nEntries, encodedI18nEntries:I18nEntries = new Map(), prefix:string = ''): I18nEntries {
    //     const projectData = this.projectData;
    //     const appId = projectData.nsConfig.id;
    //     i18nEntries.forEach((value, key) => {
    //         const encodedKey = key;
    //         if (key === appId && typeof value === 'object') {
    //             this.encodeI18nEntries(value, encodedI18nEntries, prefix);
    //         } else  if (key.startsWith('android.strings.')) {
    //             /* do nothing */
    //         } else if (key === 'app.name') {
    //             const encodedValue = encodeValue(value as string);
    //             encodedI18nEntries.set('ios.info.plist.CFBundleDisplayName', encodedValue);
    //         } else if (typeof value === 'object') {
    //             this.encodeI18nEntries(value, encodedI18nEntries, prefix + key + '.');
    //         } else {
    //             encodedI18nEntries.set(prefix + encodedKey, encodeValue(value as string));

    //         }
    //     });
    //     return encodedI18nEntries;
    // }

    private writeStrings(languageResourcesDir: string, resourceFileName: string, i18nEntries: I18nEntries): this {
        let content = '';
        i18nEntries.forEach((encodedValue, encodedKey) => {
            if (!encodedKey.startsWith('android.strings.') && !encodedKey.startsWith('ios.info.plist.')) {
                content += `"${encodedKey}" = "${encodedValue}";\n`;
            }
        });
        const resourceFilePath = path.join(languageResourcesDir, resourceFileName);
        this.writeFileSyncIfNeeded(resourceFilePath, content);
        return this;
    }

    private writeInfoPlist(infoPlistValues: I18nEntries) {
        const resourceFilePath = path.join(this.appResourcesDirectoryPath, 'Info.plist');
        if (!fs.existsSync(resourceFilePath)) {
            this.logger.warn(`'${resourceFilePath}' doesn't exists: unable to set default language`);
            return this;
        }
        const data = plist.readFileSync(resourceFilePath) as any;
        let resourceChanged = false;
        infoPlistValues.forEach((value, key) => {
            if (!data.hasOwnProperty(key) || data[key] !== value) {
                data[key] = value;
                resourceChanged = true;
            }
        });
        if (resourceChanged) {
            plist.writeFileSync(resourceFilePath, data);
        }
        return this;
    }
}
