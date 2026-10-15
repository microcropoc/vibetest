import { readTextFromClipboard } from './read-text-from-clipboard';

describe('readTextFromClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns unavailable when clipboard read API is missing', async () => {
    vi.stubGlobal('navigator', {});

    await expect(readTextFromClipboard()).resolves.toEqual({ status: 'unavailable' });
  });

  it('returns read with text when readText succeeds', async () => {
    const readText = vi.fn().mockResolvedValue('{"a":1}');
    vi.stubGlobal('navigator', { clipboard: { readText } });

    await expect(readTextFromClipboard()).resolves.toEqual({
      status: 'read',
      text: '{"a":1}',
    });
    expect(readText).toHaveBeenCalled();
  });

  it('returns failed when readText rejects', async () => {
    const readText = vi.fn().mockRejectedValue(new Error('denied'));
    vi.stubGlobal('navigator', { clipboard: { readText } });

    await expect(readTextFromClipboard()).resolves.toEqual({ status: 'failed' });
  });
});
