import { mockConnectors } from './mockConnectors.js';
export function restConnector(url,payload){ return mockConnectors[url]?.(payload) || { result:'unsupported' }; }
