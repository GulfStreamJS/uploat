const follow_redirects = require('follow-redirects');
const Downloading = require('downloading');
const getframe = require('getframe');
const request = require('request');
const path = require('path');
const fs = require('fs');

follow_redirects.maxRedirects = 10;
follow_redirects.maxBodyLength = 500 * 1024 * 1024 * 1024;

module.exports = (params = {}) => {

    let name = params.source
        ? params.source.replace(/[^a-z0-9]/ig, '_').toUpperCase() + '.json'
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
                url: params.oauth.url,
                formData: {
                    ...params.oauth.params,
                    file: fs.createReadStream(path.join(file.path))
                },
                headers: {
                    'Authorization': params.oauth.authorization || '',
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
                let iframe = getframe(params.oauth, body);
                if (!iframe) {
                    params.downloat[id].uploat = {error: 'ERROR IFRAME'};
                    bar.tick(bar.total - bar.curr, {title: 'ERROR IFRAME'});
                    return resolve(params);
                }
                params.video = params.video
                    ? params.video
                    : [];
                let video = {
                    storage: [{
                        iframe: iframe,
                        status: 202,
                        upload: (new Date()).toISOString()
                    }]
                };
                if (params.voice) {
                    video.voice = params.voice;
                }
                if (params.subtitle) {
                    video.subtitle = params.subtitle;
                }
                if (params.quality) {
                    video.quality = params.quality;
                }
                if (params.release) {
                    video.release = params.release;
                }
                if (typeof params.episodes === 'object') {
                    let exists = false;
                    params.episodes.forEach((episode, i) => {
                        if (
                            episode.season === file.season &&
                            episode.episode === file.episode
                        ) {
                            exists = i+1;
                        }
                    });
                    video.name = 'Episode #' +
                        params.episodes[exists-1].season + '.' +
                        params.episodes[exists-1].episode;
                    if (exists) {
                        video = {...video, ...file, ...params.episodes[exists-1]};
                    }
                    else {
                        video = {...video, ...file};
                    }
                }
                else {
                    video.name = (
                        params.name &&
                        !params.imdb_id &&
                        !params.tmdb_id &&
                        !params.kp_id &&
                        !params.douban_id
                    )
                        ? params.name
                        : path.parse(file.file).name.replace(/(\.|_)/g, ' ');
                    video = {...video, ...file};
                }
                params.video.push(video);
                bar.tick(bar.total - bar.curr, {title: 'UPLOAT'});
                fs.writeFileSync(path.join(dir, name), JSON.stringify(
                    params.downloat, null, 2));
                return resolve(params);
            });
            let si = setInterval(() => {
                bar.tick(load, {
                    title: file.file
                        ? file.file
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
                ? params.downloat.filter(file => {
                    if (params.season && params.episode) {
                        if (typeof file.season === 'undefined' ||
                            typeof file.episode === 'undefined') return false;
                        let s = typeof file.season === 'number'
                            ? file.season.toString()
                            : file.season;
                        let e = typeof file.episode === 'number'
                            ? file.episode.toString()
                            : file.episode;
                        if (typeof params.season === 'number') {
                            params.season = params.season.toString();
                        } else if (typeof params.season === 'object') {
                            params.season = params.season.map(season => season
                                .toString()
                                .replace(/[^0-9]/, ''));
                        }
                        if (typeof params.episode === 'number') {
                            params.episode = params.episode.toString();
                        } else if (typeof params.episode === 'object') {
                            params.episode = params.episode.map(episode => episode
                                .toString()
                                .replace(/[^0-9]/, ''));
                        }
                        return ((
                            typeof params.season === 'string' &&
                            params.season === s
                        ) || (
                            typeof params.season === 'object' &&
                            params.season.indexOf(s) + 1
                        )) && ((
                            typeof params.episode === 'string' &&
                            params.episode === e
                        ) || (
                            typeof params.episode === 'object' &&
                            params.episode.indexOf(e) + 1
                        ));
                    }
                    return true;
                }).reduce((p, file, id) => {
                    return p.then(params => uploat(params, id))
                }, Promise.resolve(params))
                : params
        });

};