import * as _ from "lodash";

// Does a simple deep merge using lodash
export function merge(object, source) {
  return _.merge(object, source, (a, b) => {
    return _.isArray(a) ? a.concat(b) : undefined;
  });
}