import Promise from 'promise-polyfill';
import './polyfills/startsWith';
import './polyfills/endsWith';
import './polyfills/findIndex';
import './polyfills/find';
import './polyfills/includes';
import { loadFontGroup } from './utils/load-font';

// polyfill promise
if (!window.Promise) window.Promise = Promise;

// load fonts
// loadFontGroup(canela);
// loadFontGroup(publico);
// loadFontGroup(atlas);
