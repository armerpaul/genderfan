(() => {
	const CONFIG = {
		COLOR: {
			MALE: { r: 0, g: 140, b: 255 },
			FEMALE: { r: 255, g: 0, b: 140 },
		},
		FAN: {
			DARKNESS_THRESHOLD: 0.4,
			SEGMENTS_PER_ROW: [1, 9, 13, 17, 21],
			SELECTED_CLASS: 'selected',
			STROKE_FADE: 1.3,
			DARK_TEXT_VAR: 'dark-text',
			LIGHT_TEXT_VAR: 'light-text',
		}
	}

	const fan = document.querySelector('#fan')
	const root = document.documentElement

	fan.setAttribute('viewBox', `0 0 ${fan.clientWidth} ${fan.clientHeight}`)
	/*
		Ranges for polar coordinates:
		[male] 0 < t < 1 [female]
		[agender] 0 < r < 1 [full-gender]
	*/
	const rMaxPx = fan.clientHeight
	const polarToTopLeft = ({ r, t }) => ({
		left: rMaxPx * (r * Math.cos(t * Math.PI) + 1),
		top: rMaxPx * (1 - r * Math.sin(t * Math.PI)),
	})

	const interpolateGenderChannel = ({ color, t, r }) => {
		const c = t * CONFIG.COLOR.FEMALE[color] + (1 - t) * CONFIG.COLOR.MALE[color]
		return (255 - c) * (1 - r) + c
	}

	const rows = CONFIG.FAN.SEGMENTS_PER_ROW.map((segmentsPerRow, rowIndex) => {
		const segments = []
		for (let s = 0; s < segmentsPerRow; s++) {
			const radiusPlus = (mod = 0) => (rowIndex + mod) * 0.85 / CONFIG.FAN.SEGMENTS_PER_ROW.length
			const thetaPlus = (mod = 0) => (s + mod) / segmentsPerRow

			if (segmentsPerRow === 1) {
				const anchor1 = polarToTopLeft({ r: radiusPlus(1), t: 0 })
				const anchor2 = polarToTopLeft({ r: radiusPlus(1), t: 1 })
				const radiusPx = radiusPlus(1.3) * rMaxPx
				segments.push({
					isCircle: true,
					rAvg: radiusPlus(1),
					tAvg: thetaPlus(0.5),
					anchor1,
					anchor2,
					control1: {
						left: anchor1.left,
						top: anchor1.top - radiusPx,
					},
					control2: {
						left: anchor2.left,
						top: anchor2.top - radiusPx,
					},
				})
			}
			else {
				segments.push({
					rAvg: radiusPlus(1),
					tAvg: thetaPlus(0.5),
						rayRight: {
							start: polarToTopLeft({
								r: radiusPlus(-0.5),
								t: thetaPlus(),
							}),
							end: polarToTopLeft({
								r: radiusPlus(1),
								t: thetaPlus(),
							}),
						},
						rayMiddle: {
							start: polarToTopLeft({
								r: radiusPlus(-0.5),
								t: thetaPlus(0.5),
							}),
							end: polarToTopLeft({
								r: radiusPlus(1.5),
								t: thetaPlus(0.5),
							}),
						},
						rayLeft: {
							start: polarToTopLeft({
								r: radiusPlus(-0.5),
								t: thetaPlus(1),
							}),
							end: polarToTopLeft({
								r: radiusPlus(1),
								t: thetaPlus(1),
							}),
						},
					})
			}
		}
		return segments
	})

	let isDragging = false
	fan.onmousedown = () => { isDragging = true }
	fan.onmouseup = () => { isDragging = false }
	fan.onmouseleave = () => { isDragging = false }

	rows.reverse().forEach(segments => {
		segments.forEach(segment => {
			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
			if (segment.isCircle) {
				path.setAttributeNS(
					null,
					'd',
					`M ${segment.anchor1.left} ${segment.anchor1.top}` +
						`C ${segment.control1.left} ${segment.control1.top} ` +
							`${segment.control2.left} ${segment.control2.top} ` +
							`${segment.anchor2.left} ${segment.anchor2.top} ` +
						'Z'
				)
				path.setAttributeNS(null, 'style', `transform-origin: ${rMaxPx}px ${rMaxPx}px`)
			}
			else {
				path.setAttributeNS(
					null,
					'd',
					`M ${segment.rayLeft.start.left} ${segment.rayLeft.start.top} ` +
						`L ${segment.rayMiddle.start.left} ${segment.rayMiddle.start.top} ` +
						`L ${segment.rayRight.start.left} ${segment.rayRight.start.top} ` +
						`C ${segment.rayRight.end.left} ${segment.rayRight.end.top} ` +
							`${segment.rayRight.end.left} ${segment.rayRight.end.top} ` +
							`${segment.rayMiddle.end.left} ${segment.rayMiddle.end.top} ` +
						`C ${segment.rayLeft.end.left} ${segment.rayLeft.end.top} ` +
							`${segment.rayLeft.end.left} ${segment.rayLeft.end.top} ` +
							`${segment.rayLeft.start.left} ${segment.rayLeft.start.top} ` +
						'Z'
					)
				path.setAttributeNS(
					null,
					'style',
					`transform-origin: ${segment.rayMiddle.start.left}px ${segment.rayMiddle.start.top}px`
				)
			}

			const color = {
				r: interpolateGenderChannel({ color: 'r', t: segment.tAvg, r: segment.rAvg }),
				g: interpolateGenderChannel({ color: 'g', t: segment.tAvg, r: segment.rAvg }),
				b: interpolateGenderChannel({ color: 'b', t: segment.tAvg, r: segment.rAvg }),
			}
			const rgb = `rgb(${color.r}, ${color.g}, ${color.b})`
			const strokeRgb = `rgb(` +
				`${color.r * CONFIG.FAN.STROKE_FADE}, ` +
				`${color.g * CONFIG.FAN.STROKE_FADE}, ` +
				`${color.b * CONFIG.FAN.STROKE_FADE})`
			path.setAttributeNS(null, 'fill', rgb)
			path.setAttributeNS(null, 'stroke', strokeRgb)

			const select = () => {
				document.querySelectorAll('path, circle').forEach(
					elem => elem.classList.remove(CONFIG.FAN.SELECTED_CLASS)
				)
				path.classList.add(CONFIG.FAN.SELECTED_CLASS)
				root.style.setProperty('--gender', rgb)
				root.style.setProperty(
					'--text',
					`var(--${segment.rAvg < CONFIG.FAN.DARKNESS_THRESHOLD
						? CONFIG.FAN.DARK_TEXT_VAR
						: CONFIG.FAN.LIGHT_TEXT_VAR})`
				)
			}
			path.onmousedown = select
			path.onmousemove = () => {
				if (isDragging) {
					select()
				}
			}

			fan.appendChild(path)
		})
	})
})()
