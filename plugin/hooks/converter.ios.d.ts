import { ConverterCommon } from "./converter.common";
import { I18nEntries, Languages } from "./data.provider";
export declare class ConverterIOS extends ConverterCommon {
    protected cleanObsoleteResourcesFiles(resourcesDirectory: string, languages: Languages): this;
    protected createLanguageResourcesFiles(language: string, isDefaultLanguage: boolean, i18nEntries: I18nEntries): this;
    private encodeI18nEntries;
    private writeStrings;
    private writeInfoPlist;
}
