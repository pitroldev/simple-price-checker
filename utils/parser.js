module.exports = {
  parsePrice(price) {
    try {
      const regex = /[\d,]+/g;
      const parsedString = regex.exec(price)[0].replace(",", ".");

      const floatNumber = parseFloat(parsedString);

      return floatNumber;
    } catch (err) {
      console.log("parsePrice", err);
    }
  },

  parseURL(uri) {
    try {
      const regex = /(http[s]?:\/\/)?([^\/\s]+\/)(.*)/g;

      const url = regex.exec(uri)[2].replace("/", "");

      return url;
    } catch (err) {
      console.log("parseURL", err);
    }
  },

  parseTime(date) {
    try {
      const Time = `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

      return Time;
    } catch (err) {
      console.log("parseTime", err);
      return date;
    }
  },
};