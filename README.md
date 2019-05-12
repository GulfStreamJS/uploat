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
    uploat: {
        url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        authorization: 'Bearer [YOUR_AUTH_TOKEN]',
        params: {
            sess_id : '[SESS_ID]'
        }
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
//       uploat: {
//          status: 'success',
//          code: 'dQw4w9WgXcQ' } } ],
//  uploat: {
//      url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
//      authorization: 'Bearer [YOUR_AUTH_TOKEN]', 
//      params: {
//          sess_id : '[SESS_ID]'
//      }
//  }
```

## API

#### downloat

Type: `array`

Required parameter `path`, the path to the file. Data can be obtained at the output of the <a href="https://github.com/GulfStreamJS/downloat" target="_blank">downloat</a> package.

#### uploat

Type: `object`

- `url`  the server URL to which the file will be sent;
- `params` parameters for authorization and other data.

#### season

Type: `number|array`

Upload only certain season(s).

#### episode

Type: `number|array`

Upload only certain episode(s).

#### source

Type: `string`

The name for the log file.