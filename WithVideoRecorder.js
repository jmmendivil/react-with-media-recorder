import React from 'react'

function withVideoRecorder (WrappedComponent) {
  return class VideoRecorder extends React.Component {
    constructor (props) {
      super(props)
      this.state = { isRecording: false }

      this.recorder = null
      this.mediaStream = null
      this.blob = null

      // Video refs
      this.previewRef = React.createRef()
      this.recordedRef = React.createRef()

      // Callbacks
      this.onRecordStart = this.onRecordStart.bind(this)
      this.setRecordStartCb = this.setRecordStartCb.bind(this)
      this.onRecordStop = this.onRecordStop.bind(this)
      this.setRecordStopCb = this.setRecordStopCb.bind(this)

      // Actions
      this.askPermissions = this.askPermissions.bind(this)
      this.closeMedia = this.closeMedia.bind(this)
      this.pauseMedia = this.pauseMedia.bind(this)
      this.record = this.record.bind(this)
      this.stopRecord = this.stopRecord.bind(this)
      this.saveVideoBlob = this.saveVideoBlob.bind(this)
    }

    componentDidMount () {
      this.recordDelay()
    }

    // Actions {{{
    async askPermissions () {
      if (!this.isMediaActive()) {
        if (!this.hasUserMedia()) throw new Error('Navigator does not support video media record.')
        if (!await this.hasAudioVideoDevices()) throw new Error('Not audio/video input devices detected.')

        // Ask user for permissions
        try {
          this.mediaStream = await window.navigator.mediaDevices.getUserMedia(this.props.constraints)
          this.recordDelay()
          if (this.previewRef.current) this.previewRef.current.srcObject = this.mediaStream
        } catch (e) {
          if (e === 'NotAllowedError') throw new Error('Media access not allowed, cant record.')
          console.error('Video error: ', e)
        }
      } else console.error('Media active, permissions already asked.')
    }
    closeMedia () {
      if (this.isMediaActive()) {
        this.mediaStream.getTracks().map(t => t.stop())
      } else console.error('No media to stop. Is media active?')
    }
    pauseMedia () {
      if (this.isMediaActive()) {
        this.mediaStream.getTracks().forEach(t => {
          t.enabled = !t.enabled
        })
      } else console.error('No media to pause. Is media active?')
    }
    record () {
      if (this.isMediaActive()) {
        if (this.state.isRecording) return console.error('Media currently recording...')
        const recorder = new window.MediaRecorder(this.mediaStream)
        let videoChunks = []

        recorder.ondataavailable = evt => videoChunks.push(evt.data)
        recorder.onstart = this.onRecordStart

        const stopped = new Promise((resolve, reject) => {
          recorder.onstop = evt => resolve(videoChunks)
          recorder.onerror = event => reject(event.name)
        })
        // stop recording - timer
        this.wait(this.props.recordTimerMs).then(this.stopRecord)

        this.recorder = recorder
        recorder.start()

        stopped
          .then(this.saveVideoBlob)
          .then(this.onRecordStop)
      } else console.error('No media to record.')
    }
    // TODO: add onSaved as prop to save
    saveVideoBlob (videoChunks) {
      try {
        this.blob = new window.Blob(videoChunks, { type: 'video/webm' })
        if (this.recordedRef.current) this.recordedRef.current.src = URL.createObjectURL(this.blob)
        return this.blob
      } catch (e) {
        console.error('Error generating file:', e)
      }
    }
    stopRecord () {
      if (this.state.isRecording) {
        this.recorder.state === 'recording' && this.recorder.stop()
      } else console.error('No record in progress to stop.')
    } // --- }}}

    // Events callbacks {{{
    onRecordStart () {
      this.setState({ isRecording: true }, () => {
        if (typeof this.recordStartCb === 'function') this.recordStartCb(this.stopRecord)
      })
    }
    onRecordStop (blob) {
      this.setState({ isRecording: false }, () => {
        if (typeof this.recordStopCb === 'function') this.recordStopCb(blob)
      })
    }
    setRecordStartCb (cb) { this.recordStartCb = cb }
    setRecordStopCb (cb) { this.recordStopCb = cb }
    // --- }}}

    // Helpers {{{
    hasUserMedia () {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    }
    isMediaActive () {
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
    recordDelay () {
      if (this.props.recordDelayMs && this.isMediaActive()) {
        this.wait(this.props.recordDelayMs).then(this.record)
      }
    }
    // --- }}}

    render () {
      const videoRecorder = {
        isRecording: this.state.isRecording,
        videoRecordedElement: <video ref={this.recordedRef} controls />,
        videoPreviewElement: <video ref={this.previewRef} autoPlay playsInline muted />,
        askPermissions: this.askPermissions,
        closeMedia: this.closeMedia,
        pauseMedia: this.pauseMedia,
        record: this.record,
        stopRecord: this.stopRecord,
        onRecordStart: this.setRecordStartCb,
        onRecordStop: this.setRecordStopCb
      }
      const { recordDelayMs, recordTimerMs, constraints, ...passedProps } = this.props
      return <WrappedComponent videoRecorder={videoRecorder} {...passedProps} />
    }
  }
}

export default withVideoRecorder
