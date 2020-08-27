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
      case "www.fastshop.com.br": {
        const itemObject = await search.searchFast(item, uri);
        return log(itemObject);
      }
      default:
        console.error("URL DESCONHECIDA", url);
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
      loja,
    } = item;

    if (promoPrice < targetPrice || normalPrice < targetPrice) {
      return notify(item);
    }

    const promoString = promoPrice ? `R$${promoPrice}` : "Não Encontrado";
    const normalString = normalPrice ? ` R$${normalPrice}` : "Não Encontrado";

    const logString = `[${parser.parseTime(
      checkedTime
    )}]: ${name}\nLoja: ${loja}\nPreço Normal: ${normalString}\nPreço Promocional: ${promoString}\nPreço Ideal R$${targetPrice}\n`;

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
  const {
    promoPrice,
    normalPrice,
    targetPrice,
    checkedTime,
    name,
    loja,
    uri,
  } = item;

  turnLightsGreen();
  openBrowser(uri);

  const promoString = promoPrice ? `R$${promoPrice}` : "Não Encontrado";
  const normalString = normalPrice ? ` R$${normalPrice}` : "Não Encontrado";

  const logString = `[${parser.parseTime(
    checkedTime
  )}]: ${name}\nLoja: ${loja}\nPreço Normal: ${normalString}\nPreço Promocional: ${promoString}\n`;

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
  console.log("\nSIMPLE PRICE CHECKER STARTED\n");
  const { intervalMinutes, items } = config;

  const intervalTime = intervalMinutes * 1000 * 60;

  items.map((item) => {
    checkURL(item);
    setInterval(() => {
      checkURL(item);
    }, intervalTime);
  });
}

main();
// checkURL(config.items[0]);
// turnLightsGreen();