(() => {
	const male = { r: 0, g: 183, b: 255 }
	const female = { r: 255, g: 0, b: 183 }

	const root = document.documentElement
	const fan = document.querySelector('#fan')
	let isMouseDown = false

	const interpolateGenderChannel = ({ color, t, r }) => {
		const c = t * female[color] + (1 - t) * male[color]
		return (255 - c) * (1 - r) + c
	}

	const mouseMove = event => {
		const left = event.clientX - fan.offsetLeft
		const top = event.clientY - fan.offsetTop
		const pointer = document.querySelector('#pointer')

		const x = (left - (fan.clientWidth / 2)) / (fan.clientWidth / 2)
		const y = (fan.clientHeight - top) / fan.clientHeight

		const r = Math.sqrt(x * x + y * y) * 0.75
		const t = Math.atan2(y, x) / Math.PI

		const color = {
			r: interpolateGenderChannel({ color: 'r', t, r }),
			g: interpolateGenderChannel({ color: 'g', t, r }),
			b: interpolateGenderChannel({ color: 'b', t, r }),
		}

		root.style.setProperty(
			'--gender',
			`rgb(${color.r}, ${color.g}, ${color.b})`
		);

		pointer.style.display = 'block'
		pointer.style.top = `${top}px`
		pointer.style.left = `${left}px`
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

	console.log(fan)
})()
