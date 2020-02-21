export declare class DataProvider {
    protected logger: ILogger;
    static readonly I18N_DIRECTORY_NAME = "i18n";
    protected defaultLanguage: string | undefined;
    protected readonly i18nDirectoryPath: string;
    protected languages: Languages;
    constructor(logger: ILogger, projectData: IProjectData);
    getDefaultLanguage(): string | undefined;
    getI18nDirectoryPath(): string;
    getLanguages(): Languages;
    isEmpty(): boolean;
    reload(): this;
    protected load(): this;
    protected loadLangage(filePath: string): I18nEntries;
}
export declare type I18nEntries = Map<string, string>;
export declare type Languages = Map<string, I18nEntries>;
