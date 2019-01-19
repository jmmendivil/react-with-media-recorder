import React from 'react'
import ReactDOM from 'react-dom'
import WithMediaRecorder from '../src/WithMediaRecorder'

const videoConstraints = {
  audio: true,
  video: true
}

class ControlsExample extends React.Component {
  componentDidMount () {
    this.props.mediaRecorder.onRecordStart(function (stopRecordMethod) {
      console.log('Record START!')
    })
    this.props.mediaRecorder.onRecordStop(function (mediaBlob) {
      console.log('Record ENDED')
    })
  }
  render () {
    const { mediaRecorder } = this.props
    return (
      <div>
        <h1>Media recorder</h1>
        <p>{(mediaRecorder.isRecording) && '- Recording...'}</p>
        <div>
          <div>{mediaRecorder.previewElement}</div>
          <div>{mediaRecorder.recordedElement}</div>
        </div>
        <button onClick={mediaRecorder.askPermissions}>[?] ask/start</button>
        {(mediaRecorder.isRecording)
          ? <button onClick={mediaRecorder.stopRecord}>[x] stop</button>
          : <button onClick={mediaRecorder.record}>[o] record</button>
        }
      </div>
    )
  }
}

var mountNode = document.getElementById('app')
const ControlsWithVideo = WithMediaRecorder(ControlsExample)
ReactDOM.render(
  <ControlsWithVideo
    constraints={{ video: true, audio: true }}
  />,
  mountNode
)
