import { PipeTransform } from "@angular/core";
export declare class LocalizePipe implements PipeTransform {
    transform(key: string, ...args: string[]): string;
}
