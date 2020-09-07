import { convertPlaceholders, convertStringSignToAtSign } from '../placeholder';
import { replace } from './resource.common';

export function encodeValue(value: string): string {
    return replace(
        ['"', '\\', '\n', '\r', '\t'],
        ['\\"', '\\\\', '\\n', '\\r', '\\t'],
        convertStringSignToAtSign(convertPlaceholders(value))
    );
}
