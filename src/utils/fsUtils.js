const fs = require('fs').promises;

 const readData = async (path) => {
    try {
        const data = await fs.readFile(path);
        return JSON.parse(data);
    } catch (err) {
       console.error(`Arquivo não pôde ser lido: ${error}`);
    }
 };

 module.exports = readData;