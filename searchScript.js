const fs = require("fs");
const puppeteer = require("puppeteer");

const scrapeInfiniteScrollItems = async (page, itemTargetCount, word) => {
  let items = [];
  while (itemTargetCount > items.length) {
    items = await page.evaluate(async (word) => { 
        const items = [];
        Array.from(document.querySelectorAll("#boxes > div")).forEach(elem => {
            if (elem.textContent.includes(word)) {
               items.push(elem);
            }
        });
        return items.map((item) => item.innerText);
    }, word);

    let previousHeight = await page.evaluate("document.body.scrollHeight");
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
    await page.waitForFunction(
      `document.body.scrollHeight > ${previousHeight}`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return items;
};

const searchWords = async (url, word) => {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true
  });

  const page = await browser.newPage();
  await page.goto(url);//("https://intoli.com/blog/scrape-infinite-scroll/demo.html");

  const items = await scrapeInfiniteScrollItems(page, 100, word);

  fs.writeFileSync("items.json", JSON.stringify(items));
}

const url = process.argv[2];
const word = process.argv[3];
url && word && searchWords(url, word);