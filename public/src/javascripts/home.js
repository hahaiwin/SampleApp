var makeDrag = function(elem){
    var elem = $(elem),
        elem_width = elem.width(),
        body = $('body');
        line_x = elem.after('<div class="drag_line_x"></div>').next();

    elem.css({
        width: elem_width
    });
    line_x.css({
        height: elem.height()
    });
    line_x.on('mousedown',function(e){
        var x_origin = e.pageX;
        body.addClass('hover_pointer');
        body.on('mousemove', function(e){
                elem.css({
                    width: e.pageX
                });
        });
    });
    body.on('mouseup', function(){
        body.off('mousemove');
        body.removeClass('hover_pointer');
    });
};

makeDrag('.tree_menu');