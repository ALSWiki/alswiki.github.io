'use strict';

/** @typedef {{name: String, href: String}} Article */

const toJson = r => r.json();
const emptyArr = () => [];

/** @type {() => String[]} */
const getArticles = (() => {
  /** @type {String[]} */
  let articles = [];

  return async () => {
    if (articles.length) return articles;
    return articles = await fetch('./wiki/articles.json')
      .then(toJson)
      .catch(emptyArr);
  };
})();

/** @type {(name: String) => Article} */
const articleNameToArticle = name => ({
  name: name.toLowerCase(),
  href: `./en/${name.replaceAll(" ", "_")}.html`
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

/** @type {(template: String[], args: String[]) => HTMLElement} */
const html = (template, ...args) => {
  const res = [];
  template.forEach((string, i) => {
    res.push(string);
    if (i == template.length) return;
    res.push(sanitizeHTML(args[i]));
  });
  return htmlToElement(res.join(''));
};

/** @type {(input: HTMLElement) => void} */
const attachSearcherToElement = input => {
  input.addEventListener('input', async () => {
     console.log(await matchRecommends(input.value));
  });
};

document.querySelectorAll('.article-search input').forEach(attachSearcherToElement);
