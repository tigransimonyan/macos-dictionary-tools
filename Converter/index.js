const readline = require('readline');
const fs = require('fs');

async function processLineByLine() {
	const fileStream = fs.createReadStream('./baratian.tab');
	const xml = fs.createWriteStream('./MyDictionary.xml', {});
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity
	});
	xml.write(`<?xml version="1.0" encoding="UTF-8"?>`);
	xml.write(`<d:dictionary xmlns="http://www.w3.org/1999/xhtml" xmlns:d="http://www.apple.com/DTDs/DictionaryService-1.0.rng">`);
	let index = 0;
	for await (const line of rl) {
		const pattern = /(?<a>[^\[]+)(?<b>\[[^[]+\])(?<c>.+)/;

		const { groups } = line.match(pattern);
		const transliteration = groups.b.trim().replace(/\[|\]/g, '');
		const words = groups.a.replace(/\s|\d/g, '');
		const translation = groups.c.trim();

		const values = words.split(',');
		const title = values[0];

		let str = `<d:entry id="${title}-${index}" d:title="${title}">`;
		for (const value of values) {
			str += `<d:index d:value="${value}"/>`;
		}
		str += `<div d:priority="2"><h1>${title}</h1></div>`;
		str += `<span class="syntax">`;
		str += `<span d:pr="US">| ${transliteration} |</span>`;
		str += `</span>`;
		str += `<div>`;
		str += `<ol><li>${translation}</li></ol>`;
		str += `</div>`;
		str += `</d:entry>\n`;
		xml.write(str);
		index++;
	}
	xml.end(`</d:dictionary>`);
}

processLineByLine()
