const puppeteer = require('puppeteer');
const { Cluster } = require('puppeteer-cluster');
const _ = require('lodash')
const fs = require("fs");
const rp = require('request-promise');
const minimist = require('minimist')
const infiniteScroll = require('./src/infiniteScroll')
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];

browser = null;
page = null;
cluster = null;
storyCluster = null;

const args = minimist(process.argv.slice(2))
const dir = `./img/${args.target}`

let queue = {}

const init = async() => {
  try {
    await setup()
    await start()
  }
  catch (err) {
    console.error(err)
  }
  finally {
    await end()
  }
}

const setup = async() => {
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
  cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE, // use one browser per worker
    maxConcurrency: 10, // cluster with four workers
    args: ['--disable-dev-shm-usage'],
    headless: false
  });
  storyCluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE, // use one browser per worker
    maxConcurrency: 2, // cluster with 2 workers
    args: ['--disable-dev-shm-usage'],
    headless: false
  });
  page.on('pageerror', err => {
    console.error('Page error: ' + err)
  })
  page.on('error', err => {
    console.error('Error: ' + err)
  })
  await page.setViewport({ width: 400, height: 812 })
  if (args.username && args.password) {
    await login(page, args.username, args.password)
  }
  console.log(`Going to https://www.instagram.com/${args.target}/feed/`)
  await page.goto(`https://www.instagram.com/${args.target}/feed/`, { waitUntil: 'networkidle2' });
  // await page.waitFor(10000);
}

const start = async() => {
  const startScrapping = async() => {
    current = [...Object.keys(queue)].length
    try {
      const imgs = await page.$$eval('article .FFVAD', imgs => imgs.map(img => img.src));
      const videos = await page.$$eval('article video', videos => videos.map(video => video.src));

      [...imgs, ...videos].forEach(async(src, i) => {
        queue = { [src]: false, ...queue}
      })

      // storyCluster.task(captureHighlightStory)
      // const storyButtons = await page.$$('canvas')
      // storyButtons.map(async (button, i) => {
      //   storyCluster.queue(i)
      // })
    }
    catch (err) {
      console.log(err)
    }
  }
  await startScrapping()
  await page.evaluate("document.querySelectorAll('article')[document.querySelectorAll('article').length - 1].scrollIntoView()")
  await page.waitFor(1000);

  await infiniteScroll(page, {
    onScroll: startScrapping,
    customScroll: async() => {
      await page.evaluate("document.querySelectorAll('article')[document.querySelectorAll('article').length - 1].scrollIntoView()")
    }
  })

  cluster.task(capturePost)
  Object.keys(queue).forEach(src => {
    cluster.queue(src)
  })
}


const end = async() => {
  try {
    await cluster.idle();
    console.log('Closing...')
    await browser.close();
    await cluster.close();
  } catch (err) {
    console.log(err)
  }
}

const capturePost = async({ page, data: url }) => {
  try {
    console.log(`Downloading ${url.match(/[\w-]+.(jpg|png|mp4)/gs)}...`)
    return download(url, `${dir}/${url.match(/[\w-]+.(jpg|png|mp4)/gs)}`, () => {})
  }
  catch (err) {
    console.log(err)
  }
}

const captureHighlightStory = async({ page, data: buttonNo }) => {
  try {
    const islogin = await isLoggedIn(page)
    if (!islogin && args.username && args.password) {
      await login(page, args.username, args.password)
    }

    await page.goto(`https://www.instagram.com/${args.target}`, { waitUntil: 'networkidle2' });
    const storyButtons = await page.$$('canvas')
    await storyButtons[buttonNo].click()
    await page.waitForSelector('video source')
    const video = await page.$eval('video source', video => video.src);
    const img = await page.$eval('img', img => img.src);
    let src = video || img
    console.log(`Downloading ${src.match(/[\w-]+.(jpg|png|mp4)/gs)}...`)
    download(src, `${dir}/${src.match(/[\w-]+.(jpg|png|mp4)/gs)}`, () => {})
    console.log(`${src.match(/[\w-]+.(jpg|png|mp4)/gs)} Done`)
  }
  catch (err) {
    console.log(err)
  }
}

const download = (uri, filename, callback) => {
  return rp.head(uri, (err, res, body) => {
    rp(uri)
    .pipe(fs.createWriteStream(filename))
    .on("close", callback);
  });
}

const login = async(page, username, password) => {
  await page.goto(`https://www.instagram.com/accounts/login/`, { waitUntil: 'networkidle2' });
  const inputs = await page.$$('input')
  await inputs[0].type(username)
  await inputs[1].type(password)
  await inputs[1].press('Enter')
  await page.waitFor((args) => {
    const as = document.querySelectorAll('section > nav a')
    return as[as.length - 1] && as[as.length - 1].href.includes(args[0])
  }, {}, username)
}

const isLoggedIn = async(page) => {
  await page.goto(`https://www.instagram.com/${args.target}`, { waitUntil: 'networkidle2' });
  const hasSignUpButton = await page.$$eval('section > nav a', as => as[as.length - 1].innerText ==='Sign Up' )
  return !hasSignUpButton
}

init()
