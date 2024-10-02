import * as chartModules from 'qlik-chart-modules';
import create from '../contraster';

describe('contraster', () => {
  let luminanceMock;
  let contrastMock;

  beforeEach(() => {
    luminanceMock = jest.fn();
    contrastMock = jest.fn();

    jest.spyOn(chartModules, 'getLuminance').mockImplementation(luminanceMock);
    jest.spyOn(chartModules, 'getContrastRatio').mockImplementation(contrastMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should return #ffffff by default when input is dark', () => {
    luminanceMock.mockReturnValue(0.05);
    contrastMock.mockReturnValueOnce(5);
    contrastMock.mockReturnValueOnce(20);
    expect(create().getBestContrastColor('#111111')).toBe('#ffffff');
  });

  test('should return #333333 by default when input is light', () => {
    luminanceMock.mockReturnValue(0.8);
    contrastMock.mockReturnValueOnce(10);
    contrastMock.mockReturnValueOnce(2);
    expect(create().getBestContrastColor('#afa')).toBe('#333333');
  });

  test('should return cached value', () => {
    luminanceMock.mockReturnValue(0.8);
    contrastMock.mockReturnValueOnce(10);
    contrastMock.mockReturnValueOnce(2);

    const c = create();
    c.getBestContrastColor('#afa');
    expect(luminanceMock).toHaveBeenCalledTimes(3);

    c.getBestContrastColor('#afa');
    c.getBestContrastColor('#afa');
    expect(luminanceMock).toHaveBeenCalledTimes(3);
  });
});
