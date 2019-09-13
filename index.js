'use strict';
//////// CONSTANTS ////////
var timeBIG = 10; // time between 10 requests
var timeSmall = 10; // time at each request not cointing 10th
var fileToGrabFrom = "fileToTranslate"; // only filename cause its grabbing only xml
var fileOutputName = "OutputFile.txt";
var stopPer = 10;
//////// CONSTANTS ////////
//////// INCLUDES AND NOT CHANGABLE VARS ////////
var i = 1;
var CountedAllItems = 0;
const fs = require('fs');
const jsonxml = require('jsontoxml');
var parser = require('fast-xml-parser');
var he = require('he');
let xmlData = fs.readFileSync(fileToGrabFrom + ".xml", "utf8");
var options = {
    attributeNamePrefix : "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName : "#text",
    ignoreAttributes : true,
    ignoreNameSpace : false,
    allowBooleanAttributes : false,
    parseNodeValue : true,
    parseAttributeValue : false,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    localeRange: "", //To support non english character in tag/attribute values.
    parseTrueNumberOnly: false,
    attrValueProcessor: a => he.decode(a, {isAttributeValue: true}),//default is a=>a
    tagValueProcessor : a => he.decode(a) //default is a=>a
};
if( parser.validate(xmlData) === true) 
{ //optional (it'll return an object in case it's not valid)
    var jsonObj = parser.parse(xmlData,options);
}
// Intermediate obj
var tObj = parser.getTraversalObj(xmlData,options);
var jsonObj = parser.convertToJson(tObj,options);
//////// INCLUDES AND NOT CHANGABLE VARS ////////

async function separator()
{ // separates translated rows
	console.log("----------------------------------");
}
//
async function sleep(ms)
{ // Sleep function
	return new Promise(resolve=>{ setTimeout(resolve,ms) });
}
//
async function wait_func(count)
{ // wait displayer
	if(i >= stopPer) {
		console.log("> Waiting "+(timeBIG/1000)+" second[s]...");
		await sleep(timeBIG);
		console.log("> [" + count + "/" + CountedAllItems + "]");
		i = 1;
	} else {
		console.log("Waiting "+(timeSmall/1000)+" second[s]...");
		await sleep(timeSmall);
		console.log("> [" + count + "/" + CountedAllItems + "]");
		i++;
	}
}
//
async function TranslateString(string, projectId)
{ // String translate using google API you need GOOGLE_APPLICATION_CREDENTIALS setted b4 use
		console.log("Translated from: ", string);
	const {Translate} = require('@google-cloud/translate');
	const translate = new Translate({projectId});
	const [translation] = await translate.translate(string, 'pl');
		console.log("Translated to  : ", translation);
	return translation;
}
//
function CalcMaxElementsToTranslate(arrayed)
{ // calculate max elements to translate returning integer
	let index = 0;
	for(let item of arrayed)
	{
		for(let key in item){
			if(typeof item[key] == "string")
				index++;
			if(typeof item[key] == "object"){
				for(let DeepItem in item[key]){
					if(typeof item[key][DeepItem] == "string"){
						index++;
					}
					if(typeof item[key][DeepItem] == "object"){
						for(let DeepItem2 in item[key][DeepItem]){
							if(typeof item[key][DeepItem][DeepItem2] == "string"){
								index++;
							}
							if(typeof item[key][DeepItem][DeepItem2] == "object"){
								for(let DeepItem3 in item[key][DeepItem][DeepItem2]){
									console.log("Deep3 " + typeof item[key][DeepItem][DeepItem2][DeepItem3]);
									if(typeof item[key][DeepItem][DeepItem2][DeepItem3] == "string"){
										index++;
									}
									if(typeof item[key][DeepItem][DeepItem2][DeepItem3] == "object"){
										for(let DeepItem3 in item[key][DeepItem][DeepItem2]){
											console.log("Deep3 " + typeof item[key][DeepItem][DeepItem2][DeepItem3]);
											if(typeof item[key][DeepItem][DeepItem2][DeepItem3] == "string"){
												index++;
											}
											if(typeof item[key][DeepItem][DeepItem2][DeepItem3] == "object"){
												console.log("FUCKIT");
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
	return index;
}
//
async function LoopThroughThings(arrayed, projectId, allItems)
{ // main item looper
	let count = 0;
	for(let item of arrayed)
	{
		try {
			for(let key in item){
				if(typeof item[key] == "string"){
					item[key] = await TranslateString(item[key], projectId);
					await wait_func(count);
					await separator();
					count++;
					continue;
				}
				if(typeof item[key] == "object"){
					for(let DeepItem in item[key]){
						if(typeof item[key][DeepItem] == "string"){
							item[key][DeepItem] = await TranslateString(item[key][DeepItem], projectId);
							await wait_func(count);
							await separator();
							count++;
							continue;
						}
						if(typeof item[key][DeepItem] == "object"){
							for(let DeepItem2 in item[key][DeepItem]){
								if(typeof item[key][DeepItem][DeepItem2] == "string"){
									item[key][DeepItem][DeepItem2] = await TranslateString(item[key][DeepItem][DeepItem2], projectId);
									await wait_func(count);
									await separator();
									count++;
									continue;
								}
								if(typeof item[key][DeepItem][DeepItem2] == "object"){
									for(let DeepItem3 in item[key][DeepItem][DeepItem2]){
										if(typeof item[key][DeepItem][DeepItem2][DeepItem3] == "string"){
											item[key][DeepItem][DeepItem2][DeepItem3] = await TranslateString(item[key][DeepItem][DeepItem2][DeepItem3], projectId);
											await wait_func(count);
											await separator();
											count++;
											continue;
										}
										if(typeof item[key][DeepItem][DeepItem2][DeepItem3] == "object"){
											for(let DeepItem4 in item[key][DeepItem][DeepItem2][DeepItem3]){
												if(typeof item[key][DeepItem][DeepItem2][DeepItem3][DeepItem4] == "string"){
													item[key][DeepItem][DeepItem2][DeepItem3][DeepItem4] = await TranslateString(item[key][DeepItem][DeepItem2][DeepItem3][DeepItem4], projectId);
													await wait_func(count);
													await separator();
													count++;
													continue;
												}
												if(typeof item[key][DeepItem][DeepItem2][DeepItem3] == "object"){
													console.log("FUCKIT - 4th deep object ...");
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		} catch(e) {
			console.log(e); continue;
		}
	}
	return arrayed;
}
//
async function process(arrayed, projectId) 
{ // main asynchronious function
	CountedAllItems = CalcMaxElementsToTranslate(arrayed);
	console.log(">Starting Process... All items to translate: " + CountedAllItems);
	arrayed = await LoopThroughThings(arrayed, projectId, CountedAllItems);
	console.log(">Finishing Process...");
	jsonObj.LocaleResources.Module = arrayed;
	//console.log(jsonObj.LocaleResources.Module);
	fs.writeFileSync(fileOutputName, JSON.stringify(jsonObj));
}
//
async function main(
	projectId = 'translateapi-000000'
) { // main function
	process(jsonObj.LocaleResources.Module, projectId);
}

main().catch(console.error); //code inicializer

//
//
//
//
//
//
//
//