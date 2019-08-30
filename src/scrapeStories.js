const getImage = async(page) => {
  try {
    return await page.$eval('img', img => img.src);
  } catch {
    return null
  }
}

const getVideo = async(page) => {
  try {
    return await page.$eval('video source', video => video.src)
  } catch {
    return null
  }
}

const getStoryList = async(page, callback) => {
  let storyQueue = {}
  try {
    await page.click('._3D7yK')
    let buttonExist = true
    while (buttonExist) {
      try {
        await page.waitFor('._4sLyX')
        await page.waitFor(500)
        let src = await getVideo(page) || await getImage(page)
        storyQueue = { [src]: false, ...storyQueue }
        callback(Object.keys(storyQueue).length)
        await page.waitFor('._4sLyX')
        await page.click('._4sLyX') // Next Story
        await page.$eval('._4sLyX', ele => buttonExist = !!ele)
      } catch (err) {
        console.log(err)
        buttonExist = false
      }
    }
  } catch {
    console.log('No stories available.')
  } finally {
    return storyQueue
  }
}

module.exports = getStoryList