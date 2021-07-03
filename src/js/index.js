(() => {
	const SEGMENTS_PER_ROW = [1, 8, 12, 16, 20]
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

	const male = { r: 0, g: 140, b: 255 }
	const female = { r: 255, g: 0, b: 140 }
	const interpolateGenderChannel = ({ color, t, r }) => {
		const c = t * female[color] + (1 - t) * male[color]
		return (255 - c) * (1 - r) + c
	}

	const SPACING = 0.01
	const rows = SEGMENTS_PER_ROW.map((segmentsPerRow, rowIndex) => {
		const segments = []
		for (let s = 0; s < segmentsPerRow; s++) {
			const start = {
				r: rowIndex / SEGMENTS_PER_ROW.length + SPACING,
				t: s / segmentsPerRow + (SPACING / 4),
			}
			const end = {
				r: (rowIndex + 1) / SEGMENTS_PER_ROW.length,
				t: (s + 1) / segmentsPerRow - (SPACING / 4),
			}

			console.log({ start, end })

			segments.push({
				BR: polarToTopLeft({ r: start.r, t: start.t }),
				BL: polarToTopLeft({ r: start.r, t: end.t }),
				TL: polarToTopLeft({ r: end.r, t: end.t }),
				TR: polarToTopLeft({ r: end.r, t: start.t }),
				tAvg: (end.t + start.t) / 2,
				rAvg: (end.r + start.r) / 2,
				rSmallPx: start.r * rMaxPx,
				rLargePx: end.r * rMaxPx,
			})
		}
		return segments
	})

	const SELECTED = 'selected'
	let isDragging = false
	fan.onmousedown = () => { isDragging = true }
	fan.onmouseup = () => { isDragging = false }
	fan.onmouseleave = () => { isDragging = false }

	rows.forEach(segments => {
		segments.forEach(segment => {
			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
			const pathDescription = `M ${segment.BR.left} ${segment.BR.top
				} A ${segment.rSmallPx} ${segment.rSmallPx} 0 0 0 ${segment.BL.left} ${segment.BL.top
				} L ${segment.TL.left} ${segment.TL.top
				} A ${segment.rLargePx} ${segment.rLargePx} 0 0 1 ${segment.TR.left} ${segment.TR.top
				} Z`
			const color = {
				r: interpolateGenderChannel({ color: 'r', t: segment.tAvg, r: segment.rAvg }),
				g: interpolateGenderChannel({ color: 'g', t: segment.tAvg, r: segment.rAvg }),
				b: interpolateGenderChannel({ color: 'b', t: segment.tAvg, r: segment.rAvg }),
			}
			const rgb = `rgb(${color.r}, ${color.g}, ${color.b})`
			const select = () => {
				document.querySelectorAll('path').forEach(p => p.classList.remove(SELECTED))
				path.classList.add(SELECTED)
				root.style.setProperty('--gender', rgb)
				root.style.setProperty('--text', `var(--${segment.rAvg  < 0.45 ? 'dark' : 'light'}-text)`)
			}
			path.setAttributeNS(null, 'd', pathDescription)
			path.setAttributeNS(null, 'fill', rgb)
			path.onmousedown = select
			path.onmousemove = () => {
				if (isDragging) {
					select()
				}
			}
			// path.setAttributeNS(null, 'stroke', 'black')
			fan.appendChild(path)
		})
	})
})()
