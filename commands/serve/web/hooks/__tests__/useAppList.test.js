import * as ReactRouterDomModule from 'react-router';
import { renderHook, act } from '@testing-library/react';
import { useAppList } from '../useAppList';
import * as connectModule from '../../connect';
import * as RootContextModule from '../../contexts/RootContext';
import * as utilsModule from '../../utils';
import { RouterWrapper } from '../../utils/testRenderer';

jest.mock('../../utils', () => ({
  __esModule: true,
  ...jest.requireActual('../../utils'),
}));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: jest.fn(),
}));

describe('useAppList', () => {
  let getConnectionMock;
  let renderResult;
  let getConnectionInfoReturnValue;
  let glob;
  let info;
  let setInfo;
  let setActiveStep;
  let getDocList;
  let apps;
  let engineUrl;
  let clientId;
  let getAppList;
  let checkIfAuthorized;
  let useNavigateMock;
  let navigateMock;

  beforeEach(() => {
    clientId = 'xxx__client_id__xxx';
    engineUrl = 'some.engine.in.eu.qlikdev.com';

    navigateMock = jest.fn();
    useNavigateMock = jest.fn().mockReturnValue(navigateMock);

    getConnectionInfoReturnValue = { isMock: true };
    getConnectionMock = jest.fn();
    getConnectionMock.mockResolvedValue(getConnectionInfoReturnValue);

    setInfo = jest.fn();
    setActiveStep = jest.fn();

    apps = [];
    getDocList = jest.fn().mockResolvedValue(apps);

    info = {};
    glob = { getDocList };

    getAppList = jest.fn();

    checkIfAuthorized = jest.fn().mockResolvedValue({ isAuthorized: false });

    jest.spyOn(connectModule, 'getConnectionInfo').mockImplementation(getConnectionMock);
    jest.spyOn(RootContextModule, 'useRootContext').mockReturnValue({
      setInfo,
      setActiveStep,
    });
    jest.spyOn(utilsModule, 'getAppList').mockImplementation(getAppList);
    jest.spyOn(utilsModule, 'checkIfAuthorized').mockImplementation(checkIfAuthorized);
    jest.spyOn(ReactRouterDomModule, 'useNavigate').mockImplementation(useNavigateMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should call `setActiveStep` and set it to 1 on mount', async () => {
    await act(async () => {
      renderResult = renderHook(() => useAppList({ glob, info }), { wrapper: RouterWrapper });
    });

    expect(setActiveStep).toHaveBeenCalledTimes(1);
    expect(setActiveStep).toHaveBeenCalledWith(1);
  });

  test('should call `getConnectionInfo` and `setInfo` with correct values on mount', async () => {
    await act(async () => {
      renderResult = renderHook(() => useAppList({ glob, info }), { wrapper: RouterWrapper });
    });

    expect(getConnectionMock).toHaveBeenCalledTimes(1);
    expect(getConnectionMock).toHaveBeenCalledWith();
    expect(setInfo).toHaveBeenCalledTimes(1);
    expect(setInfo).toHaveBeenCalledWith(getConnectionInfoReturnValue);
  });

  test('should call `getAppList()` from utils to get list of apps, if there was `shouldFetchAppList` in url', async () => {
    apps = [{ someApp: 'someAppItem#01' }];
    getAppList.mockResolvedValue(apps);

    window.location.assign(
      `/some-url?engine_url=wss://${engineUrl}&qlik-client-id=${clientId}&shouldFetchAppList=true`
    );

    await act(async () => {
      renderResult = renderHook(() => useAppList({ glob, info }), { wrapper: RouterWrapper });
    });

    expect(getAppList).toHaveBeenCalledTimes(1);
    expect(getDocList).toHaveBeenCalledTimes(0);
    expect(renderResult.result.current).toMatchObject({
      loading: false,
      appList: apps,
    });
  });

  test('should call `glob?.getDocList()` to get list of apps, if there was no `shouldFetchAppList` in url', async () => {
    apps = [{ someApp: 'someDocListItem#01' }];
    getDocList.mockResolvedValue(apps);

    window.location.assign(`/some-url?engine_url=wss://${engineUrl}&qlik-client-id=${clientId}`);

    await act(async () => {
      renderResult = renderHook(() => useAppList({ glob, info }), { wrapper: RouterWrapper });
    });

    expect(getAppList).toHaveBeenCalledTimes(0);
    expect(getDocList).toHaveBeenCalledTimes(1);
    expect(renderResult.result.current).toMatchObject({
      loading: false,
      appList: apps,
    });
  });

  test('should show loading if there was no apps', async () => {
    getDocList.mockResolvedValue(undefined);
    window.location.assign(`/some-url?engine_url=wss://${engineUrl}&qlik-client-id=${clientId}`);
    await act(async () => {
      renderResult = renderHook(() => useAppList({ glob, info }), { wrapper: RouterWrapper });
    });

    expect(getAppList).toHaveBeenCalledTimes(0);
    expect(getDocList).toHaveBeenCalledTimes(1);
    expect(renderResult.result.current).toMatchObject({
      loading: true,
      appList: undefined,
    });
  });

  test('should append `shouldFetchAppList` to the url and reload in case if ther was no `shouldFetchAppList` and user was already authorized', async () => {
    apps = [{ someApp: 'someAppItem#01' }];
    getAppList.mockResolvedValue(apps);
    checkIfAuthorized.mockResolvedValue({ isAuthorized: true });

    window.location.assign(`/some-url?engine_url=wss://${engineUrl}&qlik-client-id=${clientId}`);
    await act(async () => {
      renderResult = renderHook(() => useAppList({ glob, info }), { wrapper: RouterWrapper });
    });

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(
      `/some-url?engine_url=wss://${engineUrl}&qlik-client-id=${clientId}&shouldFetchAppList=true`
    );
  });
});
