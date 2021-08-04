'use strict';

import { articleNameToArticle, toJson, clearValue, genQuerier, html } from '../common.js';

/**
  * @typedef {[String, Number[]]} Recommendation
  * 
  * The string is the topic of the recommendation
  * The array of numbers is an array of article numbers to be looked up
  */

const getIndex = (() => {
  let index = null;
  let titlesLookup = null;

  const indexPromise = fetch('/wiki/index.json')
    .then(toJson)
    .then(Object.entries);
  const titlesPromise = fetch('/wiki/articles.json')
    .then(toJson)
    .then(titles => titles.slice(1)); // starts with readme

  return async () => {
    if (index == null) {
      const [topicIndex, titles] = await Promise.all([indexPromise, titlesPromise]);
      const indexMap = new Map(topicIndex);

      titlesLookup = titles;
      const reverseTitlesLookup = new Map(Object.entries(titles)
        .map(([idx, title]) => [parseInt(idx), title])
        .map(([idx, title]) => [title, idx])
      );

      // Add titles to the search index
      for (const title of titles) {
        const articles = indexMap.get(title) ?? [];
        const titleNum = reverseTitlesLookup.get(title);
        if (articles.includes(titleNum)) return;
        articles.push(titleNum);
        indexMap.set(title, articles);
      };

      index = [...indexMap];
    }
    return { index, titlesLookup };
  };
})();

const lookupTitleSync = (() => {
  let titlesLookup = null;
  getIndex().then(dex => titlesLookup = dex.titlesLookup);
  return titleNum => {
    if (titlesLookup == null) return '';
    return titlesLookup[titleNum];
  }
})();

const getTopics = () => getIndex().then(({ index }) => index);
const searchIndex = genQuerier(getTopics, n => n[0]);

const input = document.querySelector('input');
const searchResults = document.querySelector('.search-results');

const updateRecommendations = (recommendations) => {
  const prevContainer = searchResults.querySelector('.results-container');
  if (prevContainer) searchResults.removeChild(prevContainer);
  if (recommendations.length) searchResults.appendChild(renderRecommendations(recommendations));
};

input.addEventListener('input', () => searchIndex(input.value)
  .then(updateRecommendations));


/** @type (article: Article) => HTMLElement */
const renderArticle = article => html`
  <li>
    <a href="${article.href}">
      ${article.name}
    </a>
  </li>
`;

/** @type (rec: Recommendation) => HTMLElement */
const renderRecommendation = rec => html`
  <section class="one-recommendation">
    <h2>${rec[0]}</h2>
    <div class="articles">
      <ul>
        ${rec[1].map(lookupTitleSync).map(articleNameToArticle).map(renderArticle)}
      </ul>
    </div>
  </section>
`;

/** @type (recs: Recommendation[]) => HTMLElement */
const renderRecommendations = recs => html`
  <div class="results-container">
    ${recs.map(renderRecommendation)}
  </div>
`;

window.getIndex = getIndex;
window.searchIndex = searchIndex;
document.querySelectorAll('input').forEach(clearValue);
