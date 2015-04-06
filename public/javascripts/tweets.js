(function() {
    var socket = io.connect(window.location.hostname + ":" + window.location.port + '/tweets');

    socket.on('tweet', function(data){
        console.log("Received tweet: " + data.text);
    })
})();
