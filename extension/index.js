'use strict';

/*
 * =========================================================================== *
 * CONFIGURATION
 * =========================================================================== *
 */
const SUPPORTED = [
	'Markdown',
	'Text'
];
const REGEX = {
	clearWhitespace: /\s+/gi,
	removeMarkdownCode: /```(.*?)```/gm
};

/*
 * =========================================================================== *
 * ALL THE FUNCTIONALITY
 * =========================================================================== *
 */
function isGistOverviewPage () {
	return document.querySelectorAll('.file-box .file-header').length > 0;
}

function getGistIDFromUrl () {
	const path = window.location.pathname.split('/');
	return path[path.length - 1];
}

function requestGitHubAPI () {
	const previous = JSON.parse(localStorage.getItem('gist-ext-last-storage'));
	const config = { method: 'GET' };

	if (previous && previous.id === getGistIDFromUrl()) {
		config.headers = new Headers({
			'If-Modified-Since': localStorage.getItem('gist-ext-last-modified')
		});
	}

	return new Request(
		`https://api.github.com/gists/${getGistIDFromUrl()}`,
		config
	);
}

function getStringCount (type, text) {
	text = text.trim();
	const { clearWhitespace, removeMarkdownCode } = REGEX;

	if (type === 'words' || type === 'characters') {
		text = text.replace(clearWhitespace, ' ')
					.replace(removeMarkdownCode, '');

		if (type === 'words') {
			text = text.split(' ');
		}
	}

	return text.length;
}

function createWordCountElement (text) {
	const words = getStringCount('words', text);
	const characters = getStringCount('characters', text);
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
	const gistElement = gistContent.querySelector('.file-info');

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

/*
 * =========================================================================== *
 * INITIALISE EXTENSION
 * =========================================================================== *
 */
if (isGistOverviewPage()) {
	const previous = JSON.parse(localStorage.getItem('gist-ext-last-storage'));

	fetch(requestGitHubAPI())
		.then(response => {
			if (response.status !== 404) {
				localStorage.setItem(
					'gist-ext-last-modified',
					response.headers.get('Last-Modified')
				);

				return (response.status === 200) ? response.json() : previous;
			}
		})
		.then(json => {
			if (json) {
				localStorage.setItem('gist-ext-last-storage', JSON.stringify(json));
				return scanFiles(json.files);
			}
		})
		.catch(error => console.warn(error));
}