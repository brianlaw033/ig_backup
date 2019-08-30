const allProgress = async(promises, progressCallback) => {
  let done = 0;
  progressCallback(0);
  for (const promise of promises) {
    promise.then(() => {
      done ++;
      progressCallback(done);
    });
  }
  return await Promise.all(promises);
}

module.exports = {
  allProgress
}