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

export function enableHover(tabButton, block, button, tab, navPanel, navFragment) {
  function disableHoverEffect(activeButton) {
    activeButton.classList.remove('active');
    // remove active class from parent li
    activeButton.parentElement.classList.remove('active');
    if (tab.content) {
      tab.content.classList.remove('active');
      if (navPanel.nextSibling) navPanel.nextSibling.remove();
    }
  }

  // document.body.querySelector('main').addEventListener('mouseover', () => {
  //   const activeButton = block.querySelector('button.active');
  //   if (activeButton === tabButton && !activeButton.querySelector('.icon-hamburger')) {
  //     disableHoverEffect(activeButton);
  //   }
  // });

  document.querySelector('main .section.columns-container').addEventListener('mouseover', () => {
    const activeButton = block.querySelector('button.active');
    if (activeButton) {
      disableHoverEffect(activeButton);
    }
  });

  navFragment.querySelector('div:not(.section.nav-sections').addEventListener('mouseover', () => {
    const activeButton = block.querySelector('button.active');
    if (activeButton) {
      disableHoverEffect(activeButton);
    }
  });

  tabButton.addEventListener('mouseover', () => {
    const activeButton = block.querySelector('button.active');

    if (!activeButton) {
      button.classList.add('active');
      // add active class to parent li
      tabButton.classList.add('active');
      if (tab.content) {
        tab.content.classList.add('active');
        navPanel.after(tab.content);
        navPanel.nextSibling.classList.add('tab-active');
      }
    } else if (activeButton !== tabButton) {
      disableHoverEffect(activeButton);
      button.classList.add('active');
      // add active class to parent li
      tabButton.classList.add('active');
      if (tab.content) {
        tab.content.classList.add('active');
        navPanel.after(tab.content);
      }
    }
  });
}

export function enableClick(tabButton, block, button, tab, navPanel) {
  tabButton.addEventListener('click', () => {
    const activeButton = block.querySelector('button.active');
    if (!activeButton) {
      button.classList.add('active');
      // add active class to parent li
      tabButton.classList.add('active');
      if (tab.content) {
        tab.content.classList.add('active');
        navPanel.after(tab.content);
        navPanel.nextSibling.classList.add('tab-active');
      }
    } else if (activeButton !== tabButton.firstChild) {
      activeButton.classList.remove('active');
      // remove active class from parent li
      activeButton.parentElement.classList.remove('active');
      if (tab.content) {
        tab.content.classList.remove('active');
        navPanel.nextSibling.remove();
      }
      button.classList.add('active');
      // add active class to parent li
      tabButton.classList.add('active');
      if (tab.content) {
        tab.content.classList.add('active');
        navPanel.after(tab.content);
      }
    } else {
      button.classList.remove('active');
      tabButton.classList.remove('active');
      if (tab.content) {
        tab.content.classList.remove('active');
        navPanel.nextSibling.remove();
      }
    }
  });
}

export function addTabs(tabs, block, navFragment) {
  const navPanel = navFragment.querySelector('.section.nav-sections').parentElement;
  tabs.forEach((tab) => {
    const button = document.createElement('button');
    const { tabButton, title } = tab;
    button.textContent = title.split(',');
    console.log(button.textContent);
    if (button.textContent === 'hamburger') {
    // eslint-disable-next-line
      button.innerHTML='<span class="icon icon-hamburger"><img data-icon-name="hamburger" src="/icons/hamburger.svg" alt="" loading="lazy"></span>';
      button.classList.add('onlyclick');
      button.classList.add('tab');
      tabButton.replaceChildren(button);
      enableClick(tabButton, block, button, tab, navPanel);
    } else if (button.textContent === 'hyundai') {
      // eslint-disable-next-line
      button.innerHTML='<span class="icon icon-hyundai"><img data-icon-name="hyundai" src="/icons/hyundai.svg" alt="" loading="lazy"></span>';
      button.classList.add('onlyclick');
      button.classList.add('tab');
      tabButton.replaceChildren(button);
    } else {
      button.classList.add('tab');
      tabButton.replaceChildren(button);
      enableHover(tabButton, block, button, tab, navPanel, navFragment);
    }
  });
}
