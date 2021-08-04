/** @typedef {{name: String, href: String}} Article */

/** @type {{json: () => Object}} */
export const toJson = r => r.json();
export const emptyArr = () => [];

/** @type {(name: String) => Article} */
export const articleNameToArticle = name => ({
  name: name.toLowerCase(),
  href: `/wiki/en/${name.replaceAll(" ", "_")}.html`
});

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
export const html = (template, ...args) => {
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

/** @type {(element: HTMLElement) => void} */
export const clearValue = element => element.value = '';

/**
 * @template {T}
 * @param {() => Promise<T>} getContents
 * @param {(content: T) => String} getName
 * @return {(query: String) => Promise<T[]>}
 */
export const genQuerier = (getContents, getName) => {
  /** @type {T[]} */
  let contents = [];
  /** @type {String | null} */
  let previousQuery = null;

  return async query => {
    if (query === '') return [];
    query = query.toLowerCase().trim();
    if (!query.startsWith(previousQuery)) {
      contents = await getContents();
    }
    previousQuery = query;
    return contents =
      contents.filter(art => getName(art.toLowerCase()).includes(query));
  };
};
