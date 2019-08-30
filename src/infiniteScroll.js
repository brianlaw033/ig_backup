const infiniteScroll = async (page, { onScroll, customScroll, customContinue }) => {
  let previousHeight = 0
  let currentHeight = await page.evaluate('document.body.scrollHeight');
  let isContinue = 0
  const checking = async() => {
    if (customContinue) {
      return await customContinue()
    } else {
      return currentHeight !== previousHeight
    }
  }
  while (isContinue < 3) {
    previousHeight = await page.evaluate('document.body.scrollHeight');
    await page.evaluate("document.querySelectorAll('article')[document.querySelectorAll('article').length - 1].scrollIntoView()")
    if (customScroll) {
      await customScroll()
    } else {
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
    }
    await page.waitFor(1000);
    await onScroll && onScroll()
    currentHeight = await page.evaluate('document.body.scrollHeight');
    let tmp = await checking()
    if (!tmp) isContinue += 1
  }
  return true
}

module.exports = infiniteScroll