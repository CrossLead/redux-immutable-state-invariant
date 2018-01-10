'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = trackForMutations;
function trackForMutations(isImmutable, ignore, obj) {
  var trackedProperties = trackProperties(isImmutable, ignore, obj);
  return {
    detectMutations: function detectMutations() {
      return _detectMutations(isImmutable, ignore, trackedProperties, obj);
    }
  };
}

function trackProperties(isImmutable) {
  var ignore = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var obj = arguments[2];
  var path = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

  var tracked = { value: obj };

  if (!isImmutable(obj)) {
    tracked.children = {};

    for (var key in obj) {
      var childPath = path.concat(key);
      if (ignore.length && ignore.indexOf(childPath.join('.')) !== -1) {
        continue;
      }

      tracked.children[key] = trackProperties(isImmutable, ignore, obj[key], childPath);
    }
  }
  return tracked;
}

var hasOwnProp = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);

function _detectMutations(isImmutable) {
  var ignore = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var trackedProperty = arguments[2];
  var obj = arguments[3];
  var sameParentRef = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var path = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];

  var prevObj = trackedProperty ? trackedProperty.value : undefined;
  var sameRef = prevObj === obj;

  if (sameParentRef && !sameRef && !Number.isNaN(obj)) {
    return { wasMutated: true, path: path };
  }

  if (isImmutable(prevObj) || isImmutable(obj)) {
    return { wasMutated: false };
  }

  var trackedChildren = trackedProperty.children;

  // Gather all keys from prev (tracked) and after objs
  var keysToDetect = {};
  for (var key in trackedChildren) {
    if (hasOwnProp(trackedChildren, key)) keysToDetect[key] = true;
  }
  for (var _key in obj) {
    if (hasOwnProp(obj, _key)) keysToDetect[_key] = true;
  }

  for (var _key2 in keysToDetect) {
    var childPath = path.concat(_key2);
    if (ignore.length && ignore.indexOf(childPath.join('.')) !== -1) {
      continue;
    }

    var result = _detectMutations(isImmutable, ignore, trackedChildren[_key2], obj[_key2], sameRef, childPath);

    if (result.wasMutated) {
      return result;
    }
  }
  return { wasMutated: false };
}