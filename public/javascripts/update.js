$(function()
{
    now.receiveUpdate = function(data)
    {
        console.log("Received update: " + JSON.stringify(data));

        var newrows;
        for (var i = 0; i < data.length; i++)
        {
            newrows += "<tr><td>" + data[i].country
                + "</td><td>" + data[i].score + "</td></tr>";
        }
        $("#results tbody").html(newrows);
    };

});