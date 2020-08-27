module.exports = {
  parsePrice(price) {
    try {
      const regex = /[\d,]+/g;
      const parsedString = regex.exec(price)[0].replace(",", ".");

      const floatNumber = parseFloat(parsedString);

      return floatNumber;
    } catch (err) {
      return -1;
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
      }/${date.getFullYear()} - ${date.toTimeString().split(" ")[0]}`;

      return Time;
    } catch (err) {
      console.log("parseTime", err);
      return date;
    }
  },

  parseFastShopPartNumber(uri) {
    try {
      const regex = /([A-Z])\w+/g;

      return regex.exec(uri)[0];
    } catch (err) {
      console.log("parseFastShopPartNumber", err);
    }
  },
};
