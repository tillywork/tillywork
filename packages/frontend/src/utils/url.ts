const urlUtils = {
  getCurrentHostUrl() {
    const { protocol, host } = window.location;
    return `${protocol}//${host}`;
  },
};

export default urlUtils;
