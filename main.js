const puppeteer = require('puppeteer');
const _ = require('lodash')
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];
const fs = require("fs");

const login = require('./src/login')
const download = require('./src/download')
const getStoryList = require('./src/scrapeStories')
const getPostList = require('./src/scrapeImages')
const compress = require('./src/compress')


class Instagrapper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.queue = {}
    this.storyQueue = {}
    this.dir = ''
  }

  async init (args) {
    try {
      this.dir = `./img/${args.target}`
      await this.setup(args)
      await this.start(args)
    }
    catch (err) {
      console.error(err)
    }
    finally {
      return await this.end(args)
    }
  }

  async setup (args) {
    if (!fs.existsSync(this.dir)){
      fs.mkdirSync(this.dir);
    }

    console.log('Starting browser...')
    this.browser = await puppeteer.launch({
      args: ['--disable-dev-shm-usage'],
      headless: false
    });
    this.page = await this.browser.newPage();
    await this.page.emulate(iPhone);

    this.page.on('pageerror', err => {
      console.error('Page error: ' + err)
    })
    this.page.on('error', err => {
      console.error('Error: ' + err)
    })
    if (args.username && args.password) {
      await login(page, args.username, args.password)
    }
    console.log(`Going to https://www.instagram.com/${args.target}/feed/`)
    await this.page.goto(`https://www.instagram.com/${args.target}/feed/`, { waitUntil: 'networkidle2' });
    await this.page.waitFor(1000);
  }

  async start (args) {
    console.log('Scrapping images....')
    this.queue = await getPostList(this.page)

    console.log('Scrapping highlighted stories....')
    this.storyQueue = await getStoryList(this.page)

    const items = Object.keys({ ...this.queue, ...this.storyQueue })

    console.log(`Downloading ${items.length} images/videos....`)
    let promises = items.map(src => {
      return this.downloadList(src)
    })
    await Promise.all(promises)

    await compress(args)
  }

  async end (args) {
    try {
      console.log('Closing...')
      await this.browser.close();
    } catch (err) {
      console.log(err)
    } finally {
      return `outputs/${args.target}.zip`
    }
  }

  async downloadList (src) {
    try {
      return download(src, `${this.dir}/${src.match(/[\w-]+.(jpg|png|mp4)/gs)}`, () => {})
    }
    catch (err) {
      console.log(err)
    }
  }

}

module.exports = Instagrapper
