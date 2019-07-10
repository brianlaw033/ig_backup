const puppeteer = require('puppeteer');
const _ = require('lodash')
const minimist = require('minimist')
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];
const fs = require("fs");

const login = require('./src/login')
const download = require('./src/download')
const getStoryList = require('./src/scrapeStories')
const getPostList = require('./src/scrapeImages')

browser = null;
page = null;

const args = minimist(process.argv.slice(2))
let dir;

let queue = {}
let storyQueue = {}

const init = async() => {
  try {
    dir = `./img/${args.target}`
    await setup(args)
    await start()
  }
  catch (err) {
    console.error(err)
  }
  finally {
    await end()
  }
}

const setup = async(args) => {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  console.log('Starting browser...')
  browser = await puppeteer.launch({
    args: ['--disable-dev-shm-usage'],
    headless: false
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

const start = async() => {
  console.log('Scrapping images....')
  queue = await getPostList(page)

  console.log('Scrapping highlighted stories....')
  storyQueue = await getStoryList(page)

  Object.keys({ ...queue, ...storyQueue }).forEach(src => {
    downloadList(src)
  })
}

const end = async() => {
  try {
    console.log('Closing...')
    await browser.close();
  } catch (err) {
    console.log(err)
  }
}

const downloadList = async(src) => {
  try {
    console.log(`Downloading ${src.match(/[\w-]+.(jpg|png|mp4)/gs)}...`)
    return download(src, `${dir}/${src.match(/[\w-]+.(jpg|png|mp4)/gs)}`, () => {})
  }
  catch (err) {
    console.log(err)
  }
}

module.exports = init
