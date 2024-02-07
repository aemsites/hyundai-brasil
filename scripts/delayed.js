// eslint-disable-next-line import/no-cycle
import { loadScript, sampleRUM } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

loadScript('https://plugin.handtalk.me/web/latest/handtalk.min.js').then(() => {
  // eslint-disable-next-line no-new,no-undef
  new HT({
    avatar: 'MAYA',
    align: 'bottom',
    side: 'left',
    highContrast: true,
    token: 'b90cfe223dbe6f25e09584a3e5f36ebb',
  });
});
