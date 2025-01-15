import React from 'react';
import { screen, act } from '@testing-library/react';
import * as reactRouterDomModule from 'react-router';
import { TestRenderer } from '../../../../utils/testRenderer';
import FormManager from '../FormManager';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: jest.fn(),
}));

describe('<FormManager />', () => {
  let info;
  let error;
  let fields;
  let isCredentialProvided;
  let setErrorMock;
  let useNavigateMock;
  let navigateMock;
  let engineUrl;
  let clientId;
  let webIntegrationId;

  beforeAll(() => {
    info = {};
    error = null;
    fields = [];
    isCredentialProvided = false;
    setErrorMock = jest.fn();
    navigateMock = jest.fn();
    useNavigateMock = jest.fn().mockReturnValue(navigateMock);

    jest.spyOn(reactRouterDomModule, 'useNavigate').mockImplementation(useNavigateMock);
  });

  test('should render properly', () => {
    fields = ['field#01', 'field#02'];
    TestRenderer(<FormManager {...{ info, error, fields, isCredentialProvided }} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    fields.map((fld) => {
      expect(screen.getByPlaceholderText(fld)).toBeInTheDocument();
    });
  });

  test('should update fields and submit form with web integration id', async () => {
    engineUrl = 'ws://localhost:9076';
    webIntegrationId = 'xxx_web_integration_id_xxx';
    fields = ['engine-websocket-url', 'web-integration-id'];
    const { userEvents } = TestRenderer(<FormManager {...{ info, error, fields, isCredentialProvided }} />, {
      setError: setErrorMock,
    });

    await act(() => userEvents.type(screen.getByPlaceholderText(fields[0]), engineUrl));
    await act(() => userEvents.type(screen.getByPlaceholderText(fields[1]), webIntegrationId));
    await act(() => userEvents.click(screen.getByRole('button')));

    expect(setErrorMock).toHaveBeenCalledTimes(1);
    expect(setErrorMock).toHaveBeenCalledWith();
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(
      `/app-list?engine_url=${engineUrl}/&qlik-web-integration-id=${webIntegrationId}`
    );
  });

  test('should update fields and submit form with client id', async () => {
    engineUrl = 'ws://localhost:9076';
    clientId = 'xxx_client_id_xxx';
    fields = ['engine-websocket-url', 'client-id'];
    const { userEvents } = TestRenderer(<FormManager {...{ info, error, fields, isCredentialProvided }} />, {
      setError: setErrorMock,
    });

    await act(() => userEvents.type(screen.getByPlaceholderText(fields[0]), engineUrl));
    await act(() => userEvents.type(screen.getByPlaceholderText(fields[1]), clientId));
    await act(() => userEvents.click(screen.getByRole('button')));

    expect(setErrorMock).toHaveBeenCalledTimes(1);
    expect(setErrorMock).toHaveBeenCalledWith();
    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith(`/app-list?engine_url=${engineUrl}/&qlik-client-id=${clientId}`);
  });
});
