$(function () {

    $('#item').popup({
        time: 1000,
        classAnimateShow: 'flipInX',
        classAnimateHide: 'hinge',
        onPopupClose: function e() {
            // console.log('0')
        },
        onPopupInit: function e() {
            // console.log('1')
        }
    });

});