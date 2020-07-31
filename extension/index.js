'use strict'

const config = {
	api: 'https://api.github.com/gists',
	supported: ['Markdown', 'Text'],
}

function isGistOverviewPage() {
	return document.querySelectorAll('.file-box .file-header').length > 0
}

function getStringCount(type, text) {
	text = text.trim()
	const clearWhitespace = /\s+/gi
	const removeMarkdownCode = /```(.*?)```/gm

	if (type === 'words' || type === 'characters') {
		text = text.replace(clearWhitespace, ' ').replace(removeMarkdownCode, '')

		if (type === 'words') {
			text = text.split(' ')
		}
	}

	return text.length
}

function createWordCountElement(text) {
	const words = getStringCount('words', text)
	const characters = getStringCount('characters', text)
	const textNode = document.createTextNode(
		`(Words: ${words}, Characters: ${characters})`
	)
	const element = document.createElement('span')

	element.appendChild(textNode)
	element.style.cssText = 'color:rgba(0,0,0,0.5)'

	return element
}

function addWordCountInfo(file, index) {
	const wordCountElement = createWordCountElement(file.content)
	const gistContent = document.querySelector(
		`.gist-content .file-box:nth-of-type(${index})`
	)

	gistContent?.querySelector('.file-info').appendChild(wordCountElement)
}
/*
 * =========================================================================== *
 * INITIALISE EXTENSION
 * =========================================================================== *
 */
;(async () => {
	if (!isGistOverviewPage()) return

	const path = window.location.pathname.split('/')
	const gist = path[path.length - 1]
	const previous = JSON.parse(localStorage.getItem('gist-ext-last-storage'))

	try {
		const response = await fetch(`${config.api}/${gist}`, {
			headers:
				previous?.id === gist
					? new Headers({
							'If-Modified-Since': localStorage.getItem(
								'gist-ext-last-modified'
							),
					  })
					: {},
		})

		if (response.status !== 404) {
			localStorage.setItem(
				'gist-ext-last-modified',
				response.headers.get('Last-Modified')
			)
		}

		const json = response.status === 200 ? await response.json() : previous
		if (!json) return

		localStorage.setItem('gist-ext-last-storage', JSON.stringify(json))

		Object.keys(json.files).forEach((key, index) => {
			const file = json.files[key]
			if (config.supported.includes(file.language)) {
				addWordCountInfo(file, index + 1)
			}
		})
	} catch (error) {
		console.log('Gist Count: Error occured while reading files!')
		console.error(error)
	}
})()
