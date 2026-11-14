import { afterEach } from 'vite-plus/test';

import { cleanup } from './render';

// Tells React that `act` is in use, so it warns about updates that escape it.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// jsdom has no layout and no `scrollIntoView`, which active-item scrolling calls.
window.HTMLElement.prototype.scrollIntoView = (): void => undefined;

afterEach(cleanup);
