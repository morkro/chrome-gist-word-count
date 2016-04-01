'use strict';

/**
 * Configuration
 */
const SUPPORTED = ['Markdown', 'Text'];
const REGEX = {
	clearWhitespace: /\s+/gi,
	removeMarkdownCode: /```(.*?)```/gm
};
const REQUEST = new Request(`https://api.github.com/gists/${getGistHashFromUrl()}`, {
	method: 'GET',
	headers: new Headers({
		'If-Modified-Since': localStorage.getItem('gist-ext-last-modified') || ''
	})
});

/**
 * Initialise GitHub API
 */
fetch(REQUEST)
	.then(response => {
		if (response.status !== 404) {
			localStorage.setItem('gist-ext-last-modified', response.headers.get('Last-Modified'));

			if (response.status === 200) {
				return response.json();
			}
			else {
				return JSON.parse(localStorage.getItem('gist-ext-last-storage'));
			}
		}
	})
	.then(json => {
		if (json || json !== undefined) {
			localStorage.setItem('gist-ext-last-storage', JSON.stringify(json));
			return scanFiles(json.files);
		}
	})
	.catch(error => console.warn(error));

/**
 * Doing the magic
 */
function getGistHashFromUrl () {
	const path = window.location.pathname.split('/');
	return path[path.length - 1];
}

function getWordCount (text, type) {
	text = text.trim();

	if (type === 'words') {
		return text
			.replace(REGEX.clearWhitespace, ' ')
			.replace(REGEX.removeMarkdownCode, '')
			.split(' ').length;
	}
	else if (type === 'characters') {
		return text
			.replace(REGEX.clearWhitespace, '')
			.replace(REGEX.removeMarkdownCode, '')
			.length;
	}
	else return text.length;
}

function createWordCountElement (text) {
	const words = getWordCount(text, 'words');
	const characters = getWordCount(text, 'characters');
	const textNode = document.createTextNode(
		`(Words: ${words}, Characters: ${characters})`
	);
	const element = document.createElement('span');

	element.appendChild(textNode);
	element.style.cssText = 'color:rgba(0,0,0,0.5)';

	return element;
}

function addWordCountInfo (file, index) {
	const wordCountElement = createWordCountElement(file.content);
	const gistContent = document.querySelector(
		`.gist-content .file-box:nth-of-type(${++index + 1})`
	);
	const gistElement = gistContent.querySelector('.file-info');;

	gistElement.appendChild(wordCountElement);
}

function scanFiles (files) {
	Object.keys(files).forEach((key, index) => {
		const file = files[key];
		if (SUPPORTED.includes(file.language)) {
			addWordCountInfo(file, index);
		}
	});
}
