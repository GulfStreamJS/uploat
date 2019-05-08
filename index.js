const follow_redirects = require('follow-redirects');
const Downloading = require('downloading');
const request = require('request');
const path = require('path');
const fs = require('fs');

follow_redirects.maxRedirects = 10;
follow_redirects.maxBodyLength = 500 * 1024 * 1024 * 1024;

module.exports = (params = {}) => {

    let name = params.source
        ? params.source.replace(/[^a-z0-9]/i, '_') + '.json'
        : 'uploat.json';

    let dir = params.path
        ? params.path
        : path.join('.uploat');
    fs.mkdirSync(dir, {recursive: true});

    let bar = new Downloading(':bar [:title] :percent', {
        width: 50,
        total: 100
    });

    const uploat = (params, id) => {
        let file = params.downloat[id];
        return new Promise(resolve => {
            let percent = 0, previous = 0, load = 0, disable = 0;
            let size = fs.lstatSync(path.join(file.path)).size;
            let r = request.post({
                url: params.uploat.url,
                formData: {
                    ...params.uploat.params,
                    file: fs.createReadStream(path.join(file.path))
                },
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Cache-Control': 'no-cache'
                },
                json: true
            }, (error, res, body) => {
                clearInterval(si);
                if (error) {
                    params.downloat[id].uploat = {error: 'ERROR REQUEST'};
                    bar.tick(bar.total - bar.curr, {title: 'ERROR REQUEST'});
                    return resolve(params);
                }
                params.downloat[id].uploat = typeof body === 'object'
                    ? body
                    : JSON.parse(body);
                bar.tick(bar.total - bar.curr, {title: 'UPLOAT'});
                fs.writeFileSync(path.join(dir, name), JSON.stringify(
                    params.downloat, null, 2));
                return resolve(params);
            });
            let si = setInterval(() => {
                bar.tick(load, {
                    title: file.name
                        ? file.name
                        : 'SERVER CONNECTION'
                });
                if (percent !== previous) {
                    previous = percent;
                    params.downloat[id].uploat = {percent: percent};
                    fs.writeFileSync(path.join(dir, name), JSON.stringify(
                        params.downloat, null, 2));
                } else {
                    disable++;
                    if (disable >= 7200) {
                        clearInterval(si);
                        params.downloat[id].uploat = {error: 'NO CONNECTION'};
                        bar.tick(0, {title: 'NO CONNECTION'});
                        fs.writeFileSync(path.join(dir, name), JSON.stringify(
                            params.downloat, null, 2));
                        return resolve(params);
                    }
                }
                percent = parseInt((r.req.connection._bytesDispatched * 100 / size).toFixed(0)) > 0
                    ? parseInt((r.req.connection._bytesDispatched * 100 / size).toFixed(0))
                    : 0;
                load = percent - bar.curr - 0.05 > 0
                    ? percent - bar.curr - 0.05
                    : 0;
            }, 500);
        });

    };

    return Promise.resolve(params)
        .then(params => {
            return params.downloat && !params.downloat.error && params.downloat.length
                ? params.downloat.reduce((p, file, id) => {
                    return p.then(() => uploat(params, id))
                }, Promise.resolve())
                : params
        });

};