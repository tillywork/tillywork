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
};

export default stringUtils;
