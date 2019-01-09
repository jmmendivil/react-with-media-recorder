import React from 'react'
import ReactDOM from 'react-dom'
import withVideoRecorder from './WithVideoRecorder'

const videoConstraints = {
  audio: true,
  video: true
}

class ControlsExample extends React.Component {
  componentDidMount () {
    this.props.videoRecorder.onRecordStart(function (stopRecordMethod) {
      console.log('Record START!')
    })
    this.props.videoRecorder.onRecordStop(function (videoBlob) {
      console.log('Record END')
      this.setState({ hasVideo: true })
    })
  }
  render () {
    const { videoRecorder } = this.props
    return (
      <div>
        <h1>Video recorder</h1>
        <p>{(videoRecorder.isRecording) && '- Recording...'}</p>
        <div>
          <div>{videoRecorder.videoPreviewElement}</div>
          <div>{videoRecorder.videoRecordedElement}</div>
        </div>
        <button onClick={videoRecorder.askPermissions}>[?] ask/start</button>
        {(videoRecorder.isRecording)
          ? <button onClick={videoRecorder.stopRecord}>[x] stop</button>
          : <button onClick={videoRecorder.record}>[o] record</button>
        }
      </div>
    )
  }
}

var mountNode = document.getElementById('app')
const ControlsWithVideo = withVideoRecorder(ControlsExample)
ReactDOM.render(
  <ControlsWithVideo
    constraints={videoConstraints}
    recordDelayMs={2000}
    recordTimerMs={5000}
  />,
  mountNode
)
