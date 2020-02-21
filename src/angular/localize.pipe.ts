import { Pipe, PipeTransform } from "@angular/core";

import { l } from "../localize";

@Pipe({ name: "L" })
export class LocalizePipe implements PipeTransform {
  public transform(key: string, ...args: string[]): string {
    return l(key, ...args);
  }
}
