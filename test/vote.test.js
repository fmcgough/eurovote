var expect = require("chai").expect,
	proxyquire = require("proxyquire"),
	sinon = require("sinon");

var models = {};
var app = sinon.stub();
var auth = { authenticated: sinon.stub() };
var get = app.get = sinon.stub();
var post = app.post = sinon.stub();
var Country = models.Country = sinon.stub();
var Vote = models.Vote = sinon.stub();

var vote = proxyquire("../routes/vote", {
	"../models": models,
	"./auth": auth
});

describe("routes/vote", function() {
	var req = {}, res = {};
	var spy = res.render = sinon.spy();
	var display, submit;

	before(function() {
		vote(app);
		display = get.args[0][2];
		submit = post.args[0][2];
	});

	beforeEach(function() {
		spy.reset();
	});

	describe("GET voting page", function() {
		var countries = [ { id: 1, name: "Narnia" },
				{ id: 2, name: "Transylvania" }];
		var promise = sinon.stub();
		promise.then = sinon.stub();


		beforeEach(function() {
			Country.findAll = sinon.stub();
			Country.findAll.returns(promise);
			promise.then.callsArgWith(0, countries);
		});

		it("should render voting page", function() {
			display(req, res);
			expect(spy.calledOnce).to.equal(true);
			expect(spy.args[0][0]).to.equal("vote");
		});

		it("should set page title and navbarActive properties", function() {
			display(req, res);

			var locals = spy.args[0][1];

			expect(locals).to.have.property("title").that.equals("Vote");
			expect(locals).to.have.property("navbarActive").that.equals("Vote");
		});

		it("should include countries in the response", function() {
			display(req, res);

			var locals = spy.args[0][1];
			expect(locals).to.have.property("countries").that.deep.equals(countries);
		});

		it("should order the countries by name", function() {
			display(req, res);

			var call = Country.findAll.getCall(0);
			expect(call.args[0]).to.have.property("order").that.equals("name ASC");
		});
	});

	describe("POST /submit", function() {
		var votes = [ { id: 1, score: 12 },
		              { id: 2, score: 10 },
		              { id: 3, score: 8 } ];
		var req = {};
		req.body = { data: JSON.stringify(votes) };

		res.send = sinon.stub();
		res.sendStatus = sinon.stub();
		res.status = sinon.stub().returns(res);
		var promise = sinon.stub();
		promise.complete = sinon.stub();
		Vote.create = sinon.stub().returns(promise);

		beforeEach(function() {
			Vote.create.reset();
			Vote.create.returns(promise);
			promise.complete.reset();
			promise.complete.callsArg(0);
		});

		it("should insert all the votes", function() {
			submit(req, res);

			expect(Vote.create.callCount).to.equal(votes.length);
			for (var i = 0; i < Vote.create.callCount; i++) {
				var call = Vote.create.getCall(i);
				expect(call.calledWith(sinon.match({
					CountryId: votes[i].id,
					score: votes[i].score
				})));
			}
		});

		it("should respond OK if no error thrown", function() {
			submit(req, res);

			expect(res.sendStatus.calledWith(200)).to.equal(true);
		});

		it("should respond with an error message if there is an error", function() {
			var err = "test error";
			promise.complete.callsArgWith(0, err);

			submit(req, res);

			expect(res.status.calledWith(500)).to.equal(true);
			expect(res.send.calledOnce).to.equal(true);
		});
	});
});
