/**
 * sort by multiple props
 * @param {array} props - array of props in order of which by which you want to sort
 * @returns {arra} - the sorted array
 */
export function sortByProps (props) {
  return function (a, b) {
    for (let i in props) {
      let prop = props[i]

      if (a[prop] < b[prop]) {
        return -1
      } else if (a[prop] > b[prop]) {
        return 1
      }
    }
  }
}
