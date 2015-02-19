var expect = require("chai").expect,
    sinon = require("sinon"),
    proxyquire = require("proxyquire");

var models = {},
    User = models.User = {},
    auth = {},
    passport = auth.passport = {};
var app = sinon.stub();
var get = app.get = sinon.stub();
var post = app.post = sinon.stub();
var use = app.use = sinon.stub();

var login = proxyquire("../routes/login", {
    "../models": models,
    "./auth": auth
});

describe("login", function() {
    var user = {id: 1, username: "username", passwordHash: "HASH"};
    var display, doLogin, doLogout, locals;

    before(function() {
        login(app);
        display = get.args[0][1];
        doLogin = post.args[0][1];
        doLogout = get.args[1][1];
        locals = use.args[0][0];
    });

    describe("GET /login", function() {
        var req = res = {};
        res.redirect = sinon.stub();
        res.render = sinon.stub();
        req.session = {};

        beforeEach(function() {
            res.redirect.reset();
            res.render.reset();
            req.user = null;
        });

        it("should redirect to home page if already logged in", function() {
            req.user = user;
            display(req, res);
            expect(res.redirect.calledWith("/")).to.be.true;
        });

        it("should render the login page", function() {
            req.session.error = "error";
            req.session.message = "message";
            display(req, res);
            expect(res.render.calledWith("login", {
                title: "Log in",
                error: "error",
                message: "message"
            })).to.be.true;
        });
    });

    describe("POST /login", function() {
        var req = {}, res = {}, next = sinon.stub();
        res.redirect = sinon.stub();
        var middleware = sinon.stub();
        var authenticate = passport.authenticate = sinon.stub();

        beforeEach(function() {
            req.session = {};
            authenticate.reset();
            authenticate.callsArgWith(1, null, user).returns(middleware);
            next.reset();
            req.logIn = sinon.stub().callsArg(1);
        })

        it("should call passport.authenticate and next if an error occurs", function() {
            authenticate.callsArgWith(1, "error");
            doLogin(req, res, next);
            expect(authenticate.called).to.be.true;
            expect(next.calledWith("error")).to.be.true;
            expect(middleware.calledWith(req, res, next)).to.be.true;
        });

        it("should redirect to login if authentication failed", function() {
            authenticate.callsArgWith(1, null, null, {message: "Username or password is incorrect."})
            doLogin(req, res, next);
            expect(authenticate.called).to.be.true;
            expect(next.called).to.be.false;
            expect(res.redirect.calledWith("/login")).to.be.true;
            expect(req.session.error).to.equal("Username or password is incorrect.");
        });

        it("should call next with an error if there is an error logging in", function() {
            req.logIn.callsArgWith(1, "error");
            doLogin(req, res, next);
            expect(next.calledWith("error")).to.be.true;
            expect(req.session.error).to.equal("Error");
        });

        it("should redirect to home page after successful login", function() {
            doLogin(req, res, next);
            expect(res.redirect.calledWith("/")).to.be.true;
            expect(req.session.error).to.equal(null);
            expect(req.session.message).to.equal("Login successful.");
        });
    });

    describe("logout", function() {
        var req = {}, res = {};
        beforeEach(function(){
            req.isAuthenticated = sinon.stub().returns(true);
            res.redirect = sinon.stub();
            req.logout = sinon.stub();
            req.session = {};
        });

        it("should log the user out if they are logged in", function() {
            doLogout(req, res);
            expect(req.logout.called).to.be.true;
            expect(req.session.message).to.equal("Logged out successfully");
            expect(res.redirect.calledWith("/login")).to.be.true;
        });

        it("should redirect to login page regardless", function() {
            req.isAuthenticated.returns(false);
            doLogout(req, res);
            expect(req.logout.called).to.be.false;
            expect(res.redirect.calledWith("/login")).to.be.true;
        });
    });

    describe("locals", function() {
        var req = {}, res = {}, next = sinon.stub();
        req.isAuthenticated = sinon.stub().returns(true);

        beforeEach(function() {
            res.locals = {};
            next.reset();
        });

        it("should set the authentication status on the response", function() {
            locals(req, res, next);
            expect(res.locals.isAuthenticated).to.be.true;
            expect(next.calledOnce).to.be.true;
        });

        it("should set the username on the response if a user is present", function() {
            req.user = {username: "username"};
            locals(req, res, next);
            expect(res.locals.isAuthenticated).to.be.true;
            expect(res.locals.username).to.equal("username");
            expect(next.calledOnce).to.be.true;
        });
    });
});
