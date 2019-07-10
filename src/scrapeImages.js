const infiniteScroll = require('./infiniteScroll')

const getPostList = async(page) => {
  let queue = await getExisitingPosts(page)
  await page.evaluate("document.querySelectorAll('article')[document.querySelectorAll('article').length - 1].scrollIntoView()")
  await page.waitFor(1000);
  await infiniteScroll(page, {
    onScroll: async() => {
      let tmp = await getExisitingPosts(page)
      queue = { ...queue, ...tmp }
    },
    customScroll: async() => {
      await page.evaluate("document.querySelectorAll('article')[document.querySelectorAll('article').length - 1].scrollIntoView()")
    }
  })
  return queue
}

const getExisitingPosts = async(page) => {
  let queue = {}
  current = [...Object.keys(queue)].length
  try {
    const imgs = await page.$$eval('article .FFVAD', imgs => imgs.map(img => img.src));
    const videos = await page.$$eval('article video', videos => videos.map(video => video.src));
    [...imgs, ...videos].forEach(async(src, i) => {
      queue = { [src]: false, ...queue}
    })
  }
  catch (err) {
    console.log(err)
  } finally {
    return queue
  }
}

module.exports = getPostList