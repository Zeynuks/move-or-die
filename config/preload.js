const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const env = process.env.NODE_ENV || 'production';
const configPath = path.join(__dirname, 'packages', `${env}.yaml`);

const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

module.exports = config;
