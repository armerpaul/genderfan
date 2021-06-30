# Genderfan

## Run locally
```
npm run start
```

Start up a small server and starts watching styles. Styles from the `src/sass` directory are compiled into a single file. The compiled styles are put into the `build` directory, so they won't infect the git history. The server responds to requests in limited ways:
* `**/*.<img-extensions>`: See `scripts/start.js` for the allowed image types.
* `*.css`: All css requests will be served the same compiled styles from `src/sass/`
* `*`: All other requests are served `src/index.html`

## Deploy
```
npm run deploy
```

Builds the various html pages into the `build` directory, then pushes that to the `build` branch. Github pages serves from the `build` branch.

## TODOS
* [ ] the fan
	* [ ] make the point & click feature
	* [ ] fan design
	* [ ] names (common for section and other)
* [ ] layout the site
* [ ] share functionality
	* [ ] make ~13 social images (3 rows: 5, 5, 3)
	* [ ] UI around fan
	* [ ] the html generation script with social media tags (mustache)
* [ ] Add about section to README
