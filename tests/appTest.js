var expect = require("chai").expect,
	app = require("../app").app,
	request = require("supertest");

describe("App", function() {

	describe("GET /", function () {

		it("should display the home page", function(done) {
			request(app)
				.get("/")
				.set("Accept", "text/html")
				.expect(200)
				.end(function(err, response) {
					if (err) {
						return done(err);
					}
					return done();
				});
		});
	});
});