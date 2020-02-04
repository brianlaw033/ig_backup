require('dotenv').config()
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];
const { assert } = require('chai');

const config = require('../config')
const login = require('../src/login')

let page, browser

describe('Insta9rapper', () => {

  before(async() => {
    browser = await puppeteer.launch({
      args: config.puppeteer
    });
    page = await browser.newPage();
    await page.emulate(iPhone);
  })

  beforeEach(async() => {
    page = await browser.newPage()
  })

  afterEach(async() => {
    await page.close()
  })

  after(async() => {
    await browser.close()
  })

  describe('Login to Instagram', function () {
    this.timeout(60000);
    it('should find the username from the url', async() => {
      await login(page, process.env.TEST_USERNAME, process.env.TEST_PASSWORD)
      const isLogin = await page.$eval('html', html => {
        return html.className.includes('logged-in')
      })
      assert.isTrue(isLogin, 'Login successful')
    })
  })

})
