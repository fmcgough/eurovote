[1mdiff --git a/routes/vote.js b/routes/vote.js[m
[1mindex 3622061..1134b95 100644[m
[1m--- a/routes/vote.js[m
[1m+++ b/routes/vote.js[m
[36m@@ -28,9 +28,7 @@[m [mexports.display = function(req, res) {[m
 exports.submit = function(req, res) {[m
     var votes = JSON.parse(req.body.data);[m
     console.log("Votes: " + req.body.data);[m
[31m-[m
     insertVotes(votes);[m
[31m-    console.log("Vote submitted");[m
 };[m
 [m
 function insertVotes(votes) {[m
[36m@@ -45,8 +43,9 @@[m [mfunction insertVotes(votes) {[m
             queryConfig.values = [vote.score, vote.id];[m
             client.query(queryConfig, function(err, result) {[m
                 if (err) {[m
[31m-                    throw err;[m
[32m+[m[32m                    callback(err);[m
                 }[m
[32m+[m[32m                callback();[m
             })[m
         }, function(err){[m
             if (err) {[m
[1mdiff --git a/test/vote.test.js b/test/vote.test.js[m
[1mindex 0f25e72..6fc60eb 100644[m
[1m--- a/test/vote.test.js[m
[1m+++ b/test/vote.test.js[m
[36m@@ -10,9 +10,8 @@[m [mvar vote = proxyquire("../routes/vote", {[m
 	"pg": pgStub[m
 });[m
 [m
[31m-pgStub.connect = function(url, callback) {[m
[31m-	callback(null, clientStub, done);[m
[31m-};[m
[32m+[m[32mpgStub.connect = sinon.stub();[m
[32m+[m[32mclientStub.query = sinon.stub();[m
 [m
 describe("routes/vote", function() {[m
 	var req = {}, res = {};[m
[36m@@ -20,6 +19,7 @@[m [mdescribe("routes/vote", function() {[m
 	var query[m
 [m
 	beforeEach(function() {[m
[32m+[m		[32mpgStub.connect.callsArgWith(1, null, clientStub, done);[m
 		spy.reset();[m
 		done.reset();[m
 	});[m
[36m@@ -28,9 +28,10 @@[m [mdescribe("routes/vote", function() {[m
 		var countries = [ { id: 1, name: "Narnia" },[m
 		                  { id: 2, name: "Transylvania" }];[m
 [m
[31m-		clientStub.query = function(sql, callback) {[m
[31m-			callback(null, { rows : countries });[m
[31m-		};[m
[32m+[m		[32mbeforeEach(function() {[m
[32m+[m			[32mclientStub.query.reset();[m
[32m+[m			[32mclientStub.query.callsArgWith(1, null, { rows: countries });[m
[32m+[m		[32m});[m
 [m
 		it("should render voting page", function() {[m
 			vote.display(req, res);[m
[36m@@ -60,4 +61,36 @@[m [mdescribe("routes/vote", function() {[m
 			expect(done.calledOnce).to.equal(true);[m
 		});[m
 	});[m
[32m+[m
[32m+[m	[32mdescribe("POST /submit", function() {[m
[32m+[m		[32mvar votes = [ { id: 1, score: 12 },[m
[32m+[m		[32m              { id: 2, score: 10 },[m
[32m+[m		[32m              { id: 3, score: 8 } ];[m
[32m+[m		[32mvar req = {};[m
[32m+[m		[32mreq.body = { data: JSON.stringify(votes) };[m
[32m+[m
[32m+[m		[32mbeforeEach(function() {[m
[32m+[m			[32mclientStub.query.reset();[m
[32m+[m			[32mclientStub.query.callsArg(1);[m
[32m+[m		[32m});[m
[32m+[m
[32m+[m		[32mit("should insert all the votes", function() {[m
[32m+[m			[32mvote.submit(req, res);[m
[32m+[m
[32m+[m			[32mexpect(clientStub.query.callCount).to.equal(votes.length);[m
[32m+[m			[32mfor (var i = 0; i < clientStub.query.callCount; i++) {[m
[32m+[m				[32mvar call = clientStub.query.getCall(i);[m
[32m+[m				[32mexpect(call.calledWith(sinon.match({[m
[32m+[m					[32mvalues: [ votes[i].score, votes[i].id ][m
[32m+[m				[32m})));[m
[32m+[m			[32m}[m
[32m+[m		[32m});[m
[32m+[m
[32m+[m		[32mit("should call done() after inserting the votes", function() {[m
[32m+[m			[32mvote.submit(req, res);[m
[32m+[m			[32mexpect(done.callCount).to.equal(1);[m
[32m+[m			[32mexpect(done.calledAfter(clientStub.query)).to.equal(true);[m
[32m+[m			[32mexpect(done.calledBefore(clientStub.query)).to.equal(false);[m
[32m+[m		[32m});[m
[32m+[m	[32m});[m
 });[m
\ No newline at end of file[m
