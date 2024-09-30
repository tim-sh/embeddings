function removeCodeDelimiters(text) {
  return text
      .replace(/^[ \t]*```\S*\n(.*?)(?:\n[ \t]*)?```/gms, '$1')
      .replace(/[ \t]*```\S*(\n.*?)(?:\n[ \t]*)?```/gms, '$1')
      .replace(/([ \t]*)```(.*?)(?:\n[ \t]*)?```/gms, '$1$2')
      .replace(/`(.*?)`/g, '$1')
}

module.exports = {
  removeCodeDelimiters
}
