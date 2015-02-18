var expect = require("chai").expect,
    sinon = require("sinon"),
    proxyquire = require("proxyquire");

var app = sinon.stub();
var models = sinon.stub();
var Group = models.Group = sinon.stub();
var auth = { authenticated: sinon.stub() };
var post = app.post = sinon.stub();

var joinGroup = proxyquire("../../routes/group/join", {
    "../auth" : auth,
    "../../models": models
});

describe("POST /group/join", function() {
    var req = {}, res = {}, user = req.user = {};
    var promise = {}, success, error;
    var find = Group.find = sinon.stub();
    var group = { addUser: sinon.stub().returns(promise) };
    var join;

    before(function() {
        joinGroup(app);
        req.body = {groupCode: "TESTI123"};
        req.user = {};
        find.reset();
        find.returns(promise);
        join = post.args[0][2];
    });

    beforeEach(function() {
        res.render = sinon.stub();
        res.redirect = sinon.stub();
        success = promise.success = sinon.stub().returns(promise);
        error = promise.error = sinon.stub();
        group.addUser.reset();
    });

    it("requires authentication to join a group", function() {
        expect(post.calledWith("/group/join", auth.authenticated)).to.be.true;
    });

    it("finds the group using the group code", function() {
        join(req, res);

        expect(find.calledWith({where: {code: "TESTI123"}})).to.be.true;
    });

    it("adds the user to the group", function() {
        success.yields(group);
        join(req, res);

        expect(group.addUser.calledWith(req.user)).to.be.true;
        expect(res.redirect.calledWith("/group"));
    });

    it("displays an error if there is an error adding the user", function() {
        success.onCall(0).yields(group).returns(promise);
        error.yields("error");
        join(req, res);

        expect(res.redirect.called).to.be.false;
        expect(group.addUser.called).to.be.true;
        expect(res.render.calledWith("group")).to.be.true;
        expect(res.render.args[0][1]).to.have.property("joinErrors").that.deep.equals(["error"]);
    });

    it("displays an error if the group is not found", function() {
        success.yields();
        join(req, res);

        expect(res.redirect.called).to.be.false;
        expect(res.render.calledWith("group")).to.be.true;
        expect(res.render.args[0][1]).to.have.property("joinErrors")
            .that.deep.equals(["Group not found"]);
    });

    it("displays an error if there is an error finding the group", function() {
        error.yields("error");
        join(req, res);

        expect(group.addUser.called).to.be.false;
        expect(res.redirect.called).to.be.false;
        expect(res.render.calledWith("group")).to.be.true;
        expect(res.render.args[0][1]).to.have.property("joinErrors")
            .that.deep.equals(["error"]);
    });
});
