(function($){
    $(document).mousemove(
        function(e){
            var X = e.pageX;
            var Y = e.pageY;
            $('body').css('background','radial-gradient(circle at '+X+'px '+Y+'px, rgba(125, 69, 161, 0.1), #ededed');
        }
    );
})(jQuery);