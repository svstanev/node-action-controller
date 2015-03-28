function compareByPathDesc(c1, c2) {
  return -compareByPath(c1, c2);
}

function compareByPath(c1, c2) {
  var p1 = c1.route.path.split('/');
  var p2 = c2.route.path.split('/');

  var len1 = p1.length;
  var len2 = p2.length;

  var res = len1 - len2;
  if (res) {
    return res;
  }

  for (var i = 0; i < len1; i++) {
    if (res = comparePathParts(p1[i], p2[i])) {
      return res;
    }
  }

  return 0;
}

function comparePathParts(t1, t2) {
  var isParam1 = isParameter(t1);
  var isParam2 = isParameter(t2);

  if (isParam1 && isParam2) {
    // params are just placeholders so there is no need to compare them by name
    return 0;
  }

  if (!isParam1 && !isParam2) {
    return t1.localeCompare(t2);
  }

  return isParam1 ? 1 : -1;
}

function isParameter(s) {
  return s[0] === ':';
}

module.exports.compareByPathDesc = compareByPathDesc;
module.exports.compareByPath = compareByPath;
