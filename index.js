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

/** @type {(template: String[], args: String[]) => HTMLElement} */
const html = (template, ...args) => {
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

/** @type {(input: HTMLElement) => void} */
const attachSearcherToElement = input => {
  input.addEventListener('input', async () => {
     console.log(await matchRecommends(input.value));
  });
};

const repeat = num => arr => {
  const res = [];
  for (let i = 0; i < num; ++i) {
    res.push(...arr);
  }
  return res;
};

document.querySelectorAll('.article-search input').forEach(attachSearcherToElement);
const test = document.querySelector('#test');
matchRecommends('samp').then(repeat(10)).then(renderRecommendations).then(test.appendChild.bind(test));
