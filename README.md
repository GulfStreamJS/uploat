## What is `uploat`?

Upload large video files to a remote server.

## Installation

```bash
npm i uploat
```

## Usage

Import the library in your code:

```js
const uploat = require('uploat');
```

### Upload files

```js
uploat({
    downloat: [
        {
            "type": "video",
            "path": ".downloat/My.Puppy.mp4",
            "size": 90145915,
            "name": "My.Puppy.mp4",
            "sha1": "e8999dc72d58d108990ae9983bd22943013f9788"
        }
    ],
    upload_url: 'https://upload.youtube.com',
    upload_params: {
        is_xhr: 'true',
        sess_id : 'ir4IlIIfEyreRFR'
    }
}).then(params => {
    console.log(params);
});
//{ downloat:
//   [ { type: 'video',
//       path: '.downloat/My.Puppy.mp4',
//       size: 90145915,
//       name: 'My.Puppy.mp4',
//       sha1: 'e8999dc72d58d108990ae9983bd22943013f9788',
//       upload: {
//          status: 'success',
//          code: 'dQw4w9WgXcQ' } } ],
//  upload_url: 'https://upload.youtube.com',
//  upload_params: { is_xhr: 'true', sess_id: 'ir4IlIIfEyreRFR' }
```

## API

#### downloat

Type: `array`

Required parameter `path`, the path to the file.
Data can be obtained at the output of the <a href="https://github.com/GulfStreamJS/downloat" target="_blank">downloat</a> package.

#### upload_url

Type: `string`

The server URL to which the file will be sent.

#### upload_params

Type: `object`

Parameters for authorization and other data.