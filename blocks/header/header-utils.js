import { toClassName } from '../../scripts/aem.js';

export function createTabs(block, navFragment) {
  let title = 0;
  const ul = block.querySelector('ul');
  if (!ul) return null;

  const tabs = [...ul.querySelectorAll('li')].map((li) => {
    if (!li.textContent) {
      title = li.querySelector('img').getAttribute('data-icon-name');
    } else title = li.textContent;
    const name = title.toLowerCase().trim();
    return {
      title,
      name,
      tabButton: li,
    };
  });

  const panel = document.createElement('div');
  panel.classList.add('hero-horiz-tabs-panel');

  const nav = document.createElement('nav');
  nav.classList.add('hero-horiz-tabs-nav');

  nav.replaceChildren(ul);
  panel.appendChild(nav);
  block.replaceChildren(panel);

  // search referenced sections and move them inside the tab-container
  const sections = navFragment.querySelectorAll('[data-tab]');

  // move the tab's sections before the tab riders.
  [...sections].forEach((tabContent) => {
    const name = tabContent.dataset.tab.toLowerCase().trim();
    const tab = tabs.find((t) => t.name === name);
    if (tab) {
      const sectionWrapper = document.createElement('div');

      // copy the classes from the section to the wrapper
      [...tabContent.classList].forEach((c) => {
        sectionWrapper.classList.add(c);
      });

      const tabDiv = document.createElement('div');
      tabDiv.classList.add('tab-item');
      tabDiv.append(...tabContent.children);
      sectionWrapper.append(tabDiv);

      tabContent.remove();
      tab.content = tabDiv;
    }
  });
  return tabs;
}

export function addTabs(tabs, isDesktop) {
  tabs.forEach((tab) => {
    const button = document.createElement('button');
    const { tabButton, title } = tab;
    button.textContent = title.split(',');
    if (button.textContent === 'hamburger') {
      console.error('Hamburger tab should have already been handled', tab);
      return;
    }

    tabButton.classList.add(toClassName(title));

    if (button.textContent === 'hyundai') {
      // eslint-disable-next-line
      button.innerHTML='<span class="icon icon-hyundai"><img data-icon-name="hyundai" src="/icons/hyundai.svg" alt="" loading="lazy"></span>';
      button.classList.add('onlyclick');
      button.classList.add('tab');
      tabButton.replaceChildren(button);
    } else {
      button.classList.add('tab');
      tabButton.replaceChildren(button);
      // TODO handle "Ofertas" tab
      if (tab.content) {
        tab.content.classList.add('desktop-only');
        button.after(tab.content);
      }

      tabButton.addEventListener('mouseover', () => {
        if (!isDesktop.matches) {
          return;
        }

        document.body.classList.remove('nav-open');
      });
    }
  });
}
