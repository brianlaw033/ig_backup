const puppeteer = require('puppeteer');
const _ = require('lodash')
// const minimist = require('minimist')
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];
const fs = require("fs");

const login = require('./src/login')
const download = require('./src/download')
const getStoryList = require('./src/scrapeStories')
const getPostList = require('./src/scrapeImages')
const compress = require('./src/compress')

browser = null;
page = null;

// const args = minimist(process.argv.slice(2))
let dir;

let queue = {}
let storyQueue = {}

const init = async args => {
  try {
    dir = `./img/${args.target}`
    await setup(args)
    await start(args)
  }
  catch (err) {
    console.error(err)
  }
  finally {
    return await end(args)
  }
}

const setup = async args => {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }

  console.log('Starting browser...')
  browser = await puppeteer.launch({
    args: ['--disable-dev-shm-usage'],
    // headless: false
  });
  page = await browser.newPage();
  await page.emulate(iPhone);

  page.on('pageerror', err => {
    console.error('Page error: ' + err)
  })
  page.on('error', err => {
    console.error('Error: ' + err)
  })
  if (args.username && args.password) {
    await login(page, args.username, args.password)
  }
  console.log(`Going to https://www.instagram.com/${args.target}/feed/`)
  await page.goto(`https://www.instagram.com/${args.target}/feed/`, { waitUntil: 'networkidle2' });
  await page.waitFor(1000);
}

const start = async args => {
  console.log('Scrapping images....')
  queue = await getPostList(page)

  console.log('Scrapping highlighted stories....')
  storyQueue = await getStoryList(page)

  const items = Object.keys({ ...queue, ...storyQueue })

  console.log(`Downloading ${items.length} images/videos....`)
  let promises = items.map(src => {
    return downloadList(src)
  })
  await Promise.all(promises)

  await compress(args)
}

const end = async args => {
  try {
    console.log('Closing...')
    await browser.close();
  } catch (err) {
    console.log(err)
  } finally {
    return `outputs/${args.target}.zip`
  }
}

const downloadList = async src => {
  try {
    return download(src, `${dir}/${src.match(/[\w-]+.(jpg|png|mp4)/gs)}`, () => {})
  }
  catch (err) {
    console.log(err)
  }
}

module.exports = init
