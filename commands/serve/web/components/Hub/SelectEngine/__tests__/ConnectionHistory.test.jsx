import React from 'react';
import { screen, act } from '@testing-library/react';
import * as reactRouterDomModule from 'react-router';
import { TestRenderer } from '../../../../utils';
import ConnectionHistory from '../ConnectionHistory';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: jest.fn(),
}));

describe('<ConnectionHistory />', () => {
  let useNavigateMock;
  let navigateMock;

  beforeAll(() => {
    navigateMock = jest.fn();
    useNavigateMock = jest.fn().mockReturnValue(navigateMock);

    jest.spyOn(reactRouterDomModule, 'useNavigate').mockImplementation(useNavigateMock);
  });

  afterAll(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should not render if there was no saved `cachedConnections`', () => {
    TestRenderer(<ConnectionHistory />, {
      cachedConnectionsData: {
        cachedConnections: [],
      },
    });
    expect(screen.queryByText('Previous connections')).not.toBeInTheDocument();
  });

  test('should render if there was any saved `cachedConnections`', () => {
    const cachedConnectionsData = {
      cachedConnections: ['oldConnection#01', 'oldConnection#02'],
    };
    TestRenderer(<ConnectionHistory />, { cachedConnectionsData });

    expect(screen.queryByText('Previous connections')).toBeInTheDocument();
    cachedConnectionsData.cachedConnections.map((conn) => {
      expect(screen.queryByText(conn)).toBeInTheDocument();
    });
  });

  test('should disable all other connections if there was `qlik-client-id` provided from info', () => {
    const cachedConnectionsData = {
      cachedConnections: [
        'ws://localhost:9076',
        'wss://some.pte.qlikdev.com/?qlik-client-id=SOME_CLIENT_ID',
        'wss://some.pte.qlikdev.com/?qlik-web-integration-id=SOME_INTEGRATION_ID',
      ],
    };
    TestRenderer(<ConnectionHistory />, { cachedConnectionsData, info: { isClientIdProvided: true } });

    // disabled items
    [cachedConnectionsData.cachedConnections[0], cachedConnectionsData.cachedConnections[2]].map((conn) => {
      expect(screen.queryByText(conn).closest('a')).toHaveAttribute('aria-disabled', 'true');
    });

    // not disabled item
    expect(screen.queryByText(cachedConnectionsData.cachedConnections[1]).closest('a')).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  test('should disable all other connections if there was `qlik-web-integration-id` provided from info', () => {
    const cachedConnectionsData = {
      cachedConnections: [
        'ws://localhost:9076',
        'wss://some.pte.qlikdev.com/?qlik-client-id=SOME_CLIENT_ID',
        'wss://some.pte.qlikdev.com/?qlik-web-integration-id=SOME_INTEGRATION_ID',
      ],
    };
    TestRenderer(<ConnectionHistory />, { cachedConnectionsData, info: { isWebIntegrationIdProvided: true } });

    // disabled items
    [(cachedConnectionsData.cachedConnections[0], cachedConnectionsData.cachedConnections[1])].map((conn) => {
      expect(screen.queryByText(conn).closest('a')).toHaveAttribute('aria-disabled', 'true');
    });

    // not disabled item
    expect(screen.queryByText(cachedConnectionsData.cachedConnections[2]).closest('a')).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  test('should reset error and navigate to app if any items was clicked from cache', async () => {
    const cachedConnectionsData = {
      cachedConnections: [
        'ws://localhost:9076',
        'wss://some.pte.qlikdev.com/?qlik-client-id=SOME_CLIENT_ID',
        'wss://some.pte.qlikdev.com/?qlik-web-integration-id=SOME_INTEGRATION_ID',
      ],
    };
    const setErrorMock = jest.fn();
    const { userEvents } = TestRenderer(<ConnectionHistory />, { cachedConnectionsData, setError: setErrorMock });

    await act(async () => {
      await userEvents.click(screen.queryByText(cachedConnectionsData.cachedConnections[0]));
    });
    expect(setErrorMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(`/app-list?engine_url=${cachedConnectionsData.cachedConnections[0]}`);
  });

  test('should remove item from cached connections', async () => {
    const removeCachedConnectionMock = jest.fn();
    const cachedConnectionsData = {
      cachedConnections: [
        'ws://localhost:9076',
        'wss://some.pte.qlikdev.com/?qlik-client-id=SOME_CLIENT_ID',
        'wss://some.pte.qlikdev.com/?qlik-web-integration-id=SOME_INTEGRATION_ID',
      ],
      removeCachedConnection: removeCachedConnectionMock,
    };
    const setErrorMock = jest.fn();
    const { userEvents } = TestRenderer(<ConnectionHistory />, { cachedConnectionsData, setError: setErrorMock });

    await userEvents.click(screen.getAllByTestId('close-btn')[0]);

    expect(removeCachedConnectionMock).toHaveBeenCalledTimes(1);
    expect(removeCachedConnectionMock).toHaveBeenCalledWith(cachedConnectionsData.cachedConnections[0]);
  });
});
