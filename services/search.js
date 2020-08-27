const axios = require("axios");
const cheerio = require("cheerio");
const parser = require("../utils/parser");

module.exports = {
  async searchKabum(item, uri) {
    try {
      const { name, targetPrice } = item;

      const response = await axios.get(uri);
      const $ = cheerio.load(response.data);

      const itemObject = {
        loja: "Kabum",
        name,
        uri,
        checkedTime: new Date(),
        targetPrice: targetPrice,
      };

      $("span.preco_desconto span strong").text(
        (i, item) => (itemObject.promoPrice = parser.parsePrice(item))
      );
      $("div.preco_normal").text(
        (i, item) => (itemObject.normalPrice = parser.parsePrice(item))
      );

      return itemObject;
    } catch (err) {
      console.log("searchKabum", err);
    }
  },

  async searchAmazon(item, uri) {
    try {
      const { name, targetPrice } = item;

      const response = await axios.get(uri);
      const $ = cheerio.load(response.data);

      const itemObject = {
        loja: "Amazon",
        name,
        uri,
        checkedTime: new Date(),
        targetPrice: targetPrice,
      };

      $("#priceblock_ourprice").text(
        (i, item) => (itemObject.normalPrice = parser.parsePrice(item))
      );
      $("div.content-grid-block b").text(
        (i, item) => (itemObject.promoPrice = parser.parsePrice(item))
      );

      return itemObject;
    } catch (err) {
      console.log("searchAmazon", err);
    }
  },

  async searchFast(item, uri) {
    try {
      const { name, targetPrice } = item;

      const response = await axios.get(uri);
      const $ = cheerio.load(response.data);

      const itemObject = {
        loja: "Fast Shop",
        name,
        uri,
        checkedTime: new Date(),
        targetPrice: targetPrice,
      };

      $("span").text((i, item) => {
        console.log("promo", i, item);
        return (itemObject.promoPrice = parser.parsePrice(item));
      });

      // $("p.interest-price")
      //   .last()
      //   .text((i, item) => {
      //     console.log("normal", i, item);
      //     return (itemObject.normalPrice = parser.parsePrice(item));
      //   });

      return itemObject;
    } catch (err) {
      console.log("searchFast", err);
    }
  },
};
