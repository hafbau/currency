module.exports = function (date) {
  /* Date Validator using regex
  ** returns boolean
  ** @params date string
  ** uses regex to avoid the unpredictability
  ** around Date.parse() or new Date() interpretation
  */
  const regex = /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;
  const validDateMatch = date.match(regex);
  const year = Number(date.slice(0,4))
  const today = new Date();

  return (year <= today.getFullYear()) && (validDateMatch);
}