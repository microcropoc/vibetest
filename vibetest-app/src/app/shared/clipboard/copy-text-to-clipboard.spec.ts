import { copyTextToClipboard } from './copy-text-to-clipboard';

describe('copyTextToClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns unavailable when clipboard API is missing', async () => {
    vi.stubGlobal('navigator', {});

    await expect(copyTextToClipboard('hello')).resolves.toBe('unavailable');
  });

  it('returns copied when writeText succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    await expect(copyTextToClipboard('hello')).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('returns failed when writeText rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    await expect(copyTextToClipboard('hello')).resolves.toBe('failed');
  });
});
