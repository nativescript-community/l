import { DataProvider, I18nEntries, Languages } from './data.provider';
import { IProjectData } from 'nativescript/lib/definitions/project';
import { IPlatformData } from 'nativescript/lib/definitions/platform';
export declare abstract class ConverterCommon {
    protected dataProvider: DataProvider;
    protected logger: any;
    protected platformData: IPlatformData;
    protected projectData: IProjectData;
    protected appResourcesDirectoryPath: string;
    protected readonly appResourcesDestinationDirectoryPath: string;
    protected readonly i18nDirectoryPath: string;
    constructor(dataProvider: DataProvider, logger: any, platformData: IPlatformData, projectData: IProjectData);
    protected abstract cleanObsoleteResourcesFiles(resourcesDirectory: string, languages: Languages): this;
    protected abstract createLanguageResourcesFiles(language: string, isDefaultLanguage: boolean, i18nEntries: I18nEntries): this;
    run(): this;
    protected createDirectoryIfNeeded(directoryPath: string): this;
    protected removeDirectoryIfEmpty(directoryPath: string): this;
    protected removeFileIfExists(filePath: string): this;
    protected writeFileSyncIfNeeded(filePath: string, content: string): this;
}
