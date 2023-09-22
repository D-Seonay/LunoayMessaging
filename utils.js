const { readFileSync } = require('fs');
function serveStaticFile(path, contentType, res) {
    const data = readFileSync(path, 'utf-8');
    res.writeHead(200, { 'Content-Type': contentType });
    res.write(data);
    res.end();
}

function errorMessage(head, content, res) {
    res.writeHead(head);
    res.write(content);
    res.end();
}

module.exports = { serveStaticFile, errorMessage };
