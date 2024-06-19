import * as fs from 'fs';
import * as path from 'path';

import { ConverterCommon } from './converter.common';
import { DataProvider, I18nEntries, Languages } from './data.provider';
import { encodeValue } from './resource.android';
import { IProjectData } from 'nativescript/lib/definitions/project';
import { IPlatformData } from 'nativescript/lib/definitions/platform';
import { IAndroidResourcesMigrationService } from 'nativescript/lib/declarations';

export class ConverterAndroid extends ConverterCommon {
    public constructor(
        dataProvider: DataProvider,
        androidResourcesMigrationService: IAndroidResourcesMigrationService,
        logger: any,
        platformData: IPlatformData,
        projectData: IProjectData
    ) {
        super(dataProvider, logger, platformData, projectData);
        if (androidResourcesMigrationService.hasMigrated(projectData.appResourcesDirectoryPath)) {
            this.appResourcesDirectoryPath = path.join(this.appResourcesDirectoryPath, 'src', 'main', 'res');
        }
    }

    protected cleanObsoleteResourcesFiles(resourcesDirectory: string, languages: Languages): this {
        fs.readdirSync(resourcesDirectory)
            .filter((fileName) => {
                const match = /^values-(.+)$/.exec(fileName);
                if (match) {
                    var actualLanguage = match[1].replace(/^(.+?)-r(.+?)$/, '$1_$2').replace(/^b\+/, '').split('+').join('_');
                    return !languages.has(actualLanguage) && !languages.has(match[1].replace(/^(.+?)-r(.+?)$/, '$1-$2'));
                }
                return false;
            })
            .map((fileName) => path.join(resourcesDirectory, fileName))
            .filter((filePath) => fs.statSync(filePath).isDirectory())
            .forEach((lngResourcesDir) => {
                const resourceFilePath = path.join(lngResourcesDir, 'strings.xml');
                this.removeFileIfExists(resourceFilePath);
                this.removeDirectoryIfEmpty(lngResourcesDir);
            });
        return this;
    }

    protected createLanguageResourcesFiles(language: string, isDefaultLanguage: boolean, i18nEntries: I18nEntries): this {
        let languageResourcesDir: string;
        const languageArray = language.split('_')
        if (languageArray.length > 1 && (languageArray.length > 2 || languageArray[1].length > 2)) {
            languageResourcesDir = path.join(this.appResourcesDirectoryPath, "values".concat(isDefaultLanguage ? '' : "-b+" + languageArray.join('+')));
        } else {
            languageResourcesDir = path.join(this.appResourcesDirectoryPath, "values".concat(isDefaultLanguage ? '' : "-".concat(languageArray.join('-').replace(/^(.+?)-(.+?)$/, '$1-r$2'))));
        }
        this.createDirectoryIfNeeded(languageResourcesDir);
        let strings = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n';
        this.encodeI18nEntries(i18nEntries).forEach((encodedValue, encodedKey) => {
            if (encodedKey.startsWith('android.strings.')) {
                strings += `  <string name="${encodedKey.substring(16)}">${encodedValue}</string>\n`;
            } else {
                strings += `  <string name="${encodedKey}">${encodedValue}</string>\n`;

            }
        });
        strings += '</resources>\n';
        const resourceFilePath = path.join(languageResourcesDir, 'strings.xml');
        this.writeFileSyncIfNeeded(resourceFilePath, strings);
        return this;
    }

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
            if (encodedKey.startsWith('ios.info.plist.')) {
                return
            } else if (encodedKey === 'app.name') {
                if (forceWrite || !encodedI18nEntries.has('app_name')) {
                    encodedI18nEntries.set('app_name', encodedValue);
                    encodedI18nEntries.set('title_activity_kimera', encodedValue);
                }
            } else {
                if (forceWrite || !encodedI18nEntries.has(encodedKey)) {
                    encodedI18nEntries.set(encodedKey, encodedValue);
                }
            }
        });
        return encodedI18nEntries;
    }
}
