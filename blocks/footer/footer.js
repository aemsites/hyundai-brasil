import {
  decorateBlock,
  decorateButtons,
  decorateIcons,
  decorateSections,
  getMetadata,
  loadBlock,
  updateSectionsStatus,
} from '../../scripts/aem.js';

import {
  decorateAnchors,
} from '../../scripts/scripts.js';

function decorateFooterMultilist(block) {
  const footerTop = block.querySelector('.multilist');
  const tempDiv = footerTop.querySelector('.default-content-wrapper');
  const children = [...footerTop.querySelector('.default-content-wrapper').children];
  let index = 0;
  tempDiv.innerHTML = '';

  while (index < children.length) {
    const topItem = document.createElement('div');
    topItem.appendChild(children[index]);
    index += 1;

    while (index < children.length) {
      if (children[index].tagName === 'H2') {
        if (!children[index + 1] || (children[index - 1].tagName === 'H5' && children[index + 1].tagName !== 'UL')) {
          topItem.appendChild(children[index]);
        } else {
          break;
        }
      } else {
        topItem.appendChild(children[index]);
      }
      index += 1;
    }

    tempDiv.appendChild(topItem);
  }
}

function decorateFooter(block) {
  decorateFooterMultilist(block);
  block.parentElement.classList.add('appear');
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  block.textContent = '';

  // fetch footer content
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();

    // decorate footer DOM
    const footer = document.createElement('div');
    footer.innerHTML = html;
    decorateSections(footer);
    updateSectionsStatus(footer);

    block.append(footer);

    decorateButtons(block);
    decorateFooter(block);
    decorateAnchors(block);
    const footerForm = footer.querySelector('.form');
    decorateBlock(footerForm);
    await loadBlock(footerForm);
    await decorateIcons(block);

    block.querySelectorAll('.section.social-icons img').forEach((img) => {
      const iconName = img.getAttribute('data-icon-name');
      const capitalizedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);

      img.alt = `${capitalizedIconName} Hyundai Motor Brasil`;
    });
  }
}
