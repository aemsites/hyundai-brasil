import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.innerHTML = row.innerHTML;

    const addCardChildrenClasses = (div) => {
      if (div.children.length === 1 && (div.querySelector(':scope>picture') || div.querySelector(':scope>.icon'))) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    };

    // find the first <a> deep in the <li>
    const a = li.querySelector('a');

    if (a && !block.classList.contains('nolink')) {
      const aContent = a.innerHTML;
      const cardTitleDiv = document.createElement('div');
      cardTitleDiv.innerHTML = aContent;
      a.replaceWith(cardTitleDiv);
      a.innerHTML = '';
      a.append(...li.children);
      li.append(a);
      [...a.children].forEach(addCardChildrenClasses);
    } else {
      [...li.children].forEach(addCardChildrenClasses);
    }

    ul.append(li);
  });

  ul.querySelectorAll('img')
    .forEach((img) => {
      if (img.src.includes('icon')) {
        img.replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
      } else
        img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]))
    });

  if (ul.querySelector('a') === null && !block.classList.contains('omit-nolink-styles') && block.closest('.section.cards-container')) {
    block.closest('.section.cards-container').classList.add('nolink');
  }
  block.textContent = '';
  block.append(ul);
}
