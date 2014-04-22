
$(function(){
    $('#nestable').nestable(
    {
        "listNodeName": "ul",
        "maxDepth" : 1
    });
});



$('#vote-form').submit(function(event){
    var sorted = $('#nestable').nestable('serialize');
    alert("typeof sorted: " + typeof(sorted) + ", sorted: " + JSON.stringify(sorted));
    $.post('/submit', {countries : sorted});
});