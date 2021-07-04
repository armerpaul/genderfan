const fs = require('fs')
const canvas = require('canvas')
const Color = require('color')

const IMG_SIZE = {
	WIDTH: 1200,
	HEIGHT: 600,
}
const COLOR = {
	MALE: Color('rgb(0, 140, 255)'),
	FEMALE: Color('rgb(255, 0, 140)'),
}
const RADIUS_SIZES = [0.71, 0.57, 0.43, 0.29, 0.15]
// SEGMENTS_PER_ROW: [1, 9, 13, 17, 21],
const PADDING = 0.15

const createImage = ({ r, t }) => {
	const genderColor = COLOR.MALE.mix(COLOR.FEMALE, t).lighten(1 - r)
	const cvs = canvas.createCanvas(IMG_SIZE.WIDTH, IMG_SIZE.HEIGHT)
	const ctx = cvs.getContext('2d')

	// ctx.fillStyle = 'rgb(200, 0, 0)';
	ctx.fillStyle = genderColor.rgb().string()
	ctx.fillRect(0, 0, IMG_SIZE.WIDTH, IMG_SIZE.HEIGHT)
	ctx.lineCap = 'round'

	ctx.lineWidth = '50'
	RADIUS_SIZES.map((size, index) => {
		const padding = (1 - size) / 2
		const genderGradient = ctx.createLinearGradient(
			IMG_SIZE.WIDTH * padding, 0,
			IMG_SIZE.WIDTH * (size + padding), 0
		)
		const lightenAmount = index / 1.5 / RADIUS_SIZES.length + 0.3
		genderGradient.addColorStop(0, COLOR.FEMALE.lighten(lightenAmount).rgb().string())
		genderGradient.addColorStop(1, COLOR.MALE.lighten(lightenAmount).rgb().string())

		ctx.strokeStyle = Color('#dedede').fade(lightenAmount).string()//genderGradient
		ctx.beginPath()
		ctx.ellipse(
			IMG_SIZE.HEIGHT, IMG_SIZE.HEIGHT * (1 - PADDING),
			IMG_SIZE.HEIGHT * size, IMG_SIZE.HEIGHT * size,
			Math.PI,
			0, Math.PI
		)
		ctx.stroke()
	})

	ctx.lineWidth = '76'
	ctx.strokeStyle = Color('#fff').string()
	const paddingRadius = IMG_SIZE.HEIGHT * (1 - 2 * PADDING)
	const paddingPX = IMG_SIZE.HEIGHT * PADDING
	ctx.beginPath()
  ctx.moveTo(IMG_SIZE.HEIGHT, IMG_SIZE.HEIGHT * (1 - PADDING))
  ctx.lineTo(
		(r - PADDING) * IMG_SIZE.HEIGHT * Math.cos(t * Math.PI) + IMG_SIZE.HEIGHT,
		IMG_SIZE.HEIGHT - (r - PADDING) * IMG_SIZE.HEIGHT * Math.sin(t * Math.PI) - paddingPX
	)
  ctx.stroke()

	const buffer = cvs.toBuffer("image/png")
	fs.writeFileSync("./test.png", buffer)
}

RADIUS_SIZES
createImage({ r: 0.5, t: 0.94 })
