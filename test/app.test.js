var expect = require("chai").expect,
	app = require("../app").app,
	request = require("supertest");

function createLoginCookie(req, done) {
	var user = { username: "test", password: "password1" };
	req(app).post("/login")
		.send(user)
		.end(function(err, res){
			if (err) {
				return done(err);
			}
			var cookie = res.headers['set-cookie'];
			done(null, cookie);
		});
}

describe("App", function() {

	var loginCookie;

	before(function(done){
		createLoginCookie(request, function(err, cookie){
			loginCookie = cookie;
			done(err);
		});
	});

	describe("GET /", function () {

		it("should display the home page", function(done) {
			request(app)
				.get("/")
				.set("Accept", "text/html")
				.set("cookie", loginCookie)
				.expect(200)
				.end(function(err, response) {
					if (err) {
						return done(err);
					}
					return done();
				});
		});
	});

	describe("GET /vote", function() {
		it("should display the voting page", function(done) {
			request(app)
				.get("/vote")
				.set("Accept", "text/html")
				.set("cookie", loginCookie)
				.expect(200)
				.end(function(err, response) {
					if (err) {
						return done(err);
					}
					return done();
				});
		});
	})
});
