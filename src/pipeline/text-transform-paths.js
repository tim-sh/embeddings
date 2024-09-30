function textTransformPaths(text) {
  const pathPrefix = /(?<=^|[ ('])(?:\/\/[^/]+\/([c-z]\$)?|(?<=[ ('$])\/(home|Users)\/[^/]+\/|[C-Z]:\\Users\\[^\\]+\\|[^ (']+[/\\](?=node_modules))/g

  return text.replace(pathPrefix, '')
}

module.exports = {
  textTransformPaths
}
