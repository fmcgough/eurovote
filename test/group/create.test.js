var expect = require("chai").expect,
    sinon = require("sinon"),
    proxyquire = require("proxyquire");

var app = sinon.stub();
var models = sinon.stub();
var Group = models.Group = sinon.stub();
var login = { authenticated: sinon.stub() };
var post = app.post = sinon.stub();

var joinGroup = proxyquire("../../routes/group/create", {
    "../login" : login,
    "../../models": models
});

describe("POST /group/create", function() {
    var req = {}, res = {}, user = req.user = {};
    var promise = {}, success, error;
    var findOne = Group.findOne = sinon.stub();
    var create = Group.create = sinon.stub();
    var group = { addUser: sinon.stub().returns(promise) };
    var createGroup;

    before(function() {
        joinGroup(app);
        req.user = {};
        findOne.reset();
        findOne.returns(promise);
        create.reset();
        create.returns(promise);
        createGroup = post.args[0][2];
    });

    beforeEach(function() {
        res.render = sinon.stub();
        res.redirect = sinon.stub();
        success = promise.success = sinon.stub().returns(promise);
        error = promise.error = sinon.stub();
        group.addUser.reset();
    });

    it("requires authentication to create a group", function() {
        expect(post.calledWith("/group/create", login.authenticated)).to.be.true;
    });
});
