import { ConverterCommon } from './converter.common';
import { DataProvider, I18nEntries, Languages } from './data.provider';
import { IProjectData } from 'nativescript/lib/definitions/project';
import { IPlatformData } from 'nativescript/lib/definitions/platform';
import { IAndroidResourcesMigrationService } from 'nativescript/lib/declarations';
export declare class ConverterAndroid extends ConverterCommon {
    constructor(dataProvider: DataProvider, androidResourcesMigrationService: IAndroidResourcesMigrationService, logger: any, platformData: IPlatformData, projectData: IProjectData);
    protected cleanObsoleteResourcesFiles(resourcesDirectory: string, languages: Languages): this;
    protected createLanguageResourcesFiles(language: string, isDefaultLanguage: boolean, i18nEntries: I18nEntries): this;
    private encodeI18nEntries;
}
