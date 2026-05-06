import { restConnector } from './restConnector.js';
export const HaloConnect={ call:({service,payload})=>restConnector(service.endpoint.url,payload) };
