var expect = require("chai").expect,
	proxyquire = require("proxyquire"),
	sinon = require("sinon");

var pgStub = {},
	clientStub = {},
	done = sinon.spy();

var vote = proxyquire("../routes/vote", {
	"pg": pgStub
});

pgStub.connect = sinon.stub();
clientStub.query = sinon.stub();

describe("routes/vote", function() {
	var req = {}, res = {};
	var spy = res.render = sinon.spy();
	var query

	beforeEach(function() {
		pgStub.connect.callsArgWith(1, null, clientStub, done);
		spy.reset();
		done.reset();
	});

	describe("GET voting page", function() {
		var countries = [ { id: 1, name: "Narnia" },
		                  { id: 2, name: "Transylvania" }];

		beforeEach(function() {
			clientStub.query.reset();
			clientStub.query.callsArgWith(1, null, { rows: countries });
		});

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

	describe("POST /submit", function() {
		var votes = [ { id: 1, score: 12 },
		              { id: 2, score: 10 },
		              { id: 3, score: 8 } ];
		var req = {};
		req.body = { data: JSON.stringify(votes) };

		beforeEach(function() {
			clientStub.query.reset();
			clientStub.query.callsArg(1);
		});

		it("should insert all the votes", function() {
			vote.submit(req, res);

			expect(clientStub.query.callCount).to.equal(votes.length);
			for (var i = 0; i < clientStub.query.callCount; i++) {
				var call = clientStub.query.getCall(i);
				expect(call.calledWith(sinon.match({
					values: [ votes[i].score, votes[i].id ]
				})));
			}
		});

		it("should call done() after inserting the votes", function() {
			vote.submit(req, res);
			expect(done.callCount).to.equal(1);
			expect(done.calledAfter(clientStub.query)).to.equal(true);
			expect(done.calledBefore(clientStub.query)).to.equal(false);
		});
	});
});