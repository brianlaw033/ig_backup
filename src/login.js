export default async(browser, username, password) => {
  page = await browser.newPage();
  await page.goto(`https://www.instagram.com/accounts/login/`, { waitUntil: 'networkidle2' });
  const inputs = await page.$$('input')
  await inputs[0].type(username)
  await inputs[1].type(password)
  await inputs[1].press('Enter')
}
