import { IProjectData } from 'nativescript/lib/definitions/project';
export declare class DataProvider {
    protected logger: any;
    static readonly I18N_DIRECTORY_NAME = "i18n";
    protected defaultLanguage: string;
    protected readonly i18nDirectoryPath: string;
    protected readonly i18nConfig: any;
    protected languages: Languages;
    constructor(logger: any, projectData: IProjectData);
    getDefaultLanguage(): string | undefined;
    getI18nDirectoryPath(): string;
    getLanguages(): Languages;
    isEmpty(): boolean;
    reload(): this;
    protected load(): this;
    protected loadLangage(filePath: string): I18nEntries;
}
export type I18nEntries = Map<string, string | string>;
export type Languages = Map<string, I18nEntries>;
