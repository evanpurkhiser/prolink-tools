import {WEBSERVER_PORT} from 'src/shared/constants';

export const webBaseUrl = process.env.BASE_WEB_URL ?? 'https://prolink.tools';
export const apiBaseUrl = process.env.BASE_API_URL ?? 'https://api.prolink.tools';

export const overlayBaseUrl = `http://localhost:${WEBSERVER_PORT}`;
