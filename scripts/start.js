const http = require('http')
const fs = require('fs')
const sass = require('sass')
const mustache = require('mustache')

const regex = {
  js: /.*\.js$/,
  css: /.*\.css$/,
  img: /.*\.png|jpg|svg$/
}
const port = process.env.PORT || 6969
const SRC_DIR = './src/'
const BUILD_DIR = './build/'
const SASS_DIR = `${SRC_DIR}sass/`
const SASS_INDEX = `${SASS_DIR}index.scss`
const CSS_OUTPUT = `${BUILD_DIR}styles.css`
const MUSTACHE_DIR = `${SRC_DIR}mustache/`
const MUSTACHE_INDEX = `${MUSTACHE_DIR}index.mustache`
const HTML_OUTPUT = `${BUILD_DIR}index.html`
const MUSTACHE_TEMPLATE_DATA = {}

const server = http.createServer((req, res) => {
  let filePath
  let contentType

  if (regex.js.test(req.url)) {
    filePath = `${SRC_DIR}${req.url}`
    contentType = 'text/javascript'
  } else if (regex.img.test(req.url)) {
    filePath = `${SRC_DIR}${req.url}`
    contentType = 'image'
  } else if (regex.css.test(req.url)) {
    filePath = CSS_OUTPUT
    contentType = 'text/css'
  } else {
		filePath = HTML_OUTPUT
  	contentType = 'text/html'
	}

  console.log(`serving ${filePath} for ${req.url}`)
  res.writeHead(200, { 'content-type': contentType })
  fs.createReadStream(filePath).pipe(res)
})
server.listen(port)
console.log(`👂 Now serving at port ${port}`)

const watchDir = ({ render, dir, type }) => {
	fs.watch(dir, (eventType, filePath) => {
		console.log(`${filePath} file ${eventType}`)
		try {
			render()
		} catch (e) {
			console.error(`⚠️ Error compiling ${type}`, e)
		}
	});
	render()
	console.log(`👁 Now watching ${type} in ${dir}`)
}

// WATCH SASS STYLES
watchDir({
	type: 'styles',
	dir: SASS_DIR,
	render: () => {
		result = sass.renderSync({ file: SASS_INDEX })
		fs.writeFileSync(CSS_OUTPUT, result.css.toString())
		console.log(`🎨 Re-rendered styles to ${CSS_OUTPUT}`)
	}
})

// WATCH MUSTACHE TEMPLATE
watchDir({
	type: 'html',
	dir: MUSTACHE_DIR,
	render: () => {
		const template = fs.readFileSync(MUSTACHE_INDEX, 'utf8')
		const rendered = mustache.render(template, MUSTACHE_TEMPLATE_DATA);
		fs.writeFileSync(HTML_OUTPUT, rendered)
		console.log(`📝 Re-rendered html to ${HTML_OUTPUT}`)
	}
})