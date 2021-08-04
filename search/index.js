'use strict';

import { toJson, clearValue, genQuerier } from '../common.js';


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

const getTopics = () => getIndex().then(({ index }) => index);
const searchIndex = genQuerier(getTopics, n => n[0]);

window.getIndex = getIndex;
window.searchIndex = searchIndex;
document.querySelectorAll('input').forEach(clearValue);
