
$(function() {
    $('#nestable').nestable({
        "listNodeName": "ul",
        "maxDepth" : 1
    });

    $("ul[id='rank'] li div").text(function(index) {
        return calculateScore(index);
    });
});

function calculateScore(position) {
    if (position === 0) {
        return 12;
    } else if (position === 1) {
        return 10;
    } else {
        return Math.max(10 - position, 0);
    }
}

$('#vote-form').submit(function(event){
    var sorted = $('#nestable').nestable('serialize');
    var votes = [];

    for (var i = 0; i < sorted.length; i++) {
        var points = calculateScore(i);
        if (points > 0) {
            votes.push({
                id : sorted[i].id,
                score : points
            });
        }
    }
    console.log("Submitting votes:" + JSON.stringify(votes));
    $.post('/submit', {
        data: JSON.stringify(votes),
        dataType: "json"
    });
});
