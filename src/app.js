// Cache selectors
var table = $('#places');
var tbody = $('tbody', table);
var trows = $('tr.google-place-enabled', tbody);
var count = trows.length;

/**
 * Google Places API
 * https://developers.google.com/maps/documentation/javascript/places#place_details
 */

google.maps.event.addDomListener(window, 'load', initMap); // http://stackoverflow.com/a/20302622

function initMap() {

	// Map Parameters (required but not used)
	var map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: -33.866,
			lng: 151.196
		},
		zoom: 15
	});
	var service = new google.maps.places.PlacesService(map);

	// Loop through the table
	trows.each(function (index, el) {

		var tr = $(el);
		var placeId = tr.attr('id');
		placeId = placeId.replace('place_', '');


		/**
		 * Google Places API
		 */
		service.getDetails({
			placeId: placeId
		}, function (place, status) {

			// Check if place is "available"
			if (status === google.maps.places.PlacesServiceStatus.OK) {

				// Save place as global variable (accessible anywhere)
				// window['place_' + place.id] = place;

				// Save it locally in the browser
				if (!localStorage.getItem('place_' + placeId)) {
					localStorage.setItem('place_' + placeId, JSON.stringify(place));
				}

				// Callback after looping through all places
				if (!--count) loopEndCallback();

			}
		});

	});

}

function loopEndCallback() {
	console.log('%cgetDetailCallback()', 'color:green; font-weight:bold');

	// Looping through localStorage | http://stackoverflow.com/a/3138591 | Would be better to create one object per destination not several
	$.each(localStorage, function (key, value) {
		if (key.match('^place_')) {

			// Get the cached data & Parse it
			var place = JSON.parse(value);
			var tr = $('#' + key, tbody);
			var facebookId = tr.attr('data-facebookId');

			console.log(place);

			/**
			 * Populate the table
			 * 1) Table row must be empty
			 * 2) Make sure that the Google Place data property exists
			 * 3) Use switch case might be more efficient
			 */
			if (!tr.is(':empty')) {
				tr.find('.place-facebook').html('<a target="_blank" href="//facebook.com/' + facebookId + '">Facebook</a>');
				tr.find('.place-name').html(place.name);
				tr.find('.place-location').html('<div class="btn-group" role="group" aria-label="..."><button type="button" class="btn btn-default hint-top-s-big hint-anim" data-hint="' + place.formatted_address + '">View address</button><a target="_blank" href="https://www.google.com/maps/dir/Current+Location/' + place.formatted_address.replace(/ /g, '+') + '" class="btn btn-default"><span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span> Locate</a></div>');

				if (place.hasOwnProperty('international_phone_number') && place.hasOwnProperty('formatted_phone_number')) {
					tr.find('.place-phone').html('<a href="tel:' + place.international_phone_number.replace(/\s+/g, '') + '">' + place.formatted_phone_number + '</a>');
				}
				if (place.hasOwnProperty('website')) {
					tr.find('.place-website').html('<a target="_blank" href="' + place.website + '">' + place.website + '</a>');
				}
				if (place.hasOwnProperty('opening_hours') && !tr.is(':empty')) {
					var open_now;
					if (place.opening_hours.open_now) {
						open_now = '<span class="text-success">Open Now!</span>';
					} else {
						open_now = '<span class="text-danger">Currently closed</span>';
					}
					tr.find('.place-open-now').html(open_now);
				} else {
					tr.find('.place-open-now').html('<span>--</span>');
				}
			}
		}
	});

	// Hide the loading spinner & Initialize DataTable
	table.fadeIn('fast', function () {
		$('.loading-spinner').hide();
		$('.onload-show').show();
		var oTable = table.DataTable({
			'paging': false,
			'sDom': 'rtip',
			'order': [
				[1, 'asc']
			]
		});
		$('#table-search-input').keyup(function () {
			oTable.search($(this).val()).draw();
		})
	});
}

$(function () {

	$('#details').on('show.bs.modal', function (event) {

		var button = $(event.relatedTarget);
		var id = button.parents('tr').attr('id');
		var lsData = localStorage.getItem(id);
		var place = JSON.parse(lsData); // var place = window['place_' + id];
		var modal = $(this);
		var facebookId = button.parents('tr').attr('data-facebookId');

		/**
		 * Facebook API
		 * https://github.com/andris9/simpleStorage
		 */
		$.getJSON('https://graph.facebook.com/' + facebookId + '/?access_token=647293568670589|zRA8pKuNTyjnTaBeb-v3FGIQ4Nw', function (json, textStatus) {
			simpleStorage.set('fb_' + facebookId, json, {
				TTL: 604800000 // one week
			});
			renderTemplate();
		});

		function renderTemplate() {
			// get the cached data
			var json = simpleStorage.get('fb_' + facebookId);
			// console.log(json, place);

			// Prepare data			
			var openingHours = '';
			if (place.hasOwnProperty('opening_hours')) {
				openingHours = '<h4>Opening Hours</h4>' + place.opening_hours.weekday_text;
				if (place.opening_hours.open_now) {
					openingHours += '<br><span class="label label-success">Open Now!</span>';
				} else {
					openingHours += '<br><span class="label label-danger">Currently closed</span>';
				}
			} else if (json.hasOwnProperty('hours')) {
				var array = [];
				$.each(json.hours, function (index, val) {
					array.push(index + ': ' + val);
				});
				openingHours = '<h4>Opening Hours</h4><ul><li>' + array.join('</li><li>') + '</li></ul>';
			}

			var location = '';
			if (json.hasOwnProperty('location')) {
				location += '<h4>Street Address</h4><p>' + json.location.street + '</p><a href="https://maps.google.com/?daddr=' + json.location.latitude + ',' + json.location.longitude + '" class="btn btn-default" target="_blank">Locate</a>';
			} else if (place.hasOwnProperty('adr_address')) {
				location += '<h4>Street Address</h4><p>' + place.adr_address + '</p>';
			}
			if (json.hasOwnProperty('public_transit')) {
				location += '<h4>Public Transit</h4><p>' + json.public_transit + '</p>';
			}

			// Customize the modal
			modal.find('.modal-title').text(json.name);
			if (json.hasOwnProperty('location')) {
				modal.find('.btn-primary').attr('href', 'https://www.google.com/maps?saddr=My+Location&daddr=' + json.location.latitude + ',' + json.location.longitude).removeClass('hide');
			} else {
				modal.find('.btn-primary').addClass('hide');
			}

			// populate the modal content
			modal.find('.modal-body').html('<div class="fb fb-details-coverphoto"><img class="img-responsive" src="' + json.cover.source + '" alt=""></div><div class="row"><div class="col-lg-6 col-md-6"><div class="fb fb-details-location">' + location + '</div></div><div class="col-lg-6 col-md-6"><div class="fb fb-details-openinghours">' + openingHours + '</div></div></div><div class="fb fb-details-about"><h4>About ' + json.name + '</h4>' + json.about + '</div><div class="fb fb-like-container"><div class="fb-like" data-href="https://facebook.com/' + facebookId + '" data-layout="standard" data-action="like" data-show-faces="true" data-share="true"></div></div>');

			// Refresh the like button accordingly
			FB.XFBML.parse();
		}
	});

	/**
	 * Reset modal content
	 * http://stackoverflow.com/a/12287169
	 */
	$('body').on('hide.bs.modal', '.modal', function () {
		$(this).removeData('bs.modal');
	});

	$('#suggest_edits_modal').on('show.bs.modal', function (event) {
		var button = $(event.relatedTarget);
		var modal = $(this);
		var name = button.parents('tr').find('.place-name').text();
		modal.find('.modal-title').text('Suggest Edits for ' + name);
	});

});