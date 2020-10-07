module.exports = {
  parsePrice(price) {
    try {
      const regex = /[\d,.]+/g;
      const parsedString = regex.exec(price)[0].replace(",", ".");
      const splittedDot = parsedString.split(".");
      const cents = "." + splittedDot.pop();

      const parsedStringPrice = splittedDot.join("") + cents;

      const floatNumber = parseFloat(parsedStringPrice);

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
      const Time = `${
        date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
      }/${
        date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
      }/${date.getFullYear()} - ${date.toTimeString().split(" ")[0]}`;

      return Time;
    } catch (err) {
      console.log("parseTime", err);
      return date;
    }
  },

  parseDate(date) {
    try {
      const Date = `${date.getFullYear()}-${
        date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
      }-${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()}`;

      return Date;
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
