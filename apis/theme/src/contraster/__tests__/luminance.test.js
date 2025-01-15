import * as d3ColorUtil from 'd3-color';
import luminance from '../luminance';

describe('luminance', () => {
  let d3ColorMock;

  beforeAll(() => {
    d3ColorMock = jest.fn();
    jest.spyOn(d3ColorUtil, 'color').mockImplementation(d3ColorMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('for #ffffff should be 1', () => {
    d3ColorMock.mockReturnValue({ rgb: () => ({ r: 255, g: 255, b: 255 }) });
    expect(luminance('#ffffff')).toBe(1);
  });

  test('for #000000 should be 0', () => {
    d3ColorMock.mockReturnValue({ rgb: () => ({ r: 0, g: 0, b: 0 }) });
    expect(luminance('#000000')).toBe(0);
  });

  test('for #ff6633 should be 0.31002', () => {
    d3ColorMock.mockReturnValue({ rgb: () => ({ r: 255, g: 102, b: 51 }) });
    expect(luminance('#ff6633')).toBe(0.31002);
  });

  test('for #00028 should break and return 0', () => {
    d3ColorMock.mockReturnValue(null);
    expect(luminance('#00028')).toBe(0);
  });
});
