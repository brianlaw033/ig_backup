const puppeteer = require('puppeteer');
const _ = require('lodash')
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];
const fs = require("fs");
const pLimit = require('p-limit');

const login = require('./src/login')
const download = require('./src/download')
const getStoryList = require('./src/scrapeStories')
const getPostList = require('./src/scrapeImages')
const compress = require('./src/compress')
const utils = require('./src/utils')

const limit = pLimit(5)

const status = {
  login: 'Logging in...',
  visiting: target => `Searching ${target}`,
  scrappingImages: count => `Scrapping images... ${count ? `${count} Found.` : ''}`,
  scrappingStories: count => `Scrapping highlighted stories... ${count ? `${count} Found.` : ''}`,
  downloading: progress => `Preparing ${progress}...`,
  compressing: 'Compressing images...'
}

class Instagrapper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.queue = {}
    this.storyQueue = {}
    this.dir = ''
    this.status = ''
  }

  async init (args, proxy) {
    try {
      this.dir = `./img/${args.target}`
      this.proxy = proxy
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
      args: [
        // Required for Docker version of Puppeteer
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // This will write shared memory files into /tmp instead of /dev/shm,
        // because Docker’s default for /dev/shm is 64MB
        '--disable-dev-shm-usage'
      ]
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
      this.proxy.status = status.login
      await login(this.page, args.username, args.password)
    }
    this.proxy.status = status.visiting(args.target)
    await this.page.goto(`https://www.instagram.com/${args.target}/feed/`, { waitUntil: 'networkidle2' });
    await this.page.waitFor(1000);
  }

  async start (args) {
    this.proxy.status = status.scrappingImages()
    this.queue = await getPostList(this.page, count => {
      this.proxy.status = status.scrappingImages(count)
      return true
    })

    this.proxy.status = status.scrappingStories()
    this.storyQueue = await getStoryList(this.page, count => {
      this.proxy.status = status.scrappingStories(count)
      return true
    })

    let items = Object.keys({ ...this.queue, ...this.storyQueue })

    items = _.remove(items, item => {
      return !!item
    })

    let promises = items.map(src => {
      return limit(() => download(src, `${this.dir}/${src.match(/[\w-]+.(jpg|png|mp4)/gs)}`, () => {}))
    })

    await utils.allProgress(promises, (finishCount) => {
      this.proxy.status = status.downloading(`${finishCount} / ${items.length}`)
    })

    this.proxy.status = status.compressing
    return await compress(args)
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

}

module.exports = Instagrapper
