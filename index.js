'use strict';

/** @typedef {{name: String, href: String}} Article */

/** @type {{json: () => Object}} */
const toJson = r => r.json();
const emptyArr = () => [];

/** @type {() => String[]} */
const getArticles = (() => {
  /** @type {String[]} */
  let articles = [];

  return async () => {
    if (articles.length) return articles;
    return articles = await fetch('/wiki/articles.json')
      .then(toJson)
      .catch(emptyArr);
  };
})();

/** @type {(name: String) => Article} */
const articleNameToArticle = name => ({
  name: name.toLowerCase(),
  href: `/wiki/en/${name.replaceAll(" ", "_")}.html`
});

/** @type {(query: String) => Article[]} */
const matchRecommends = (() => {
  /** @type {String[]} */
  let articles = [];
  /** @type {String | null} */
  let previousQuery = null;

  return async query => {
    if (query === '') return [];
    query = query.toLowerCase().trim();
    if (!query.startsWith(previousQuery)) {
      articles = await getArticles();
    }
    previousQuery = query;
    articles = articles.filter(art => art.toLowerCase().includes(query))
    return articles.map(articleNameToArticle);
  };
})();

/** @type {(html: String) => HTMLElement} */
const htmlToElement = html => {
  const container = document.createElement('body');
  container.innerHTML = html
  return container.querySelector('*');
};

/** @type {(unsafe: String) => String} */
const sanitizeHTML = unsafe => {
  const container = document.createElement('p');
  container.textContent = unsafe;
  return container.innerHTML;
};

/** @type {(template: String[], args: (String | HTMLElement)[]) => HTMLElement} */
const html = (template, ...args) => {
  /** @type {String[]} */
  const res = [];
  template.forEach((string, i) => {
    res.push(string);
    if (i == template.length) return;
    if (args[i] instanceof Array) {
      args[i].forEach(arg => res.push(arg.outerHTML ?? arg));
    }
    else {
      res.push(sanitizeHTML(args[i]));
    }
  });
  return htmlToElement(res.join(''));
};

/** @type {(article: Article) => HTMLElement} */
const renderRecommendation = article => html`
  <a class="article-recommendation" href="${article.href}">
    <div>${article.name}</div>
  </a>
`;

/** @type {(articles: Article[]) => HTMLElement} */
const renderRecommendations = articles => html`
  <div class="recommendation-container">
    ${articles.map(renderRecommendation)}
  </div>
`;

/** @type {(searchDiv: HTMLElement, articles: Article[]) => void} */
const updateRecommendations = (searchDiv, articles) => {
  const prevContainer = searchDiv.querySelector('.recommendation-container');
  if (prevContainer) searchDiv.removeChild(prevContainer);
  if (articles.length) searchDiv.appendChild(renderRecommendations(articles));
};

/** @type {(searchContainer: HTMLElement) => void} */
const attachSearcherToElement = searchContainer => {
  const input = searchContainer.querySelector('input');
  input.addEventListener('input', async () => {
     updateRecommendations(searchContainer, await matchRecommends(input.value));
  });
};

/** @type {(element: HTMLElement) => void} */
const clearValue = element => element.value = '';

/** @type {() => void} */
const loadTranslationButton = () => {
  document.querySelector('#google_translate_element').innerHTML = '';

  // Manually create script element since html template won't work for <script />
  const script = document.createElement('script');
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.head.append(script);
};

window.googleTranslateElementInit = () => {
  new google.translate.TranslateElement({
    pageLanguage: 'auto'
  }, 'google_translate_element');

  // The google translate banner styles the body with top: 40px which is annoying
  // when the translate banner is set to display: none
  const interval = setInterval(() => {
    if (document.body.style.top == '40px') {
      document.body.style.top = 0;
      clearInterval(interval);
    }
  });
};

/**
 * @template {T}
 * @type {(num: Number) => (arr: T[]) => T[]}
 */
const repeat = num => arr => {
  /** @type {T[]} */
  const res = [];
  for (let i = 0; i < num; ++i) {
    res.push(...arr);
  }
  return res;
};

document.querySelectorAll('.article-search').forEach(attachSearcherToElement);
document.querySelectorAll('input').forEach(clearValue);
