const bodyParser = (req) => {
    return new Promise((resolve, reject) => {
        let totalData = '';
        req
            .on('data', chunk => {
                totalData += chunk;
            })
            .on('end', () => {
                req.body = JSON.parse(totalData);
                resolve();
            })
            .on('error', err => {
                console.log(err);
                reject();
            })
    })
}

module.exports = {bodyParser};