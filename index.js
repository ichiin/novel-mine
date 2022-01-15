const fs = require('fs');
const PDFDocument = require('pdfkit');
const puppeteer = require('puppeteer');

const createBook = async (url, name) => {
    const chapters = await scrapeNovel(url);
    writePDF(chapters, name);
}

const getChapterName = async(page) => {
    let chapterName = await page.waitForSelector(".chapter-text-detail");
    let chapterNameText = await page.evaluate(chapter => chapter.textContent, chapterName);
    return chapterNameText.concat('\n');
}

const getChapterContent = async (page) => {
    let chapterContent = await page.waitForSelector(".chapter-content");
    let chapterText = await page.evaluate(chapter => chapter.textContent, chapterContent);
    return chapterText;
};

const getNovelName = (url) => {
    const chapterDashName = url.split('/')[3];
    return chapterDashName;
}

const hasNextChapter = async (page) => {
    let hasNext = await page.waitForSelector('#next_chap:not(.disabled', { timeout: 5000 })
    .then(() => { return true; })
    .catch(() => { return false ;})
    return hasNext;
};

const navigateToNextPage = async (page) => {
    await Promise.all([
        page.waitForNavigation(),
        page.click('#next_chap'),
      ]);
};

const scrapeNovel = async(url) => {
    console.time('Scrape time');
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();
    let chapters = [];
    let chapterText = '';
    let chapterName = '';
    await page.goto(url)
    console.log('Downloading chapters...')
   let hasNext = await hasNextChapter(page);
   while(hasNext){
       chapterText = await getChapterContent(page);
       chapterName = await getChapterName(page);
       chapters.push(chapterName.concat(chapterText));
       console.log('-- Onward to next chapter --');
       await navigateToNextPage(page);
       hasNext = await hasNextChapter(page);
   }
   chapterText = await getChapterContent(page);
   chapters.push(chapterName.concat(chapterText));
   await browser.close();
   console.timeEnd('Scrape time');
   return chapters;
};

const writePDF = (chapters, name) => {
    let pdfDoc = new PDFDocument;
    const novelSpaceName = name.replace(/-/g, ' ');
    pdfDoc.pipe(fs.createWriteStream(name + '.pdf'));
    pdfDoc.text(novelSpaceName, { align: 'center', height: 200 })
    pdfDoc.text(chapters.join('\r\n'), {lineGap: 10});
    pdfDoc.end();
};

if(process.argv.length === 2 ){
    console.error('Pass the first chapter URL from https://mnovelfree.com/ you want to download');
    process.exit(1);
}else if(process.argv.length > 3 ){
    console.error('Pass only the URL of the first chapter as argument')
}else{
    const firstChapterURL = process.argv[2];
    const novelName = getNovelName(firstChapterURL);
    createBook(firstChapterURL, novelName);
}