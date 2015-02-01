var expect = require("chai").expect,
	proxyquire = require("proxyquire"),
	sinon = require("sinon");

var pgStub = {},
	clientStub = {},
	done = sinon.spy();

var vote = proxyquire("../routes/vote", {
	"pg": pgStub
});

pgStub.connect = function(url, callback) {
	callback(null, clientStub, done);
};

describe("routes/vote", function() {
	var req = {}, res = {};
	var spy = res.render = sinon.spy();
	var query

	beforeEach(function() {
		spy.reset();
		done.reset();
	});

	describe("GET voting page", function() {
		var countries = [ { id: 1, name: "Narnia" },
		                  { id: 2, name: "Transylvania" }];

		clientStub.query = function(sql, callback) {
			callback(null, { rows : countries });
		};

		it("should render voting page", function() {
			vote.display(req, res);
			expect(spy.calledOnce).to.equal(true);
			expect(spy.args[0][0]).to.equal("vote");
		});

		it("should set page title and navbarActive properties", function() {
			vote.display(req, res);

			var locals = spy.args[0][1];

			expect(locals).to.have.property("title").that.equals("Vote");
			expect(locals).to.have.property("navbarActive").that.equals("Vote");
		});

		it("should include countries in the response", function() {
			vote.display(req, res);

			var locals = spy.args[0][1];
			expect(locals).to.have.property("countries").that.deep.equals(countries);
		});

		it("should call done() after retrieving results", function() {
			vote.display(req, res);

			expect(done.calledOnce).to.equal(true);
		});
	});
});