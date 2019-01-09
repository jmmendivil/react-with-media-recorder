import React from 'react'
import ReactDOM from 'react-dom'
import withVideoRecorder from './VideoRecorderComponentHOC'

const videoConstraints = {
  audio: true,
  video: true
}

class Controls extends React.Component {
  componentDidMount () {
    this.props.videoRecorder.onRecordStart(function (stopRecordMethod) {
      console.log('Record START!')
    })
    this.props.videoRecorder.onRecordStop(function (videoBlob) {
      console.log('Record END')
    })
  }
  render () {
    const { videoRecorder } = this.props
    return (
      <div>
        <span>Video recorder - {(videoRecorder.isRecording) && 'Recording...'}</span>
        <div>{videoRecorder.videoPreviewElement}</div>
        <div>{videoRecorder.videoRecordedElement}</div>
        <button onClick={videoRecorder.askPermissions}>[>] start</button>
        {(videoRecorder.isRecording)
          ? <button onClick={videoRecorder.stopRecord}>[x] stop</button>
          : <button onClick={videoRecorder.record}>[o] record</button>
        }
      </div>
    )
  }
}
var mountNode = document.getElementById('app')
const WithVideo = withVideoRecorder(Controls)
ReactDOM.render(
  <WithVideo
    constraints={videoConstraints}
    recordDelayMs={2000}
    recordTimerMs={5000}
  />,
  mountNode
)
