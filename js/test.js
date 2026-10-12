// Тест на уровень английского: 16 вопросов, по четыре на каждый уровень от A1 до B2.
// В каждом вопросе: текст, варианты и номер правильного варианта (счёт с нуля).
const QUESTIONS = [
  ['She ___ a teacher.', ['am', 'is', 'are', 'be'], 1],
  ['___ you like coffee?', ['Do', 'Does', 'Are', 'Is'], 0],
  ['There ___ two books on the table.', ['is', 'are', 'be', 'has'], 1],
  ['I ___ to school every day.', ['go', 'goes', 'going', 'gone'], 0],
  ['Yesterday we ___ to the cinema.', ['go', 'went', 'gone', 'going'], 1],
  ['This book is ___ than that one.', ['interesting', 'more interesting', 'most interesting', 'the more interesting'], 1],
  ['I ___ TV when you called.', ['watched', 'was watching', 'watch', 'am watching'], 1],
  ['How ___ money do you have?', ['many', 'much', 'a lot', 'few'], 1],
  ['I have lived here ___ 2015.', ['for', 'since', 'from', 'during'], 1],
  ['If it rains tomorrow, we ___ at home.', ['stay', 'will stay', 'would stay', 'stayed'], 1],
  ['The letter ___ yesterday.', ['sent', 'was sent', 'has sent', 'is sending'], 1],
  ['She asked me where I ___.', ['live', 'lived', 'do live', 'am living'], 1],
  ['If I had known, I ___ you.', ['would tell', 'would have told', 'will tell', 'had told'], 1],
  ["I'm not used to ___ up so early.", ['get', 'getting', 'got', 'be getting'], 1],
  ['By the time we arrived, the film ___.', ['already started', 'had already started', 'has already started', 'was already starting'], 1],
  ['He denied ___ the window.', ['to break', 'breaking', 'break', 'broke'], 1],
];

// Результат по числу верных ответов. formLevel — значение для поля «Уровень» в форме записи.
const LEVELS = [
  { min: 13, code: 'B2', name: 'выше среднего', formLevel: 'B2 и выше',
    text: 'Вы уверенно владеете грамматикой. Дальше имеет смысл работать над беглостью речи, точностью и словарным запасом под ваши задачи.' },
  { min: 9, code: 'B1', name: 'средний', formLevel: 'B1',
    text: 'У вас хорошая база: вы справляетесь с основными временами и конструкциями. Следующий шаг — сложные времена, условные предложения и свободная речь.' },
  { min: 5, code: 'A2', name: 'элементарный', formLevel: 'A1–A2',
    text: 'Основы вы знаете: простые времена и базовые конструкции уже знакомы. Теперь важно закрепить их в речи и расширить словарный запас.' },
  { min: 0, code: 'A1', name: 'начальный', formLevel: 'A1–A2',
    text: 'Вы в начале пути — и это отличная точка старта. Начнём с базовых конструкций и простых фраз, которые сразу можно использовать в разговоре.' },
];

const quiz = document.getElementById('quiz');
if (quiz) {
  let index = 0;
  let score = 0;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const answer = (isRight) => {
    if (isRight) score += 1;
    index += 1;
    if (index < QUESTIONS.length) showQuestion();
    else showResult();
  };

  function showQuestion() {
    const [text, options, right] = QUESTIONS[index];
    const top = el('div', 'quiz-top');
    top.append(el('span', '', `Вопрос ${index + 1} из ${QUESTIONS.length}`), el('span', '', 'Выберите один вариант'));
    const bar = el('div', 'quiz-bar');
    const fill = el('span');
    fill.style.width = `${(index / QUESTIONS.length) * 100}%`;
    bar.append(fill);
    const question = el('p', 'quiz-q', text);
    question.lang = 'en';
    question.tabIndex = -1;
    const list = el('div', 'quiz-options');
    options.forEach((option, i) => {
      const button = el('button', '', option);
      button.type = 'button';
      button.lang = 'en';
      button.addEventListener('click', () => answer(i === right));
      list.append(button);
    });
    const skip = el('button', 'skip-q', 'Не знаю');
    skip.type = 'button';
    skip.addEventListener('click', () => answer(false));
    list.append(skip);
    quiz.replaceChildren(top, bar, question, list);
    question.focus({ preventScroll: true });
  }

  function showResult() {
    const level = LEVELS.find((item) => score >= item.min);
    const box = el('div', 'quiz-result');
    box.setAttribute('role', 'status');
    const heading = el('h2', 'h3', `${level.name[0].toUpperCase()}${level.name.slice(1)} уровень`);
    heading.tabIndex = -1;
    const actions = el('div', 'actions');
    const apply = el('a', 'btn', 'Отправить заявку на пробный урок');
    apply.href = `kontakty.html?level=${encodeURIComponent(level.formLevel)}#zapis`;
    const again = el('button', 'btn btn-ghost', 'Пройти ещё раз');
    again.type = 'button';
    again.addEventListener('click', () => { index = 0; score = 0; showQuestion(); });
    actions.append(apply, again);
    box.append(
      el('p', '', 'Ваш примерный уровень'),
      el('p', 'quiz-level', level.code),
      heading,
      el('p', '', `Верных ответов: ${score} из ${QUESTIONS.length}. ${level.text}`),
      el('p', 'quiz-good', 'Хорошая новость: при регулярных занятиях и правильно подобранной программе уровень можно поднять быстрее, чем кажется. Оставьте заявку — на пробном уроке уточним ваш уровень и составим план.'),
      actions,
    );
    quiz.replaceChildren(box);
    heading.focus({ preventScroll: true });
    quiz.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (typeof track === 'function') track('level_test_done', { level: level.code, score });
  }

  const start = quiz.querySelector('[data-quiz-start]');
  if (start) start.addEventListener('click', showQuestion);
}
