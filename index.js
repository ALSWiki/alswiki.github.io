'use strict';

import { toJson, emptyArr, articleNameToArticle, html, clearValue, genQuerier } from './common.js';

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

const matchQuerier = genQuerier(getArticles, n => n);

const matchRecommends = query => matchQuerier(query)
  .then(res => res.map(articleNameToArticle));

/** @type {(query: String) => String} */
const search = query => `/search?q=${encodeURIComponent(query)}`;

/** @type {(article: Article) => HTMLElement} */
const renderRecommendation = article => html`
  <a class="article-recommendation" href="${article.href}">
    <div>${article.name}</div>
  </a>
`;

/** @type {(articles: Article[], query: String) => HTMLElement} */
const renderRecommendations = (articles, query) => html`
  <div class="recommendation-container">
    ${articles.slice(0, 9).map(renderRecommendation)}
    <a class="article-recommendation" href="${search(query)}">
      <div>Search entire wiki</div>
    </a>
  </div>
`;

/** @type {(searchDiv: HTMLElement, articles: Article[], query: String) => void} */
const updateRecommendations = (searchDiv, articles, query) => {
  const prevContainer = searchDiv.querySelector('.recommendation-container');
  if (prevContainer) searchDiv.removeChild(prevContainer);
  if (query) searchDiv.appendChild(renderRecommendations(articles, query));
};

/** @type {(searchContainer: HTMLElement) => void} */
const attachSearcherToElement = searchContainer => {
  const input = searchContainer.querySelector('input');
  input.addEventListener('input', async () => {
     updateRecommendations(searchContainer, await matchRecommends(input.value), input.value);
  });
};

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
