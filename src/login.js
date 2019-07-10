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

module.exports = login;