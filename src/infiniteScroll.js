const infiniteScroll = async (page, { onScroll, customScroll }) => {
  let previousHeight = 0
  let currentHeight = await page.evaluate('document.body.scrollHeight');
  while (currentHeight !== previousHeight) {
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
  }
  return true
}

module.exports = infiniteScroll