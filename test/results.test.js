var expect = require("chai").expect,
    proxyquire = require("proxyquire"),
    sinon = require("sinon");

var models = {};
var app = sinon.stub();
var auth = { authenticated: sinon.stub() };
var get = app.get = sinon.stub();
var Country = models.Country = sinon.stub();
var Vote = models.Vote = sinon.stub();


var countries = [ { id: 0,
                name: "Narnia",
                 dataValues: { total: 12 } },
              { id: 1,
                name: "Archenland",
                dataValues: {total: 10} } ];

var results = proxyquire("../routes/results", {
    '../models': models,
    "./auth": auth
});

describe("GET /results", function() {
    var req = {}, res = {};
    var spy = res.render = sinon.spy();
    var promise = sinon.stub();
    promise.then = sinon.stub().callsArgWith(0, countries).returns(promise);
    promise.catch = sinon.stub();
    Country.findAll = sinon.stub().returns(promise);
    var display;
    var user = req.user = {};
    user.getGroup = sinon.stub().returns(promise);

    beforeEach(function() {
        results(app);
        spy.reset();
        promise.then.reset();
        Country.findAll.reset();
        display = get.args[0][2];
    });

    it("should include countries in the response", function() {
        display(req, res);

        var locals = spy.args[0][1];
        expect(locals).to.have.property("countries").that.deep.equals(countries);
    });

    it("should order countries by score", function() {
        display(req, res);
        expect(Country.findAll.args[0][0]).to.have.property("order").that.equals("total DESC");
    });
});
