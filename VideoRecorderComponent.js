import React from 'react'

class VideoRecorder extends React.Component {
  constructor () {
    super()
    this.state = {
      hasPreview: false,
      hasRecord: false,
      isRecording: false
    }

    this.recorder = null
    this.mediaStream = null
    this.videoBlob = null

    // video refs
    this.previewRef = React.createRef()
    this.recordedRef = React.createRef()

    this.askPermissions = this.askPermissions.bind(this)
    this.stop = this.stop.bind(this)
    this.pause = this.pause.bind(this)
    this.record = this.record.bind(this)
    this.stopRecord = this.stopRecord.bind(this)
    this.saveVideoBlob = this.saveVideoBlob.bind(this)
  }

  componentDidUpdate (prevProps) {
    if (this.props.askPermissions && !this.asked) {
      this.asked = true // ask only once
      this.askPermissions()
    }
    if (this.props.startRecord) this.record()
    if (this.props.stopRecord) this.stopRecord()
  }

  // Actions {{{
  async askPermissions () {
    if (!this.isMediaActive()) {
      if (!this.hasUserMedia()) throw new Error('Navigator does not support video media record.')
      if (!await this.hasAudioVideoDevices()) throw new Error('Not audio/video input devices detected.')

      // ask for user permissions
      try {
        this.mediaStream = await window.navigator.mediaDevices.getUserMedia(this.props.constraints)
        this.setState({ hasPreview: true })
      } catch (e) {
        if (e === 'NotAllowedError') throw new Error('Media access not allowed, cant record.')
        this.props.onError(e)
        console.log('Video error: ', e)
      }
    } else console.error('Media active, permissions already asked.')
  }
  stop () {
    if (this.isMediaActive()) {
      this.mediaStream.getTracks().map(t => t.stop())
    } else console.error('No media to stop.')
  }
  pause () {
    if (this.isMediaActive()) {
      this.mediaStream.getTracks().forEach(t => {
        t.enabled = !t.enabled
      })
    } else console.log('No media to pause.')
  }
  record () {
    if (this.isMediaActive()) {
      if (this.state.isRecording) return console.error('Media currently recording...')
      const recorder = new window.MediaRecorder(this.mediaStream)
      let videoChunks = []

      recorder.ondataavailable = evt => videoChunks.push(evt.data)
      recorder.onstart = evt => {
        this.setState({ isRecording: true })
        this.props.onRecordStart(recorder, evt)
      }

      const stopped = new Promise((resolve, reject) => {
        recorder.onstop = (evt) => {
          this.setState({ isRecording: false })
          resolve(videoChunks)
        }
        recorder.onerror = event => reject(event.name)
      })
      // stop recording - timer
      this.wait(this.props.recordTimerMs).then(this.stopRecord)

      this.recorder = recorder
      recorder.start()

      stopped
        .then(this.saveVideoBlob)
        .then(this.props.onRecordStop)
        .catch(this.props.onError)
    } else console.error('No media to record.')
  }
  // TODO: add onSaved as prop to save
  saveVideoBlob (videoChunks) {
    try {
      this.videoBlob = new window.Blob(videoChunks, { type: 'video/webm' })
      this.setState({ hasRecord: true })
      return this.videoBlob
    } catch (e) {
      console.error('Error generating video file:', e)
    }
  }
  stopRecord () {
    if (this.state.isRecording) {
      this.recorder.state === 'recording' && this.recorder.stop()
      console.log('record stoped', this.recorder)
    } else console.error('No recording in progres to stop.')
  } // --- }}}

  // Helpers {{{
  hasUserMedia () {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }
  isMediaActive () {
    console.log('Current media', this.mediaStream)
    return !!(this.mediaStream && this.mediaStream.active)
  }
  hasAudioVideoDevices () {
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
  wait (delay) {
    return new Promise(resolve => setTimeout(resolve, delay))
  }
  // --- }}}

  // Renders {{{
  renderPreview (hasPreview) {
    if (hasPreview) {
      this.previewRef.current.srcObject = this.mediaStream
    }
    return <video ref={this.previewRef} autoPlay playsInline muted />
  }

  renderRecorded (hasRecord) {
    if (hasRecord) {
      this.recordedRef.current.src = URL.createObjectURL(this.videoBlob)
    }
    return <video ref={this.recordedRef} controls />
  }
  // --- }}}

  render () {
    const { hasPreview, hasRecord, isRecording } = this.state
    return (
      <div>
        {this.renderPreview(hasPreview)}
        {this.renderRecorded(hasRecord)}
        <div>
          <button onClick={this.askPermissions}>[>] Start</button>
          <button onClick={this.stop}>[x] Stop</button>
          <button onClick={this.pause}>[||] Pause</button>
          { (isRecording)
            ? <button onClick={this.stopRecord}>[x] Stop record</button>
            : <button onClick={this.record}>[o] Record</button>
          }
        </div>
      </div>
    )
  }
}

// props:
// constraints
// recordTimerMs
// onRecordStart
// onRecordStop

export default VideoRecorder
