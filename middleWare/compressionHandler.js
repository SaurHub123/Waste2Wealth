const compression = require("compression");

const compressionHandler = compression({
    level: 6,
    threshold: 100 * 1000,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            // Do not apply compression if 'x-no-compression' header is present
            return false;
        } else {
            // Apply compression using the default filter function
            return compression.filter(req, res);
        }
    }
});


module.exports = compressionHandler;