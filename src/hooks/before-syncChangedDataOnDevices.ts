import { ConverterCommon } from './converter.common';
import { ConverterAndroid } from './converter.android';
import { ConverterIOS } from './converter.ios';
import { DataProvider } from './data.provider';
import { IPlatformData, IPlatformsDataService } from 'nativescript/lib/definitions/platform';
import { IProjectData } from 'nativescript/lib/definitions/project';
import { IAndroidResourcesMigrationService } from 'nativescript/lib/declarations';

module.exports =  function (
    androidResourcesMigrationService: IAndroidResourcesMigrationService,
    logger: any,
    projectData: IProjectData,
    injector: any,
    hookArgs: any
) {
    if (!hookArgs?.data) {
        return;
    }
    // for now we ignore that event.
    // if we do it then we will update the native files which will cause
    // a full native app update
    // seeing l want s to use json for locales first it should be enough
    // in most case. For edge case a rebuild is needed
    return;

    const changedFiles = hookArgs?.data?.files;
    let shouldIgnore = true;
    if (changedFiles?.length) {
            changedFiles.forEach(changedFile => {
            if (/i18n/.test(changedFile)) {
                shouldIgnore = false;
            }
        })
    }
    if (shouldIgnore) {
            return;
        }
    const platformName = (
        (hookArgs && hookArgs.platformData && hookArgs.platformData.normalizedPlatformName) ||
        (hookArgs.checkForChangesOpts && hookArgs.checkForChangesOpts.platform) ||
        ''
    ).toLowerCase();

    projectData =
        hookArgs && (hookArgs.projectData || (hookArgs.checkForChangesOpts && hookArgs.checkForChangesOpts.projectData));

    const platformData = getPlatformData(hookArgs && hookArgs.platformData, projectData, platformName, injector);
    let converter: ConverterCommon;
    const dataProvider = new DataProvider(logger, projectData);

    if (platformName === 'android') {
        converter = new ConverterAndroid(dataProvider, androidResourcesMigrationService, logger, platformData, projectData);
    } else if (platformName === 'ios') {
        converter = new ConverterIOS(dataProvider, logger, platformData, projectData);
    } else {
        logger.warn(`Platform '${platformName}' isn't supported: skipping localization`);
        return;
    }

    converter.run();
};

function getPlatformData(
    platformData: IPlatformData,
    projectData: IProjectData,
    platform: string,
    injector: any
): IPlatformData {
    if (!platformData) {
        // Used in CLI 5.4.x and below:
        const platformsDataService = injector.resolve('platformsData') as IPlatformsDataService;
        platformData = platformsDataService.getPlatformData(platform, projectData);
    }

    return platformData;
}
