const axios = require("axios");
const cheerio = require("cheerio");
const parser = require("../utils/parser");

function errorDump(html) {
  const fs = require("fs");
  fs.appendFile("err.html", html, () => {});
}

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

      const indisponivel =
        $(".disponibilidade img").attr("alt") === "produto_indisponivel";
      if (indisponivel) {
        return { ...itemObject, indisponivel };
      }

      const contador = !!$(".contTEXTO").text();

      const promoString = contador
        ? ".preco_desconto_avista-cm"
        : "span.preco_desconto span strong";

      const normalString = contador ? ".preco_desconto-cm" : "div.preco_normal";

      itemObject.promoPrice = parser.parsePrice($(promoString).text());
      itemObject.normalPrice = parser.parsePrice($(normalString).text());

      return itemObject;
    } catch (err) {
      return {
        ...item,
        loja: "Kabum",
        error: true,
        checkedtime: new Date(),
        err,
      };
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

      const indisponivel =
        $("#availability span").text().trim() === "Não disponível.";
      if (indisponivel) {
        return { ...itemObject, indisponivel };
      }

      itemObject.promoPrice = parser.parsePrice(
        $("div.content-grid-block b").text()
      );
      itemObject.normalPrice = parser.parsePrice(
        $("#priceblock_ourprice").text()
      );

      return itemObject;
    } catch (err) {
      return {
        ...item,
        loja: "Amazon",
        error: true,
        checkedtime: new Date(),
        err,
      };
    }
  },

  async searchPichau(item, uri) {
    try {
      const { name, targetPrice } = item;

      const response = await axios.get(uri);
      const $ = cheerio.load(response.data);

      const itemObject = {
        loja: "Pichau",
        name,
        uri,
        checkedTime: new Date(),
        targetPrice: targetPrice,
      };

      const indisponivel = !!$(".stock.unavailable").text();
      if (indisponivel) {
        return { ...itemObject, indisponivel };
      }

      itemObject.promoPrice = parser.parsePrice($(".price-boleto span").text());
      itemObject.normalPrice = parser.parsePrice($(".price").text());

      return itemObject;
    } catch (err) {
      return {
        ...item,
        loja: "Pichau",
        error: true,
        checkedtime: new Date(),
        err,
      };
    }
  },

  async searchFastShop(item, uri) {
    try {
      const { name, targetPrice } = item;

      const partNumber = parser.parseFastShopPartNumber(uri);
      const response = await axios.get(
        `https://www.fastshop.com.br/wcs/resources/v2/products/byPartNumber/${partNumber}`
      );
      const $ = cheerio.load(response.data);

      const itemObject = {
        loja: "Fast Shop",
        name,
        uri,
        checkedTime: new Date(),
        targetPrice: targetPrice,
      };

      const indisponivel = !response.data.buyable;
      if (indisponivel) {
        return { ...itemObject, indisponivel };
      }

      itemObject.promoPrice = parseFloat(response.data.priceOffer);

      return itemObject;
    } catch (err) {
      return {
        ...item,
        loja: "Fast Shop",
        error: true,
        checkedtime: new Date(),
        err,
      };
    }
  },

  async searchKalunga(item, uri) {
    try {
      const { name, targetPrice } = item;

      const response = await axios.get(uri);
      const $ = cheerio.load(response.data);

      const itemObject = {
        loja: "Kalunga",
        name,
        uri,
        checkedTime: new Date(),
        targetPrice: targetPrice,
      };

      const indisponivel = !!$("#imgProdutoIndisponivel").text();
      if (indisponivel) {
        return { ...itemObject, indisponivel };
      }

      itemObject.promoPrice = parser.parsePrice($(".h3 span").text());
      itemObject.normalPrice = parser.parsePrice($("#total_prazo").text());

      return itemObject;
    } catch (err) {
      return {
        ...item,
        loja: "Kalunga",
        error: true,
        checkedtime: new Date(),
        err,
      };
    }
  },

  async searchTerabyte(item, uri) {
    try {
      const { name, targetPrice } = item;

      const response = await axios.get(uri);
      const $ = cheerio.load(response.data);

      const itemObject = {
        loja: "Terabyte",
        name,
        uri,
        checkedTime: new Date(),
        targetPrice: targetPrice,
      };

      const indisponivel = !!$("#indisponivel").text();
      if (indisponivel) {
        return { ...itemObject, indisponivel };
      }

      itemObject.promoPrice = parser.parsePrice($("#valVista").text());
      itemObject.normalPrice = parser.parsePrice($("#valParc").text());

      return itemObject;
    } catch (err) {
      return {
        ...item,
        loja: "Terabyte",
        error: true,
        checkedtime: new Date(),
        err,
      };
    }
  },

  async searchRenner(item, uri) {
    try {
      const { name, targetPrice } = item;

      const regex = /\d+/g;

      const [productId, skuId] = uri.match(regex);

      const APIuri = `https://www.lojasrenner.com.br/rest/model/lrsa/api/CatalogActor/refreshProductPage?skuId=${skuId}&productId=${productId}`;

      const response = await axios.get(APIuri);

      const itemObject = {
        loja: "Renner",
        name,
        uri,
        checkedTime: new Date(),
        targetPrice: targetPrice,
      };

      const indisponivel = !response.data.purchasable;
      if (indisponivel) {
        return { ...itemObject, indisponivel };
      }

      itemObject.promoPrice = response.data.salePrice;
      itemObject.normalPrice = response.data.listPrice;

      return itemObject;
    } catch (err) {
      return {
        ...item,
        loja: "Renner",
        error: true,
        checkedtime: new Date(),
        err,
      };
    }
  },
  async searchRiachuelo(item, uri) {
    try {
      const { name, targetPrice } = item;

      const regex = /\d+/g;

      const [skuId] = uri.match(regex);

      const APIuri = `https://www.riachuelo.com.br/elasticsearch/data/products?sku=${skuId}`;

      const response = await axios.get(APIuri);

      const itemObject = {
        loja: "Riachuelo",
        name,
        uri,
        checkedTime: new Date(),
        targetPrice: targetPrice,
      };

      const indisponivel =
        response.data[0].ch_max_price_0_1 === 0 ||
        response.data[0].ch_max_price_0_1 === undefined;
      if (indisponivel) {
        return { ...itemObject, indisponivel };
      }

      itemObject.promoPrice = response.data[0].ch_min_price_0_1;
      itemObject.normalPrice = response.data[0].min_price_0_1;

      console.log("RIACHUELO", itemObject);
      return itemObject;
    } catch (err) {
      return {
        ...item,
        loja: "Riachuelo",
        error: true,
        checkedtime: new Date(),
        err,
      };
    }
  },

  async searchFlexform(item, uri) {
    try {
      const { name, targetPrice } = item;

      const response = await axios.get(uri);
      const $ = cheerio.load(response.data);

      const itemObject = {
        loja: "Flexform",
        name,
        uri,
        checkedTime: new Date(),
        targetPrice: targetPrice,
      };

      const indisponivel = !$("#buy-button").text();
      if (indisponivel) {
        return { ...itemObject, indisponivel };
      }

      itemObject.promoPrice = parser.parsePrice($(".preco-boleto span").text());
      itemObject.normalPrice = parser.parsePrice($(".produto-preco").text());

      return itemObject;
    } catch (err) {
      return {
        ...item,
        loja: "Flexform",
        error: true,
        checkedtime: new Date(),
        err,
      };
    }
  },
};
