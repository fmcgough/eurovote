var expect = require("chai").expect,
	proxyquire = require("proxyquire"),
	sinon = require("sinon");

var app = sinon.stub();
var auth = { authenticated: sinon.stub() };
var get = app.get = sinon.stub();

var homepage = proxyquire("../routes/homepage", {
	"./auth": auth
});

describe("homepage", function() {
	var req = {}, res = {};
	var spy = res.render = sinon.spy();
	var display;
	var user = req.user = {};

	beforeEach(function() {
		homepage(app);
		spy.reset();
		display = get.args[0][2];
	});

	it("should render home page", function() {
		display(req, res);

		expect(spy.calledOnce).to.equal(true);
		expect(spy.args[0][0]).to.equal("index");
	});

	it("should set page title and navbarActive properties", function() {
		display(req, res);

		var locals = spy.args[0][1];
		expect(locals).to.have.property("title").that.equals("Eurovision 2015");
		expect(locals).to.have.property("navbarActive").that.equals("Home");
	});

	it("should require authentication to view the homepage", function() {
		expect(get.args[0][1]).to.deep.equal(auth.authenticated);
	});
});
