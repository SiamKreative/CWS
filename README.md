## Getting Started
Simply run `npm install && gulp && gulp serve`. You need to have [Node.js](https://nodejs.org/en/) installed, as well as [gulp.js](http://gulpjs.com/).

If you made changes, commit then and then run `git push origin master && deploy.sh` to push to the master branch and deploy to [http://coworking-spaces.siamkreative.com/](http://coworking-spaces.siamkreative.com/). You need to be listed as a collaborator to be able to deploy ([read more](https://surge.sh/help/adding-collaborators)).

### What details we fill out
1. Name
2. Price
3. Website (if not provided)
4. Location (Google Place ID)
5. Facebook (Facebook Page ID)

### What we fetch
* Google Place ID
	- [x] Address
	- [x] Phone
	- [x] Hours
	- [x] Directions
	- [ ] Photos
	- [ ] Reviews
* Facebook Page ID
	- [x] Likes (incl. Friends who like this page)
	- [x] Cover Photo
	- [ ] Website
	- [ ] Page feed