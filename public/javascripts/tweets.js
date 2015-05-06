(function() {
    var socket = io.connect(window.location.hostname + ":" + window.location.port + '/tweets');

    socket.on('tweet', function(data){
        if (!data.retweeted_status) {
            var template = $("#tweet-template").clone().removeAttr("id").removeClass("hidden");
            template.find(".username").text(data.user.screen_name);
            template.find(".tweet-text").text(data.text);
            template.find(".tweet-time").text(new Date(data.created_at).toLocaleString());
            template.find(".tweet-img").attr("src", data.user.profile_image_url);
            $(".tweets").prepend(template);
        }
    })
})();
