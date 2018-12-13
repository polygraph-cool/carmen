import Promise from 'promise-polyfill';
import './polyfills/startsWith';
import './polyfills/endsWith';
import './polyfills/findIndex';
import './polyfills/find';
import './polyfills/includes';
import { loadFontGroup } from './utils/load-font';

// polyfill promise
if (!window.Promise) window.Promise = Promise;

const netflix = [
	{ family: 'Netflix Sans', weight: 300 },
	{ family: 'Netflix Sans', weight: 400 },
	{ family: 'Netflix Sans', weight: 700 }
];

// load fonts
loadFontGroup(netflix);
// loadFontGroup(publico);
// loadFontGroup(atlas);
