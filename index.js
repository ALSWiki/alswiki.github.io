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

/** @type {(input: HTMLElement) => void} */
const attachSearcherToElement = input => {
  input.addEventListener('input', async () => {
     console.log(await matchRecommends(input.value));
  });
};

document.querySelectorAll('.article-search input').forEach(attachSearcherToElement);
