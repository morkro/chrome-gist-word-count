const supportedLanguages = ['Markdown', 'Text'];

function getGistHashFromUrl () {
	const path = window.location.pathname.split('/');

	if (path[path.length - 1] !== 'edit') {
		return path[path.length - 1];
	}
	else return;
}

function getWordCount (text, type) {
	if (type === 'words') {
		return text.trim()
			.replace(/\s+/gi, ' ')
			.replace(/```(.*?)```/gm, '')
			.split(' ').length;
	}
	else if (type === 'characters') {
		return text.trim().replace(/\s+/gi, '').length;
	}
	else {
		return text.trim().length;
	}
}

function createWordCountInfo (text) {
	const words = getWordCount(text, 'words');
	const characters = getWordCount(text, 'characters');
	const textNode = document.createTextNode(
		`(Words: ${words}, Characters: ${characters})`
	);
	const element = document.createElement('span');
	const CSS = `color:rgba(0,0,0,0.5);`;

	element.appendChild(textNode);
	element.style.cssText = CSS;

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
