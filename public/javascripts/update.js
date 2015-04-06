function getResults() {
    $.ajax("../results", {
        cache: false
    }).success(function(data){
        $("#results").html(data);
    }).error(function(xhr, status, description) {
        console.log("Error: " + description);
    });
}

$(function() {
    getResults();
    var autoRefresh;

    $("#auto-refresh").bootstrapSwitch();
    $("#auto-refresh").on("switchChange.bootstrapSwitch", function(event, state){
        if (state) {
            autoRefresh = setInterval(getResults, 30000); // auto refresh every 30 secs
        } else {
            clearInterval(autoRefresh);
        }
    });
});
