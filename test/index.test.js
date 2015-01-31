var expect = require("chai").expect,
	proxyquire = require("proxyquire"),
	sinon = require("sinon");

var pgStub = {},
	clientStub = {},
	done = sinon.spy();

var votes = [ { score: 12, country: "Narnia" },
              { score: 10, country: "Archenland" } ];

var index = proxyquire("../routes/index", {
	'pg' : pgStub
});

pgStub.connect = function(url, callback) {
	callback(null, clientStub, done);
};

clientStub.query = function(sql, callback) {
	var results = { rows: votes };
	callback(null, results);
};


describe("index", function() {
	var req = {}, res = {};
	var spy = res.render = sinon.spy();

	beforeEach(function() {
		done.reset();
	});

	it("should render home page", function() {
		index.index(req, res);

		expect(spy.calledOnce).to.equal(true);
		expect(spy.args[0][0]).to.equal("index");
	});

	it("should set page title and navbarActive properties", function() {
		index.index(req, res);

		var locals = spy.args[0][1];
		expect(locals).to.have.property("title").that.equals("Eurovision 2015");
		expect(locals).to.have.property("navbarActive").that.equals("Home");
	});

	it("should include votes in the response", function() {
		index.index(req, res);

		var locals = spy.args[0][1];
		expect(locals).to.have.property("results").that.equals(votes);
	});

	it("should call done() after retrieving results", function() {
		index.index(req, res);
		expect(done.calledOnce).to.equal(true);
	});
});
