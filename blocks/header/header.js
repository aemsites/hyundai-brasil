import { decorateIcons, getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { addTabs, createTabs } from './header-utils.js';
import { div, img, span } from '../../scripts/dom-helpers.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');

  const mobileSectionHeader = div(
    { class: 'item-mobile-header' },
    span({ class: 'icon icon-arrow inverted' }),
    span('Placeholder header'),
  );
  const navPanel = nav.querySelector('.section.nav-sections').parentElement;
  mobileSectionHeader.addEventListener('click', () => {
    navPanel.classList.remove('show-mobile-section');
  });

  const tabs = createTabs(navSections, nav);

  navSections.nextSibling.replaceWith(
    div(
      { class: 'section mobile mobile-only' },
      mobileSectionHeader,
      div(
        { class: 'item-mobile-body' },
        span('Placeholder body'),
      ),
    ),
  );

  const hamburgerTab = tabs.find((t) => t.title === 'hamburger');
  tabs.splice(tabs.indexOf(hamburgerTab), 1);

  const heroHorizTabsNav = navSections.querySelector('.hero-horiz-tabs-nav');

  console.log('found hamburger tab', hamburgerTab);
  {
    const button = document.createElement('button');
    const { tabButton, content } = hamburgerTab;
    const clonedContent = content.cloneNode(true);
    clonedContent.classList.add('hamburger-tab', 'desktop-only');
    heroHorizTabsNav.after(clonedContent);

    button.textContent = 'hamburger';
    // eslint-disable-next-line
    button.innerHTML = '<span class="icon icon-hamburger"><img data-icon-name="hamburger" src="/icons/hamburger.svg" alt="" loading="lazy"></span>';
    button.classList.add('onlyclick');
    button.classList.add('tab');
    tabButton.replaceChildren(button);
    // enableClick(tabButton, block, button, hamburgerTab, navPanel);
    button.addEventListener('click', () => {
      function toggleNav() {
        document.body.classList.toggle('nav-open');
        toggleMenu(nav, navSections);
      }

      if (navPanel.classList.contains('show-mobile-section')) {
        navPanel.classList.remove('show-mobile-section');
        setTimeout(toggleNav, 500);
      } else {
        toggleNav();
      }
    });
  }

  addTabs(tabs, block, nav, isDesktop);

  navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
    if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
    navSection.addEventListener('click', () => {
      if (isDesktop.matches) {
        const expanded = navSection.getAttribute('aria-expanded') === 'true';
        toggleAllNavSections(navSections);
        navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      }
    });
  });

  const clonedTab = hamburgerTab.content.cloneNode(true);
  const mobileHamburgerSection = div({ class: 'mobile-only main-tab' }, ...clonedTab.querySelectorAll('ul'));
  heroHorizTabsNav.after(mobileHamburgerSection);

  const hyundaiBlueSpan = span({ class: 'icon icon-hyundai-blue' });
  nav.querySelector('span.icon-hyundai').after(hyundaiBlueSpan);

  nav.querySelectorAll('nav.hero-horiz-tabs-nav > ul > li:not(:last-child)').forEach((li) => {
    li.append(span({ class: 'icon icon-arrow' }));
  });
  nav.querySelector('nav.hero-horiz-tabs-nav > ul > li:last-child').append(img(
    { class: 'icon-ofertas', src: '/icons/ofertas.avif', alt: 'Icon ofertas' },
  ));
  decorateIcons(nav);

  if (isDesktop.matches) {
    const rightNavSection = document.createElement('ul');
    nav.querySelectorAll('.section.nav-sections .hero-horiz-tabs-nav ul > li:not(:has(button.onlyclick))');
    nav.querySelectorAll('.section.nav-sections .hero-horiz-tabs-nav ul > li:not(:has(button.onlyclick))').forEach((x) => {
      rightNavSection.appendChild(x);
    });
    const parent = nav.querySelector('.section.nav-sections .hero-horiz-tabs-nav');
    parent.appendChild(rightNavSection);
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => {
    function toggleNav() {
      document.body.classList.toggle('nav-open');
      if (!isDesktop.matches) {
        // navPanel.classList.toggle('show');
        /* wait for 2 seconds */
      }
      toggleMenu(nav, navSections);
    }

    if (navPanel.classList.contains('show-mobile-section')) {
      navPanel.classList.remove('show-mobile-section');
      setTimeout(toggleNav, 500);
    } else {
      toggleNav();
    }
  });
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
