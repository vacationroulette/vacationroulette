var dateFormat = "MMM D, YYYY";

var today = new Date();

$(function(){
    // Set up date pickers
    var leaveDatePicker, returnDatePicker;
    leaveDatePicker = new Pikaday({
        field: document.getElementById('leave-date'),
        format: dateFormat,
        minDate: today,
        onSelect: function(){
            //var dayAfter = new Date(this.getDate());
            //dayAfter.setDate(dayAfter.getDate() + 1);

            //returnDatePicker.setMinDate(dayAfter);

            if(returnDatePicker.getDate() <= this.getDate())
                returnDatePicker.setDate(this.getDate(), true)
        }
    });
    leaveDatePicker.setDate(today, true);

    returnDatePicker = new Pikaday({
        field: document.getElementById('return-date'),
        format: dateFormat,
        minDate: today,
        onSelect: function(){
            //var dayBefore = new Date(this.getDate());
            //dayBefore.setDate(dayBefore.getDate() - 1);

            if(leaveDatePicker.getDate() >= this.getDate())
                leaveDatePicker.setDate(this.getDate(), true);
        }
    });
    var twoDaysLater = new Date(today);
    twoDaysLater.setDate(twoDaysLater.getDate()+2);
    returnDatePicker.setDate(twoDaysLater, true);

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
       }
    });

    // Set button callback
    $('#btn-search').click(function(e){
        e.preventDefault();
        var data = {
            departureDate: leaveDatePicker.getDate(),
            departureLocation: $('#airport').val(),
            returnDate: returnDatePicker.getDate(),
            distance: getActive($('#filter-distance')),
            price: getActive($('#filter-price')),
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
        }, function(err){
            console.log("Error response from server:", err);
        });
    })
});

function getActive($menu) {
    return $menu.find('.pure-menu-link.active').html();
}