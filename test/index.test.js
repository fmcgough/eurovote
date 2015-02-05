var expect = require("chai").expect,
	proxyquire = require("proxyquire"),
	sinon = require("sinon");

var models = {};

var countries = [ { id: 0,
				name: "Narnia",
				Votes: [{ dataValues: { total: 12 }}] },
              { id: 1,
				name: "Archenland",
				Votes: [{dataValues: {total: 10}}]} ];

var index = proxyquire("../routes/index", {
	'../models': models
});

var Country = models.Country = sinon.stub();
var Vote = models.Vote = sinon.stub();

describe("routes/index", function() {
	var req = {}, res = {};
	var spy = res.render = sinon.spy();
	var promise = sinon.stub();
	promise.then = sinon.stub().callsArgWith(0, countries);
	Country.findAll = sinon.stub().returns(promise);

	beforeEach(function() {
		spy.reset();
		promise.then.reset();
		Country.findAll.reset();
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

	it("should include countries in the response", function() {
		index.index(req, res);

		var locals = spy.args[0][1];
		expect(locals).to.have.property("countries").that.deep.equals(countries);
	});
});
