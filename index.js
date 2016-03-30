const regex = { cleanWhitespace: /\s+/gi, removeCode: /```(.*?)```/gm };
const supportedLanguages = ['Markdown', 'Text'];

function getGistHashFromUrl () {
	const path = window.location.pathname.split('/');

	if (path[path.length - 1] !== 'edit') {
		return path[path.length - 1];
	}
	else return;
}

function getWordCount (text, type) {
	text = text.trim();

	if (type === 'words') {
		return text
			.replace(regex.cleanWhitespace, ' ')
			.replace(regex.removeCode, '')
			.split(' ').length;
	}
	else if (type === 'characters') {
		return text
			.replace(regex.cleanWhitespace, '')
			.replace(regex.removeCode, '')
			.length;
	}
	else return text.length;
}

function createWordCountInfo (text) {
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
	const wordCountElement = createWordCountInfo(file.content);
	const gistContent = document.querySelector(
		`.gist-content .file-box:nth-of-type(${++index + 1})`
	);
	const gistElement = gistContent.querySelector('.file-info');;

	gistElement.appendChild(wordCountElement);
}

function scanFiles (files) {
	Object.keys(files).forEach((key, index) => {
		const file = files[key];
		if (supportedLanguages.includes(file.language)) {
			addWordCountInfo(file, index);
		}
	});
}

fetch(`https://api.github.com/gists/${getGistHashFromUrl()}`, { method: 'GET' })
	.then(response => response.json())
	.then(json => scanFiles(json.files))
	.catch(error => console.warn(error));
