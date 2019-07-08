const infiniteScroll = async (page, { onScroll }) => {
  let previousHeight = 0
  let currentHeight = await page.evaluate('document.body.scrollHeight');
  while (currentHeight > previousHeight) {
    previousHeight = await page.evaluate('document.body.scrollHeight');
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    // await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
    await page.waitFor(1000);
    await onScroll && onScroll()
    currentHeight = await page.evaluate('document.body.scrollHeight');
    console.log({ currentHeight, previousHeight })
  }
  console.log('Done')
  return true
}

module.exports = infiniteScroll