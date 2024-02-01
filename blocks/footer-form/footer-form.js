import { span } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  block.replaceChildren(span('form placeholder'));
}
