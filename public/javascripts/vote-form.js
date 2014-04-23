
$(function(){
    $('#nestable').nestable(
    {
        "listNodeName": "ul",
        "maxDepth" : 1
    });
});



$('#vote-form').submit(function(event){
    var sorted = $('#nestable').nestable('serialize');
    $.post('/submit', {countries : sorted});
});