"use strict";
//////// CONSTANTS ////////
var timeBIG = 10; // time between 10 requests
var timeSmall = 10; // time at each request not cointing 10th
var fileToGrabFrom = "fileToTranslate"; // only filename cause its grabbing only xml
var fileOutputName = "OutputFile.txt";
var stopPer = 10;
//////// CONSTANTS ////////

//////// INCLUDES ////////
const fs = require("fs");
const jsonxml = require("jsontoxml");
var parser = require("fast-xml-parser");
var he = require("he");

//////// NOT CHANGABLE VARS ////////
var i = 1;
var CountedAllItems = 0;
let xmlData = fs.readFileSync(fileToGrabFrom + ".xml", "utf8");
var options = {
  attributeNamePrefix: "@_",
  attrNodeName: "attr", //default is 'false'
  textNodeName: "#text",
  ignoreAttributes: true,
  ignoreNameSpace: false,
  allowBooleanAttributes: false,
  parseNodeValue: true,
  parseAttributeValue: false,
  trimValues: true,
  cdataTagName: "__cdata", //default is 'false'
  cdataPositionChar: "\\c",
  localeRange: "", //To support non english character in tag/attribute values.
  parseTrueNumberOnly: false,
  attrValueProcessor: (a) => he.decode(a, { isAttributeValue: true }), //default is a=>a
  tagValueProcessor: (a) => he.decode(a), //default is a=>a
};
if (parser.validate(xmlData) === true) {
  //optional (it'll return an object in case it's not valid)
  var jsonObj = parser.parse(xmlData, options);
}
// Intermediate obj
var tObj = parser.getTraversalObj(xmlData, options);
var jsonObj = parser.convertToJson(tObj, options);

//////// FUNCTIONS ////////
async function separator() {
  // separates translated rows
  console.log("----------------------------------");
}
// sleep for x time
async function sleep(ms) {
  // Sleep function
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
// wait to not spam API too much
async function wait_func(count) {
  // wait displayer
  if (i >= stopPer) {
    console.log("> Waiting " + timeBIG / 1000 + " second[s]...");
    await sleep(timeBIG);
    console.log("> [" + count + "/" + CountedAllItems + "]");
    i = 1;
  } else {
    console.log("Waiting " + timeSmall / 1000 + " second[s]...");
    await sleep(timeSmall);
    console.log("> [" + count + "/" + CountedAllItems + "]");
    i++;
  }
}
// API to translate strings
async function TranslateString(string, projectId) {
  // String translate using google API you need GOOGLE_APPLICATION_CREDENTIALS setted b4 use
  console.log("Translated from: ", string);
  const { Translate } = require("@google-cloud/translate");
  const translate = new Translate({ projectId });
  const [translation] = await translate.translate(string, "pl");
  console.log("Translated to  : ", translation);
  return translation;
}
function DeepSearchCount(ObjectToSearch, index){
  if (typeof ObjectToSearch == "string") {
    index++;
  }
  if (typeof ObjectToSearch == "object") {
    for (let DeepItem in ObjectToSearch) {
      DeepSearchCount(ObjectToSearch[DeepItem], index)
    }
  }
}
// calculate the amount of objects to translate
function CalcMaxElementsToTranslate(arrayed) {
  // calculate max elements to translate returning integer
  let index = 0;
  for (let item of arrayed) {
    for (let key in item) {
      DeepSearchCount(item[key], index)
    }
  }
  console.log("Found " + index + " objects to translate")
  return index;
}
async function DeepSearch(ObjectToSearch, count, projectId){
    if (typeof ObjectToSearch == "string") {
      ObjectToSearch = await TranslateString(ObjectToSearch, projectId);
      await wait_func(count);
      await separator();
      count++;
      continue;
    }
    // if its not a string then use recursive search into the xml file variables
    if (typeof ObjectToSearch == "object") {
      for (let DeepItem in ObjectToSearch) {
        await DeepSearch(ObjectToSearch[DeepItem], count, projectId);
      }
    }
}

// Ask for translation using deep search
async function LoopThroughThings(arrayed, projectId, CountedAllItems) {
  // main item looper
  let count = 0;
  for (let item of arrayed) {
    try {
      for (let key in item) {
        await DeepSearch(item[key], count, projectId);
      }
    } catch (e) {
      console.log(e);
      continue;
    }
  }
  return arrayed;
}

// process translation
async function process(arrayed, projectId) {
  // main asynchronious function
  CountedAllItems = CalcMaxElementsToTranslate(arrayed);
  console.log(">Starting Process... All items to translate: " + CountedAllItems);
  arrayed = await LoopThroughThings(arrayed, projectId, CountedAllItems);
  console.log(">Finishing Process...");
  jsonObj.LocaleResources.Module = arrayed;
  fs.writeFileSync(fileOutputName, JSON.stringify(jsonObj));
}
// main function
async function main(projectId = "translateapi-000000") {
  process(jsonObj.LocaleResources.Module, projectId);
}

main().catch(console.error); //code inicializer

//
