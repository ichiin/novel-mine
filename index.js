const puppeteer = require('puppeteer');

const getChapterContent = async (page) => {
    let chapterContent = await page.waitForSelector(".chapter-content")
    let chapterText = await page.evaluate(chapter => chapter.textContent, chapterContent)
    return chapterText;
}

const hasNextChapter = async (page) => {
    let hasNext = await page.waitForSelector('#next_chap:not(.disabled', { timeout: 5000 })
    .then(() => { return true; })
    .catch(() => { return false ;})
    return hasNext;
}

const navigateToNextPage = async (page) => {
    await Promise.all([
        page.waitForNavigation(),
        page.click('#next_chap'),
      ]);
}

const scrape = async() => {
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();
    await page.goto('https://mnovelfree.com/unrivaled-medicine-god-060122/chapter-1')
   //let chapterText = await getChapterContent(page);
   let hasNext = await hasNextChapter(page);
   while(hasNext){
       console.log('-- Onward to next chapter --')
       await navigateToNextPage(page);
       hasNext = await hasNextChapter(page);
   }
   console.log('All chapter parsed ;D')
   await browser.close();
}

scrape();
