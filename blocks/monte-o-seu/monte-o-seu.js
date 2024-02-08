import {
  a, button, div, h5, img, input, label, span,
} from '../../scripts/dom-helpers.js';
import { decorateIcons } from '../../scripts/aem.js';

function createRadioEntry(name, text, value) {
  const id = `${name}-${value}`;
  return label(
    { for: id },
    input({
      type: 'radio',
      name,
      id,
      value,
    }),
    span({ class: 'radio-button' }),
    text,
  );
}

function getQuestions() {
  return div(
    { class: 'questions' },
    div(
      label('Em uma escala de 0 a 10, quanto você recomendaria o site da Hyundai?'),
      div(
        { class: 'question-rating-content' },
        div(
          { class: 'question-rating', 'data-rating': '0' },
          label(
            { class: 'data-list', for: 'score' },
            ...Array.from({ length: 11 }, (_, i) => span({ class: 'range-mark' }, i.toString())),
          ),
          input({
            type: 'range',
            name: 'score',
            id: 'score',
            list: 'values',
            step: '10',
            value: '0',
          }),
        ),
        div(
          { class: 'question-rating-text' },
          // TODO see if we can avoid adding newlines here
          div({ class: 'rating-min-text' }, '😒\nJamais\nrecomendaria'),
          div({ class: 'rating-max-text' }, '😊\nCom certeza\nrecomendo'),
        ),
      ),
    ),
    div(
      label({ for: 'scoreReason' }, 'Descreva em poucas palavras o motivo da sua nota atribuída:\n'),
      input({ type: 'text', name: 'scoreReason', id: 'scoreReason' }),
    ),
    div(
      label('Qual foi o principal motivo da sua visita ao nosso site hoje?'),
      div(
        { class: 'radio' },
        ...[
          { value: '1', text: 'Pesquisar preços dos carros;' },
          { value: '2', text: 'Procurar por promoções e ofertas de carros;' },
          { value: '3', text: 'Avaliar o meu usado como entrada na compra de um novo;' },
          { value: '7', text: 'Realizar a compra do meu carro pelo site;' },
          { value: '4', text: 'Simular um financiamento e ver o valor das parcelas;' },
          { value: '5', text: 'Solicitar agendamento de test drive;' },
          { value: '6', text: 'Solicitar agendamento de serviços;' },
          { value: '8', text: 'Solicitar uma cotação;' },
          { value: '9', text: 'Procurar um concessionário;' },
          { value: '10', text: 'Fazer uma reclamação;' },
          { value: '11', text: 'Outros' },
        ].map((reason) => createRadioEntry('visitReason', reason.text, reason.value)),
      ),
    ),
    div(
      label('Você conseguiu fazer o que pretendia?'),
      div(
        { class: 'radio inline' },
        createRadioEntry('managedAccomplish', 'Sim', '1'),
        createRadioEntry('managedAccomplish', 'Não', '2'),
      ),
    ),
  );
}

export default async function decorate(block) {
  const openButton = div(
    { class: 'flecha' },
    img(
      { src: '/icons/flecha.avif', alt: 'Icon Abertura Mosca' },
    ),
  );

  openButton.addEventListener('click', () => {
    block.classList.remove('minimized');
  });

  const closeButton = span({ class: 'icon icon-close' });
  closeButton.addEventListener('click', () => {
    const minimize = () => {
      block.classList.add('minimized');
    };

    if (block.classList.contains('survey-open')) {
      block.classList.remove('survey-open');
      setTimeout(minimize, 500);
    } else {
      minimize();
    }
  });

  const surveyContent = div(
    { class: 'survey' },
    div(
      h5('Como foi sua experiência em nosso site hoje?'),
      getQuestions(),
    ),
    div({ class: 'mandatory-text' }, '*Todos os campos são de preenchimento obrigatório.'),
    button({ type: 'button', class: 'send' }, 'ENVIAR'),
    div(
      { class: 'survey-success' },
      div(
        { class: 'success-content' },
        div({ class: 'success-text' }, 'Muito obrigado por sua contribuição. Gostaria que a Hyundai entrasse em contato com você?'),
        div(
          { class: 'newsletter-text' },
          button({ type: 'button', class: 'newsletter-button' }, 'Se inscreva '),
          span('para receber as últimas novidades da Hyundai.'),
        ),
      ),
    ),
  );

  const openSurveyButton = span({ class: 'icon icon-smiley-survey' });
  openSurveyButton.addEventListener('click', () => {
    block.classList.add('survey-open');
  });
  const closeSurveyButton = span({ class: 'icon icon-undo' });
  closeSurveyButton.addEventListener('click', () => {
    block.classList.remove('survey-open');
  });

  block.replaceChildren(
    div(
      openButton,
      div(
        { class: 'menu' },
        closeButton,
        // TODO change href to point to the internal site once migrated
        a({ class: 'monte-link', href: 'https://www.hyundai.com.br/monte-o-seu.html' }, 'Monte o seu'),
        openSurveyButton,
        closeSurveyButton,
        a({
          class: 'whatsapp',
          href: 'https://api.whatsapp.com/send?phone=5508007703355&text=Ol%C3%A1!+Entrei+no+site+da+Hyundai+e+gostaria+de+saber+mais.',
        }, span({ class: 'icon icon-whatsapp', 'aria-label': 'WPP floating button' })),
      ),
    ),
    surveyContent,
  );

  await decorateIcons(block);
}
