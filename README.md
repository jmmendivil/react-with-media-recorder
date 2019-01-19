React with media recorder
-

React Higher-Order Component for the [MediaStream Recording API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API).

_Capture audio or video from React Component_.

Install
---
```
npm install react-with-mediarecorder
```

Usage
---
```
WithMediaRecorder(Component)
```

```
import React from 'react'
import WithMediaRecorder from 'react-with-mediarecorder'

const Example = ({ mediaRecorder }) => (
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

export default WithMediaRecorder(Example)
```
```
<ExampleWithRecorder
  constraints={{ video: true, audio: true }}
  recordDelayMs={2000}
  recordTimerMs={20000}
/>
```

Options props
---

- **constraints**: _Object_ : *required*

  A [MediaStreamConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints) object

  Most simple audio/video example:
  ```
  {
    video: true,
    audio: true
  }
  ```

- **recordDelayMs**: _Int_

  Time _(ms)_ to wait for autorecord.

- **recordTimerMs**: _Int_

  Time _(ms)_ to max record time

Injected props
--
  - **recordedElement**: _HTML Element_
  - **previewElement**: _HTML Element_
  - **isRecording**: _Bool_
  - **askPermissions**: _Method_
  - **closeMedia**: _Method_
  - **pauseMedia**: _Method_
  - **record**: _Method_
  - **stopRecord**: _Method_
  - **onRecordStart**: _Fn callback (stopRecordMethod)_
  - **onRecordStop**: _Fn callback (mediaBlob)_
  - **onUserAccepts**: _Fn Callback (MediaStream)_
