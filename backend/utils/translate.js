const fs = require('fs');
const path = require('path');

const keyLabels = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/keyLabels.json'), 'utf8')
);

const sectionsName = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/sections.json'), 'utf8')
);

function translateKey(key){
    let label = keyLabels[key];
    let value = label ? label.value : key;
    return value;
}

function getTypeByKey(key){
    let label = keyLabels[key];
    let value = label ? label.type : key;
    return value;
}

function getSectionName(field){
    let sectionName = sectionsName[field] || null;
    return sectionName;
}

module.exports = { translateKey, getSectionName, getTypeByKey };