import * as fs from 'fs';
import { IProjectData } from 'nativescript/lib/definitions/project';
import * as path from 'path';

export class DataProvider {
    public static readonly I18N_DIRECTORY_NAME = 'i18n';

    protected defaultLanguage: string;
    protected readonly i18nDirectoryPath: string;
    protected readonly i18nConfig: any;
    protected languages: Languages = new Map();

    public constructor(protected logger: any, projectData: IProjectData) {
        this.i18nDirectoryPath = path.join(projectData.appDirectoryPath, DataProvider.I18N_DIRECTORY_NAME);
        this.i18nConfig =projectData.nsConfig['i18n'];
        this.load();
    }

    public getDefaultLanguage(): string | undefined {
        return this.defaultLanguage;
    }

    public getI18nDirectoryPath(): string {
        return this.i18nDirectoryPath;
    }

    public getLanguages(): Languages {
        return this.languages;
    }

    public isEmpty(): boolean {
        return this.languages.size === 0;
    }

    public reload(): this {
        return this.load();
    }

    protected load(): this {
        if (!fs.existsSync(this.i18nDirectoryPath)) {
            this.logger.warn(`'${this.i18nDirectoryPath}' doesn't exists: nothing to localize`);
            return this;
        }
        this.defaultLanguage = this.i18nConfig?.defaultLanguage;
        fs.readdirSync(this.i18nDirectoryPath)
            .map((fileName) => path.join(this.i18nDirectoryPath, fileName))
            .filter((filePath) => {
                const validExtensions = ['.js', '.json'];
                const isValidExtension = validExtensions.indexOf(path.extname(filePath)) > -1;
                const isFile = fs.statSync(filePath).isFile();
                return isFile && isValidExtension;
            })
            .forEach((filePath) => {
                let language = path.basename(filePath, path.extname(filePath));

                 if (path.extname(language) === '.default') {
                    language = path.basename(language, '.default');
                    if (!this.defaultLanguage) {
                        this.defaultLanguage = language;
                    }
                }
                this.languages.set(language, this.loadLangage(filePath));
            });

        if (this.isEmpty()) {
            this.logger.warn(`'${this.i18nDirectoryPath}' is empty: nothing to localize`);
            return this;
        }

        if (!this.defaultLanguage) {
            this.defaultLanguage = this.languages.keys().next().value;
            this.logger.warn(`No file found with the .default extension: default langage set to '${this.defaultLanguage}'`);
        }

        const defaultLanguageI18nEntries = this.languages.get(this.defaultLanguage);
        if (defaultLanguageI18nEntries) {
            this.languages.forEach((languageI18nEntries, language) => {
                if (language !== this.defaultLanguage) {
                    languageI18nEntries.forEach((_, key) => {
                        if (!defaultLanguageI18nEntries.has(key)) {
                            defaultLanguageI18nEntries.set(key, key);
                        }
                    });
                }
            });
            this.languages.forEach((languageI18nEntries, language) => {
                if (language !== this.defaultLanguage) {
                    defaultLanguageI18nEntries.forEach((value, key) => {
                        if (!languageI18nEntries.has(key)) {
                            languageI18nEntries.set(key, value);
                        }
                    });
                }
            });
        }

        return this;
    }

    protected loadLangage(filePath: string): I18nEntries {
        delete require.cache[require.resolve(filePath)];

        const fileContent = require(filePath);
        const i18nEntries: I18nEntries = new Map();
        const stack = [{ prefix: '', element: fileContent }];

        while (stack.length > 0) {
            //@ts-ignore
            const { prefix, element } = stack.pop();
            if (Array.isArray(element)) {
                i18nEntries.set(prefix, element.join(''));
            } else if (typeof element === 'object') {
                for (const key of Object.keys(element)) {
                    const newKey = key;
                    stack.push({ prefix: prefix === '' ? newKey : `${prefix}.${newKey}`, element: element[key] });
                }
            } else {
                // eslint-disable-next-line no-new-wrappers
                i18nEntries.set(prefix, new String(element).valueOf());
            }
        }

        return i18nEntries;
    }
}

export type I18nEntries = Map<string, string | string>;
export type Languages = Map<string, I18nEntries>;
