import * as shorthash from "shorthash";

export function encodeKey(key: string): string {
  return key.match(/^[_.a-zA-Z]\w*$/) ? key : `${key.replace(/[^.\w]/g, "_")}`;
}

export function replace(find: string[], replace: string[], subject: string): string {
  return subject.replace(
    new RegExp("(" + find.map(i => i.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&")).join("|") + ")", "g"),
    match => replace[find.indexOf(match)]
  );
}
