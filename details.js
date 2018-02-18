$('#thumbnails img').click(function(){
    $('#main-photo').attr('src', $(this).attr('src'));
    $('.selected').removeClass('selected'); // removes the previous selected class
    $(this).addClass('selected'); // adds the class to the clicked image
});

