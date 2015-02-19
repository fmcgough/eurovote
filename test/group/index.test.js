var expect = require("chai").expect,
    sinon = require("sinon"),
    proxyquire = require("proxyquire");

var app = sinon.stub();
var models = sinon.stub();
var Group = models.Group = sinon.stub();
var User = models.User = sinon.stub();
var auth = { authenticated: sinon.stub() };
var get = app.get = sinon.stub();

var group = proxyquire("../../routes/group", {
    "../auth" : auth,
    "../../models": models
});
describe("GET /group", function() {
    var req = {}, res = {}, user = req.user = {};
    var promise = {};
    var success = promise.success = sinon.stub();
    var error = promise.error = sinon.stub();
    var display;
    var getGroup = user.getGroup = sinon.stub();

    before(function() {
        group(app);
        display = get.args[0][2];
    });

    beforeEach(function() {
        getGroup.reset();
        getGroup.returns(promise);
        res.render = sinon.stub();
        success.reset();
        success.returns(promise).callsArg(0);
        error.reset();
    });

    it("requires authentication to display the group page", function() {
        expect(get.args[0][0]).to.equal("/group");
        expect(get.calledWith("/group", auth.authenticated)).to.be.true;
    });

    it("gets the user's group to display on the home page", function() {
        display(req, res);
        expect(getGroup.calledOnce).to.be.true;
        expect(getGroup.args[0][0]).to.deep.equal({include: [User]});
    });

    it("renders the group page", function() {
        success.callsArg(0);
        display(req, res);

        expect(res.render.calledOnce).to.be.true;
        expect(res.render.args[0][0]).to.equal("group");
        expect(res.render.args[0][1]).to.have.property("title")
            .that.equals("Group");
        expect(res.render.args[0][1]).to.have.property("navbarActive")
            .that.equals("Group");
    });

    it("includes the group in the group page if present", function() {
        var group = {};
        success.callsArgWith(0, group);
        display(req, res);

        expect(res.render.calledOnce).to.be.true;
        expect(res.render.args[0][1]).to.have.property("group", group);
    });

    it("returns 500 on error", function() {
        res.status = sinon.stub().returns(res);
        res.send = sinon.stub();
        error.callsArgWith(0, "err");
        display(req, res);
        expect(res.status.calledWith(500));
        expect(res.send.calledWith("err"));
    });
});
