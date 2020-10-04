const fs = require("fs");
const openBrowser = require("opn");
const Yeelight = require("yeelight2");

const config = require("./config.json");
const search = require("./services/search");
const parser = require("./utils/parser");

const TempPricesArray = [];

function checkURL(item) {
  const { uri_array } = item;

  uri_array.map(async (uri) => {
    const url = parser.parseURL(uri);
    switch (url) {
      case "www.kabum.com.br": {
        const itemObject = await search.searchKabum(item, uri);
        return handleLog(itemObject);
      }
      case "www.amazon.com.br": {
        const itemObject = await search.searchAmazon(item, uri);
        return handleLog(itemObject);
      }
      case "www.pichau.com.br": {
        const itemObject = await search.searchPichau(item, uri);
        return handleLog(itemObject);
      }
      case "www.fastshop.com.br": {
        const itemObject = await search.searchFastShop(item, uri);
        return handleLog(itemObject);
      }
      case "www.kalunga.com.br": {
        const itemObject = await search.searchKalunga(item, uri);
        return handleLog(itemObject);
      }
      case "www.terabyteshop.com.br": {
        const itemObject = await search.searchTerabyte(item, uri);
        return handleLog(itemObject);
      }
      case "www.lojasrenner.com.br": {
        const itemObject = await search.searchRenner(item, uri);
        return handleLog(itemObject);
      }
      case "www.riachuelo.com.br": {
        const itemObject = await search.searchRiachuelo(item, uri);
        return handleLog(itemObject);
      }
      default:
        console.error("[UNSUPPORTED_URL]:", url);
    }
  });
}

function handleLog(item) {
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

    // Check for error
    if (error || promoPrice < 0 || normalPrice < 0) {
      const errorString = `[SEARCH_ERROR]: ${name}\nLoja: ${loja}\nErro ao procurar Produto`;

      fs.appendFile(
        `logs/${parser.parseDate(new Date())}.log`,
        "\n" + errorString + "\n",
        (err) => err && console.log("logs.log", err)
      );

      return console.log(`\n\x1b[1m\x1b[41m${errorString}\x1b[0m\n`);
    }

    // Check targeted price
    if (promoPrice < targetPrice || normalPrice < targetPrice) {
      return handleNotify(item);
    }

    // LogString
    let priceChange = "";
    const promoString = promoPrice
      ? `\nPreço Promocional: R$${promoPrice}`
      : "";
    const normalString = normalPrice ? `\nPreço Normal: R$${normalPrice}` : "";

    const disponivelString = indisponivel
      ? "\nProduto Indisponível"
      : `\nPreço Ideal: R$${targetPrice}`;

    const disponivelStyle = indisponivel ? "\x1b[41m\x1b[37m" : "";

    const logString = `\n[${parser.parseTime(
      checkedTime
    )}]: ${name} ${priceChange}\nLoja: ${loja}${disponivelString}${normalString}${promoString}\n`;

    // Temporaly store, check and log price changes
    let counter = 0;
    config.items.map((product) => {
      counter += product.uri_array.length;
    });

    if (TempPricesArray.length < counter) {
      TempPricesArray.push(item);
    } else {
      const oldItem = TempPricesArray.find(
        (storedItem) => storedItem.name === name && storedItem.loja === loja
      );
      const oldItemIndex = TempPricesArray.findIndex(
        (storedItem) => storedItem.name === name && storedItem.loja === loja
      );

      if (
        oldItem.promoPrice > promoPrice ||
        oldItem.normalPrice > normalPrice
      ) {
        TempPricesArray[oldItemIndex] = item;
        priceChange = "- Caiu";
        fs.appendFile(
          `logs/Price_Changes - ${parser.parseDate(new Date())}.log`,
          logString +
            `\npromoPrice_old: ${oldItem.promoPrice}\nnormalPrice_old: ${oldItem.normalPrice}\n`,
          (err) => err && console.log("Price_Changes.log", err)
        );
      }
      if (
        oldItem.promoPrice < promoPrice ||
        oldItem.normalPrice < normalPrice
      ) {
        TempPricesArray[oldItemIndex] = item;
        priceChange = "- Subiu";
        fs.appendFile(
          `logs/Price_Changes - ${parser.parseDate(new Date())}.log`,
          logString +
            `\npromoPrice_old: ${oldItem.promoPrice}\nnormalPrice_old: ${oldItem.normalPrice}\n`,
          (err) => err && console.log("Price_Changes.log", err)
        );
      } else {
        priceChange = "- Permaneceu Igual";
      }
    }

    // Log checked prices
    const consoleString = `[${parser.parseTime(
      checkedTime
    )}]: ${name} ${priceChange}\x1b[1m\x1b[47m\x1b[30m\nLoja: ${loja}\x1b[43m${normalString}${promoString}${
      disponivelStyle + disponivelString
    }\x1b[0m\n`;

    fs.appendFile(
      `logs/${parser.parseDate(new Date())}.log`,
      logString,
      (err) => err && console.log("log.log", err)
    );

    return console.log(consoleString);
  } catch (err) {
    return console.log("logging error", item, err);
  }
}

function handleNotify(item) {
  try {
    const { promoPrice, normalPrice, checkedTime, name, loja, uri } = item;

    // Notification Methods
    turnLightsGreen();
    openBrowser(uri);

    // Log the price
    const promoString = promoPrice
      ? `\nPreço Promocional: R$${promoPrice}`
      : "";
    const normalString = normalPrice ? `\nPreço Normal: R$${normalPrice}` : "";

    const logString = `[${parser.parseTime(
      checkedTime
    )}]: ${name}\nLoja: ${loja}${normalString}${promoString}\nURI: ${uri}`;

    fs.appendFile(
      "GoodPrices.log",
      "\n" + logString,
      (err) => err && console.log("goodPrices.log", err)
    );

    return console.log("\x1b[1m\x1b[45m\x1b[37m%s\x1b[0m", logString);
  } catch (err) {
    console.log("handleNotify err", err);
  }
}

async function turnLightsGreen() {
  try {
    const { yeelightIP, yeelightPort } = config;
    const light = new Yeelight(yeelightIP, yeelightPort);
    await light.set_power("on");
    await light.set_rgb(65280, "smooth", 100);
    await light.set_bright(100, "smooth", 100);
    return light.exit();
  } catch (err) {
    console.log("turnLightsGreen", err, err.response);
  }
}

function intervalLoop() {
  try {
    const { items } = config;
    for (item of items) checkURL(item);
  } catch (err) {
    console.log("intervalLoop", err);
  }
}

function main() {
  const { intervalMinutes } = config;

  console.log(
    "\n\x1b[1m",
    "\x1b[47m",
    "\x1b[30m",
    `SIMPLE PRICE CHECKER STARTED - ${intervalMinutes}min Interval`,
    "\x1b[0m\n"
  );

  const intervalTime = intervalMinutes * 1000 * 60;

  if (process.env.NODE_ENV) {
    console.log("IN DEBUG MODE");
    return intervalLoop();
  }

  intervalLoop();
  return setInterval(intervalLoop, intervalTime);
}

main();
