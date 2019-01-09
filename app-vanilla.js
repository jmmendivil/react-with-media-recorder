const recordTime = 5000
const videoConstraints = {
  audio: true,
  video: {
    width: { exact: 640 },
    heigth: { exact: 480 }
  }
}
let mediaStream

function wait (delayInMS) {
  return new Promise(resolve => setTimeout(resolve, delayInMS))
}

const startBtn = document.querySelector('#start-btn')
const stopBtn = document.querySelector('#stop-btn')
const pauseBtn = document.querySelector('#pause-btn')
const recordBtn = document.querySelector('#record-btn')

startBtn.addEventListener('click', () => {
  if (!isMediaActive()) initWebcam(videoConstraints)
  else console.log('already asked')
})

stopBtn.addEventListener('click', () => {
  if (isMediaActive()) stopMedia(mediaStream)
  else console.log('no media to stop')
})

pauseBtn.addEventListener('click', () => {
  if (isMediaActive()) pauseMedia(mediaStream)
  else console.log('no media to stop')
})

recordBtn.addEventListener('click', () => {
  if (isMediaActive()) startRecording(mediaStream, recordTime).then(saveRecordedFile)
  else console.log('no media to stop')
})

function isMediaActive () {
  return (typeof mediaStream !== 'undefined' && mediaStream.active)
}

function hasUserMedia () {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

function hasAudioVideoDevices () {
  let hasAudio = false
  let hasVideo = false
  return navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      devices.forEach(device => {
        if (device.kind === 'audioinput') hasAudio = true
        if (device.kind === 'videoinput') hasVideo = true
      })
      return (hasAudio && hasVideo)
    })
}
// ---

// Ask permisions
async function initWebcam (constraints) {
  if (!hasUserMedia()) throw new Error('Navigator does not support video media record.')
  if (!await hasAudioVideoDevices()) throw new Error('Not audio/video input devices detected.')

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      mediaStream = stream
      return mediaStream
    })
    .then(playMedia)
}

// Starts media on video element
function playMedia (stream) {
  const videoPreview = document.querySelector('#video-preview')
  return new Promise((resolve, reject) => {
    try {
      videoPreview.srcObject = stream
      videoPreview.capureStream = videoPreview.capureStream || videoPreview.mozCaptureStream
    } catch (e) {
      console.log('srcObject fallback')
      videoPreview.src = URL.createObjectURL(stream)
    }
    videoPreview.onplaying = resolve
  })
}

function stopMedia (stream) {
  stream.getTracks().map(t => t.stop())
}

function pauseMedia (stream) {
  stream.getTracks().forEach(t => {
    t.enabled = !t.enabled
  })
}

function startRecording (stream, length) {
  const recorder = new window.MediaRecorder(stream)
  let data = []

  recorder.ondataavailable = event => data.push(event.data)
  recorder.start()
  console.log(recorder.state + ' for ' + (length / 1000) + ' seconds...')

  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve
    recorder.onerror = event => reject(event.name)
  })

  let recording = wait(length).then(() => {
    recorder.state === 'recording' && recorder.stop()
  })

  return Promise.all([
    stopped,
    recording
  ]).then(() => data)
}

function saveRecordedFile (videoChunks) {
  let recordedBlob = new Blob(videoChunks, { type: "video/webm" })
  const videoRecorded = document.querySelector('#video-recorded')
  videoRecorded.src = URL.createObjectURL(recordedBlob)
  console.log('Successfully recorded ' + recordedBlob.size + ' bytes of ' + recordedBlob.type + ' media.');
}
