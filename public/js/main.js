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
            $('#airport').val(here.latitude+","+here.longitude);
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
        console.log(data);
    })
});

function getActive($menu) {
    return $menu.find('.pure-menu-link.active').html();
}