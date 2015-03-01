var dateFormat = "MMM D, YYYY";

var today = new Date();

var tripLengthLimit = 16;

var currentData = null;
var currentDataIndex = -1;

var makeQueryText = "Take Me Away";
var nextItemText = "Somewhere Else, Please";

var tooltipsEnabled = false;

$(function(){
    // Set up date pickers
    var leaveDatePicker, returnDatePicker;
    leaveDatePicker = new Pikaday({
        field: document.getElementById('leave-date'),
        format: dateFormat,
        minDate: today,
        onSelect: function(){
            if(returnDatePicker.getDate() <= this.getDate())
                returnDatePicker.setDate(this.getDate(), true)
            if(returnDatePicker.getDate() >= moment(this.getDate()).add(16, 'day').toDate())
                returnDatePicker.setDate(moment(this.getDate()).add(16, 'day').toDate(), true);
        }
    });
    leaveDatePicker.setDate(today, true);

    returnDatePicker = new Pikaday({
        field: document.getElementById('return-date'),
        format: dateFormat,
        minDate: today,
        onSelect: function(){
            if(leaveDatePicker.getDate() >= this.getDate())
                leaveDatePicker.setDate(this.getDate(), true);
            if(leaveDatePicker.getDate() <= moment(this.getDate()).subtract(16, 'day').toDate())
                leaveDatePicker.setDate(moment(this.getDate()).subtract(16, 'day').toDate(), true);
        }
    });
    returnDatePicker.setDate(moment().add(2, 'day').toDate(), true);

    // Setup Filter selector thingy
    $('.pure-menu .pure-menu-link').click(function(e){
        e.preventDefault();
        $this = $(this);
        $this.closest('.pure-menu').find('.active').removeClass('active');
        $this.addClass('active');
    });


    // Get location
    if(navigator.geolocation && navigator.geolocation.getCurrentPosition)
        navigator.geolocation.getCurrentPosition(function(position) {
            var here = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            var airport = getClosestAirport(here);
            $('#airport').val(airport.code);
        });

    // Set airport autocomplete
    $('#airport').autoComplete({
        minChars: 1,
        cache: false, // Gives some weird results
        renderItem: function(item, search) {
            var itemStr = item.city + " - " + item.name + " (" + item.code + ")";
            var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
            return '<div class="autocomplete-suggestion" data-val="' + item.code + '">' + itemStr.replace(re, '<b>$1</b>') + '</div>';
        },
        source: function(term, response) {
            var lowTerm = term.toLowerCase();
            var matched = _.filter(airports, function(airport){
                return _.some(['city', 'code', 'name'], function(prop){
                    return _.includes(airport[prop].toLowerCase(), lowTerm);
                });
            });
            response(_.sortBy(matched, function(i){ // JANKY ASS RANKING RIGHT HERE
                if(_.includes(i.code.toLowerCase(), lowTerm))
                    return 100 + i.code.toLowerCase().indexOf(lowTerm)
                if(_.includes(i.city.toLowerCase(), lowTerm))
                    return 200 + i.city.toLowerCase().indexOf(lowTerm)
                if(_.includes(i.name.toLowerCase(), lowTerm))
                    return 300 + i.name.toLowerCase().indexOf(lowTerm)
            }));
       },
        onSelect: invalidateData
    });

    // Set button callback
    $('form').submit(function(e){
        e.preventDefault();
        if(currentData === null)
        {
            var data = {
                departureDate: leaveDatePicker.getDate(),
                departureLocation: $('#airport').val(),
                returnDate: returnDatePicker.getDate(),
                distance: getActiveIndex($('#filter-distance')),
                price: getActiveIndex($('#filter-price')),
                activity: getActive($('#filter-theme'))
            }
            console.log("Sending request to server: ", data)
            $.ajax
            ({
                type: "POST",
                url: '/api/flights',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(data)
            }).then(function(res){
                console.log("Received response from server: ", res);
                if(res.length === 0)
                {
                    alert("No results found.");
                    return;
                }
                currentData = res;
                currentDataIndex = 0;
                $('#btn-search').html(nextItemText);
                displayData(currentData[currentDataIndex])
            }, function(err){
                console.log("Error response from server:", err);
                if(err.status == 404)
                {
                    alert("No results found.");
                }
                else
                    alert(JSON.stringify(err,true));
            });
        }
        else
        {
            currentDataIndex++;
            if(currentDataIndex >= currentData.length)
                currentDataIndex = 0;
            displayData(currentData[currentDataIndex]);
        }
    });


    $('input.sentence-input').on('change keyup', invalidateData);
    $('.pure-menu-link:not(.active)').click(invalidateData);
});

function getActive($menu) {
    return $menu.find('.pure-menu-link.active').html();
}
function getActiveIndex($menu) {
    return $menu.find('.pure-menu-link.active').parent().index();
}
function invalidateData() {
    currentData = null;
    $('#btn-search').html(makeQueryText);
}

function displayData(data) {
    var map = {
        "#result-from-airport": '<a href="'+data.kayak+'">'+data.OriginLocation+'</a>',
        "#result-to-airport": '<a href="'+data.kayak+'">'+data.DestinationLocation+'</a>',
        "#result-leave-date": moment(data.DepartureDateTime).format("MMM D"),
        "#result-leave-day": moment(data.DepartureDateTime).format("dddd"),
        "#result-return-date": moment(data.ReturnDateTime).format("MMM D"),
        "#result-return-day": moment(data.ReturnDateTime).format("dddd"),
        "#result-price": '<a href="'+data.kayak+'">$'+data.LowestFare.toFixed(0)+'</a>'
    }
    _.forOwn(map, function(v, k){
        $(k).html(v);
    });
    var fromAirport = findAirportByCode(data.OriginLocation);
    var toAirport = findAirportByCode(data.DestinationLocation);
    if(tooltipsEnabled)
    {
        $('#result-from-airport').tooltipster('destroy');
        $('#result-to-airport').tooltipster('destroy');
    }
    $('#result-from-airport').tooltipster({
        content: $('<h3>'+fromAirport.city+'</h3><h4>'+fromAirport.name+'</h4>'),
        theme: 'tooltip-theme'
    });
    $('#result-to-airport').tooltipster({
        content: $('<h3>'+toAirport.city+'</h3><h4>'+toAirport.name+'</h4>'),
        theme: 'tooltip-theme'
    });
    tooltipsEnabled = true;
    $('#results').removeAttr('hidden');
}