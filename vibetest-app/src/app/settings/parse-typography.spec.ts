import { DEFAULT_CODE_TYPOGRAPHY, DEFAULT_UI_TYPOGRAPHY } from './typography.model';
import {
  parseCodeTypography,
  parseUiTypography,
  tryParseCodeTypography,
  tryParseUiTypography,
} from './parse-typography';

describe('parse typography', () => {
  it('parses the built-in defaults', () => {
    expect(parseUiTypography(DEFAULT_UI_TYPOGRAPHY)).toEqual(DEFAULT_UI_TYPOGRAPHY);
    expect(parseCodeTypography(DEFAULT_CODE_TYPOGRAPHY)).toEqual(DEFAULT_CODE_TYPOGRAPHY);
  });

  it('rejects a UI family on the code profile', () => {
    expect(tryParseCodeTypography({ family: 'serif', size: 'm' })).toBeUndefined();
    expect(tryParseUiTypography({ family: 'consolas', size: 'l' })).toBeUndefined();
  });

  it('rejects an unknown size', () => {
    expect(tryParseUiTypography({ family: 'system', size: 'xl' })).toBeUndefined();
  });
});
