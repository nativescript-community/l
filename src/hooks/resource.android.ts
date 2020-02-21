import { convertPlaceholders } from "../placeholder";
import { replace } from "./resource.common";

// export { encodeKey };

export function encodeValue(value: string): string {
  return '"' + replace(
    ["'", '"', "\\", "\n", "\r", "\t", "<", "&"],
    ["\\'", '\\"', "\\\\", "\\n", "\\r", "\\t", "&lt;", "&amp;"],
    convertPlaceholders(value)
  ) + '"';
}
