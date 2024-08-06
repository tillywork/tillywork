const stringUtils = {
  /**
   * Takes a string, and returns the first letter of the first two strings.
   * e.g: Tilly Work -> TW
   * @param string The string to extract the initials from.
   * @returns The first letter of the first 2 words in the string.
   */
  getInitials(string: string) {
    const stringToArray = string.split(' ');
    return `${stringToArray[0].charAt(0).toLocaleUpperCase()}${
      stringToArray[1] ? stringToArray[1].charAt(0).toLocaleUpperCase() : ''
    }`;
  },

  /**
   * Fuzzy searches for a query in a string with respect to the characters' order. The
   * query `"ndo"` will be found in string `"John Doe"`, thus the function will return
   * `true`, while the query `akc` won't be found in the string `"Jack Pearson"` because
   * the order of characters `'c'` and `'k'` isn't the same, thus the function will
   * return `false`
   *
   * @param query The query to search for.
   * @param string The string to search for the query in.
   * @returns `true` if the query was inside the string, otherwise `false`
   *
   * @remarks
   * This function performs a case-insensitive search.
   * An empty query will always return `true` as it is trivially found in any string.
   * A non-empty query will always return `false` when the string is empty.
   */
  fuzzySearch(query: string, string: string) {
    if (!query) return true;
    if (!string) return false;

    // NOTE: Both strings are lowered for the case-insensitive search.
    query = query.toLocaleLowerCase();
    string = string.toLocaleLowerCase();

    let i = 0;
    for (const c of string) {
      if (c === query[i]) i++;
      // ~ All characters of the query has been matched.
      if (i === query.length) return true;
    }

    return false;
  },

  /**
   * Takes a snake-case string and transforms it to a title-case one.
   * E.g. 'card-types' -> 'Card Types', 'custom-fields' -> 'Custom Fields'
   *
   * @param string The snake-case string to transform.
   * @returns `string` transformed to title-case.
   */
  snakeToTitleCase(string: string) {
    return string
      .split('-')
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(' ');
  },

  slugify(string: string) {
    const slug = string
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/-+/g, '-');

    return slug.charAt(slug.length - 1) === '-'
      ? slug.slice(0, slug.length - 1)
      : slug;
  },
};

export default stringUtils;
