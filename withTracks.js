const videoConstraints = {
  audio: true,
  video: {
    width: { exact: 640 },
    heigth: { exact: 480 }
  }
}

let mediaStream
let tracks

const askBtn = document.querySelector('#ask-btn')
const startBtn = document.querySelector('#start-btn')
const pauseBtn = document.querySelector('#pause-btn')
const stopBtn = document.querySelector('#stop-btn')
// const recordBtn = document.querySelector('#record-btn')

askBtn.addEventListener('click', () => {
  if (!existsTracks()) initWebcam(videoConstraints)
  else console.log('already asked')
})

startBtn.addEventListener('click', () => {
  if (existsTracks() && !isMediaActive()) return createMedia()
  else console.log('no tracks to start media, ask for permissions; or media is active')
})

pauseBtn.addEventListener('click', () => {
  if (isMediaActive()) stopVideoAndSaveTracks()
  else console.log('no media to pause')
})

stopBtn.addEventListener('click', () => {
  if (isMediaActive()) stopAccess()
  else console.log('no media to stop')
})

function existsTracks () {
  return (typeof tracks !== 'undefined' && tracks.every(t => t.readyState === 'live'))
}
function isMediaActive () {
  return (typeof mediaStream !== 'undefined' && mediaStream.active)
}

// Ask permisions
function initWebcam (constraints) {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      tracks = stream.getTracks()
      // iOS compatible
      // mediaStream = stream
    })
}

// Starts media on video element
function createMedia () {
  // not iOS compatible
  mediaStream = new window.MediaStream(tracks)
  playMedia(mediaStream)
}
function playMedia (stream) {
  const video = document.querySelector('video')
  try {
    video.srcObject = stream
    addFx(false)
  } catch (error) {
    console.log('srcObject fallback')
    video.src = URL.createObjectURL(stream)
  }
}

function stopVideoAndSaveTracks () {
  addFx(true)
  tracks = tracks.map(t => {
    const c = t.clone()
    t.stop()
    return c
  })
}

// ----
function stopAccess () {
  mediaStream.getTracks().map(t => t.stop())
}

function addFx (apply) {
  const videoWrapper = document.querySelector('.video')
  const video = document.querySelector('video')
  if (apply) {
    applyStyle(videoWrapper, `overflow: hidden; width: ${videoConstraints.video.width}; heigth: ${videoConstraints.video.heigth}`)
    applyStyle(video, 'blur(15px) grayscale(1)')
  } else {
    applyStyle(video, '')
  }
}
function applyStyle (el, styleString) {
  el.setAttribute('style', styleString)
}
