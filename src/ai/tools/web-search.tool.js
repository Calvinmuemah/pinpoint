const search = async (query) => {
  // Modular Web Search Tool Interface (Ready for MCP / external search integration)
  return [
    { title: `Travel discussions for ${query}`, snippet: `Search results for ${query}` },
  ];
};

module.exports = {
  search,
};
