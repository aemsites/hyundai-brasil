import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './aem.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const firstDiv = main.querySelector(':scope > div:first-child');
  const pictures = firstDiv.querySelectorAll('picture');
  const firstPicture = pictures[0] ?? null;
  if (pictures.length === 2) {
    const secondPicture = pictures[1];
    const secondSource = secondPicture.querySelector('source:last-of-type');
    secondSource.setAttribute('media', '(min-width: 1024px)');

    firstPicture.prepend(secondSource);
  }

  const picture = firstPicture;

  const h1 = main.querySelector('h1');

  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const elems = [picture, h1];
    const h2 = main.querySelector('h2');
    // eslint-disable-next-line no-bitwise
    if (h2 && (h2.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_PRECEDING)) {
      elems.push(h2);
    }

    h1.parentElement.replaceChildren(buildBlock('hero', { elems }));
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  console.log('loading fonts');
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function getUrlExtension(url) {
  return url.split(/[#?]/)[0].split('.').pop().trim();
}

/**
 * decorates anchors with video links
 * for styling updates via CSS
 * @param {Element}s anchor elements to decorate
 * @returns {void}
 */
export function decorateVideoLinks(youTubeAnchors) {
  // currently only youtube links are supported
  if (youTubeAnchors.length) {
    youTubeAnchors.forEach((a) => {
      a.classList.add('video-link');
      a.classList.add('youtube');
    });
  }
}

/**
 * decorates external links to open in new window
 * for styling updates via CSS
 * @param {Element}s element The element to decorate
 * @returns {void}
 */
export function decorateExternalAnchors(externalAnchors) {
  if (externalAnchors.length) {
    externalAnchors.forEach((a) => {
      a.target = '_blank';
    });
  }
}

/**
 * decorates links with download icon as downloadables
 * @param {Element}s to decorate downloadableLink
 * @returns {void}
 */
export function decorateDownloadableLinks(downloadableLinks) {
  if (downloadableLinks.length) {
    downloadableLinks.forEach((link) => {
      link.setAttribute('download', '');
      link.removeAttribute('target');
    });
  }
}

/**
 * decorates anchors
 * for styling updates via CSS
 * @param {Element} element The element to decorate
 * @returns {void}
 */
export function decorateAnchors(element = document) {
  const anchors = element.getElementsByTagName('a');
  decorateVideoLinks(Array.from(anchors).filter(
    (a) => a.href.includes('youtu'),
  ));
  decorateExternalAnchors(Array.from(anchors).filter(
    (a) => a.href && (!a.href.match(`^http[s]*://${window.location.host}/`)
      || ['pdf'].includes(getUrlExtension(a.href).toLowerCase())),
  ));
  decorateDownloadableLinks(Array.from(anchors).filter(
    (a) => (a.querySelector('span.icon-download') || a.closest('.download')),
  ));
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateAnchors(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 992 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 5000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
