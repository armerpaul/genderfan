(() => {
	const male = { r: 0, g: 140, b: 255 }
	const female = { r: 255, g: 0, b: 140 }

	const root = document.documentElement
	const fan = document.querySelector('#fan')
	const pointer = document.querySelector('#pointer')

	let isMouseDown = false

	const interpolateGenderChannel = ({ color, t, r }) => {
		const c = t * female[color] + (1 - t) * male[color]
		return (255 - c) * (1 - r) + c
	}
	const capValue = value => Math.max(Math.min(value, 1), 0)

	const mouseMove = event => {
		const left = event.clientX - fan.offsetLeft
		const top = event.clientY - fan.offsetTop

		// fan is assumed to be a 2x1 box, so height = width / 2
		const x = (left - (fan.clientWidth / 2)) / fan.clientHeight
		const y = (fan.clientHeight - top) / fan.clientHeight

		const r = capValue(Math.sqrt(x * x + y * y))
		const t = capValue(Math.atan2(y, x) / Math.PI)

		const color = {
			r: interpolateGenderChannel({ color: 'r', t, r }),
			g: interpolateGenderChannel({ color: 'g', t, r }),
			b: interpolateGenderChannel({ color: 'b', t, r }),
		}

		root.style.setProperty(
			'--gender',
			`rgb(${color.r}, ${color.g}, ${color.b})`
		);

		const rExt = r + 0.125
		const cappedLeft = fan.clientHeight * (rExt * Math.cos(t * Math.PI) + 1)
		const cappedTop = fan.clientHeight * (1 - rExt * Math.sin(t * Math.PI))

		pointer.style.display = 'block'
		pointer.style.transform = `rotate(${(1 - t) * 180 - 90}deg)`
		pointer.style.top = `${cappedTop}px`
		pointer.style.left = `${cappedLeft}px`
	}
	fan.onmousedown = event => {
		isMouseDown = true
		mouseMove(event)
	}
	fan.onmousemove = event => {
		if (isMouseDown) {
			mouseMove(event)
		}
	}
	fan.onmouseup = event => {
		isMouseDown = false
	}
})()
