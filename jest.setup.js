import '@testing-library/jest-dom';
import 'whatwg-fetch';
import 'jest-location-mock';
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });
