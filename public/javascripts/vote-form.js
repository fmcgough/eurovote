
$(function(){
    $('#sortable').sortable();
});



$('#vote-form').submit(function(event){
    var sorted = new Array();
    sorted = sorted.concat($('#sortable').sortable("toArray"));
    alert(sorted.toString());
    $.post('/submit', {countries : sorted});
});