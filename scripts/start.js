const http = require('http')
const fs = require('fs')
const sass = require('sass')

const regex = {
  css: /.*\.css$/,
  img: /.*\.png|jpg|svg$/
}
const port = process.env.PORT || 6969
const SRC_DIR = './src/'
const BUILD_DIR = './build/'
const SASS_DIR = `${SRC_DIR}sass/`
const CSS_OUTPUT = `${BUILD_DIR}styles.css`

const server = http.createServer((req, res) => {
  let filePath
  let contentType

  if (regex.img.test(req.url)) {
    filePath = `${SRC_DIR}${req.url}`
    contentType = 'image'
  } else if (regex.css.test(req.url)) {
    filePath = CSS_OUTPUT
    contentType = 'text/css'
  } else {
		filePath = `${SRC_DIR}index.html`
  	contentType = 'text/html'
	}

  console.log(`serving ${filePath} for ${req.url}`)
  res.writeHead(200, { 'content-type': contentType })
  fs.createReadStream(filePath).pipe(res)
})
server.listen(port)
console.log(`👂 Now serving at port ${port}`)

fs.watch(SASS_DIR, (eventType, filePath) => {
  result = sass.renderSync({
		file: `${SASS_DIR}index.scss`,
	})
	fs.writeFileSync(CSS_OUTPUT, result.css.toString())
	console.log(`🎨 Re-rendering styles (${filePath} file ${eventType})`)
});