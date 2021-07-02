;(() => {
	const fan = document.querySelector('#fan')
	let isMouseDown = false

	const mouseMove = event => {
		const left = event.clientX - fan.offsetLeft
		const top = event.clientY - fan.offsetTop
		const pointer = document.querySelector('#pointer')

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
