const fs = require("fs");
const openBrowser = require("opn");
const Yeelight = require("yeelight2");

const config = require("./config.json");
const search = require("./services/search");
const parser = require("./utils/parser");

function checkURL(item) {
  const { uri_array } = item;

  uri_array.map(async (uri) => {
    const url = parser.parseURL(uri);
    switch (url) {
      case "www.kabum.com.br": {
        const itemObject = await search.searchKabum(item, uri);
        return log(itemObject);
      }
      case "www.amazon.com.br": {
        const itemObject = await search.searchAmazon(item, uri);
        return log(itemObject);
      }
      case "www.pichau.com.br": {
        const itemObject = await search.searchPichau(item, uri);
        return log(itemObject);
      }
      case "www.fastshop.com.br": {
        const itemObject = await search.searchFastShop(item, uri);
        return log(itemObject);
      }
      case "www.kalunga.com.br": {
        const itemObject = await search.searchKalunga(item, uri);
        return log(itemObject);
      }
      default:
        console.error("[UNSUPPORTED_URL]:", url);
    }
  });
}

function log(item) {
  try {
    const {
      promoPrice,
      normalPrice,
      targetPrice,
      checkedTime,
      name,
      indisponivel,
      loja,
      error,
    } = item;

    if (error || promoPrice < 0 || normalPrice < 0) {
      const errorString = `[SEARCH_ERROR]: ${name}\nLoja: ${loja}\nErro ao procurar Produto\n`;

      fs.appendFile(
        "log.txt",
        "\n" + errorString,
        (err) => err && console.log("log.txt", err)
      );

      return console.log(errorString);
    }

    if (promoPrice < targetPrice || normalPrice < targetPrice) {
      return notify(item);
    }

    const promoString = promoPrice
      ? `\nPreço Promocional: R$${promoPrice}`
      : "";
    const normalString = normalPrice ? `\nPreço Normal: R$${normalPrice}` : "";

    const disponivelString = indisponivel
      ? "\nProduto Indisponível"
      : `\nPreço Ideal R$${targetPrice}`;

    const logString = `[${parser.parseTime(
      checkedTime
    )}]: ${name}\nLoja: ${loja}${disponivelString}${normalString}${promoString}\n`;

    fs.appendFile(
      "log.txt",
      "\n" + logString,
      (err) => err && console.log("log.txt", err)
    );

    console.log(logString);
  } catch (err) {
    console.log("logging error", err);
  }
}

function notify(item) {
  const { promoPrice, normalPrice, checkedTime, name, loja, uri } = item;

  turnLightsGreen();
  openBrowser(uri);

  const promoString = promoPrice ? `R$${promoPrice}` : "Não Encontrado";
  const normalString = normalPrice ? ` R$${normalPrice}` : "Não Encontrado";

  const logString = `[${parser.parseTime(
    checkedTime
  )}]: ${name}\nLoja: ${loja}\nPreço Normal: ${normalString}\nPreço Promocional: ${promoString}\nURI: ${uri}`;

  fs.appendFile(
    "GoodPrices.txt",
    "\n" + logString,
    (err) => err && console.log("GoodPrices.txt", err)
  );

  return console.log("\x1b[1m\x1b[45m\x1b[37m%s\x1b[0m", logString);
}

async function turnLightsGreen() {
  try {
    const { yeelightIP, yeelightPort } = config;
    const light = new Yeelight(yeelightIP, yeelightPort);
    await light.set_rgb(65280, "smooth", 100);
    await light.set_bright(100, "smooth", 100);
    return light.exit();
  } catch (err) {
    console.log("turnLightsGreen", err, err.response);
  }
}

function main() {
  console.log(
    "\n\x1b[1m",
    "\x1b[47m",
    "\x1b[30m",
    "SIMPLE PRICE CHECKER STARTED",
    "\x1b[0m\n"
  );

  const { intervalMinutes, items } = config;

  const intervalTime = intervalMinutes * 1000 * 60;

  if (process.env.NODE_ENV) {
    console.log("IN DEBUG MODE");
    return items.map(checkURL);
  }

  items.map(checkURL);
  return setInterval(() => items.map(checkURL), intervalTime);
}

// main();

search.searchKabum(
  { name: "Debug Test", targetPrice: 9999 },
  config.items[0].uri_array[0]
);
