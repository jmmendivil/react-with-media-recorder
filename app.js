import React from 'react'
import ReactDOM from 'react-dom'
import VideoRecorder from './VideoRecorderComponent'

const videoConstraints = {
  audio: true,
  video: true
}

window.ask = false
window.record = false
window.stop = false

class WithVideo extends React.Component {
  constructor () {
    super()
    this.state = {
      ask: window.ask,
      record: window.record,
      stop: window.stop
    }
  }
  render () {
    const { ask, record, stop } = this.state

    return (
      <div>
        <button onClick={() => this.setState({ ask: true })}>start</button>
        <button onClick={() => this.setState({ record: true })}>record</button>
        <button onClick={() => this.setState({ stop: true })}>stop</button>
        <VideoRecorder

          askPermissions={ask}
          startRecord={record}
          stopRecord={stop}

          constraints={videoConstraints}
          recordTimerMs={5000}
          onRecordStart={(record) => {
            console.log('Record Start')
            console.log(record)
            // avoid infinite loop when record stops
            this.setState({ record: false })
          }}
          onRecordStop={(videoBlob) => {
            console.log('Record ended')
            console.log(videoBlob)
            this.setState({ stop: false })
          }}
          onError={function (e) {
            console.log('Error>>>', e)
          }}
        />
      </div>
    )
  }
}
var mountNode = document.getElementById('app')
ReactDOM.render(
  <WithVideo />,
  mountNode
)
