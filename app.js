import React from 'react'
import ReactDOM from 'react-dom'
import WithMediaRecorder from './WithMediaRecorder'

const videoConstraints = {
  audio: true,
  video: true
}

class ControlsExample extends React.Component {
  componentDidMount () {
    this.props.videoRecorder.onRecordStart(function (stopRecordMethod) {
      console.log('Record START!')
      // stopRecordMethod()
    })
    this.props.videoRecorder.onRecordStop(function (mediaBlob) {
      console.log('Record END', mediaBlob)
      // use mediaBlob as file
    })
  }
  render () {
    const { videoRecorder } = this.props
    return (
      <div>
        <h1>Video recorder</h1>
        <p>{(videoRecorder.isRecording) && '- Recording...'}</p>
        <div>
          <div>{videoRecorder.previewElement}</div>
          <div>{videoRecorder.recordedElement}</div>
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
const ControlsWithVideo = WithMediaRecorder(ControlsExample)
ReactDOM.render(
  <ControlsWithVideo
    constraints={videoConstraints}
    recordDelayMs={2000}
    recordTimerMs={20000}
  />,
  mountNode
)
