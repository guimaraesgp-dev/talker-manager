const fs = require('fs').promises;

 const readData = async (path) => {
    try {
        const data = await fs.readFile(path);
        return JSON.parse(data);
    } catch (e) {
       console.error(`Arquivo não pôde ser lido: ${e}`);
    }
 };

module.exports = readData;
