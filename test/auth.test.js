var expect = require("chai").expect,
    sinon = require("sinon"),
    proxyquire = require("proxyquire");

var models = {},
    User = models.User = {},
    passport = {},
    passportLocal = {},
    bcrypt = {};

passport.use = sinon.stub();
passport.serializeUser = sinon.stub();
passport.deserializeUser = sinon.stub();
var LocalStrategy = passportLocal.Strategy = sinon.stub();

var auth = proxyquire("../routes/auth", {
    "../models": models,
    "passport": passport,
    "passport-local": passportLocal,
    "bcrypt-nodejs": bcrypt
});

describe("authentication", function() {
    var user = {id: 1, username: "username", passwordHash: "HASH"};

    describe("login strategy", function() {
        var authenticator = null;
        var promise = sinon.stub();
        var success = promise.success = sinon.stub().returns(promise);
        var error = promise.error = sinon.stub();
        var done = sinon.stub();

        before(function() {
            if (LocalStrategy.calledOnce) {
                authenticator = LocalStrategy.args[0][1];
            }
        });

        beforeEach(function() {
            promise.reset();
            User.find = sinon.stub().returns(promise);
            success.reset();
            error.reset();
            bcrypt.compare = sinon.stub().callsArgWith(2, null, true);
        });

        it("should use a new LocalStrategy", function() {
            expect(passport.use.calledOnce).to.be.true;
            expect(LocalStrategy.calledOnce).to.be.true;
            expect(LocalStrategy.calledWithNew()).to.be.true;
        });

        it("should use the username and password fields", function() {
            var arg0 = LocalStrategy.args[0][0];
            expect(arg0).to.deep.equal({
                usernameField: "username",
                passwordField: "password"
            });
        });

        it("should use an authenticator which finds users by username", function(){
            authenticator("username", "password", done);
            expect(User.find.calledWith({where: {username: "username"}})).to.be.true;
        });

        it("should call done with an error message if the username does not exist", function(){
            success.callsArg(0);
            authenticator("username", "password", done);
            expect(done.calledWith(null, false, {
                message: "Username or password is incorrect."
            })).to.be.true;
        });

        it("should return an error message if the user's password hash does not match", function() {
            success.callsArgWith(0, user);
            bcrypt.compare.callsArgWith(2, null, false);
            authenticator("username", "password", done);
            expect(done.calledWith(null, false, {
                message: "Username or password is incorrect."
            })).to.be.true;
        });

        it("should call done with an error if there is an error comparing passwords", function(){
            success.callsArgWith(0, user);
            bcrypt.compare.callsArgWith(2, "error", false);
            authenticator("username", "password", done);
            expect(done.calledWith("error")).to.be.true;
        });

        it("should call done with the user if the passwords match", function() {
            success.callsArgWith(0, user);
            bcrypt.compare.callsArgWith(2, null, true);
            authenticator("username", "password", done);
            expect(done.calledWith(null, user)).to.be.true;
        });

        it("should call done with an error message if there is an error retrieving the user", function() {
            error.callsArgWith(0, "error");
            authenticator("username", "password", done);
            expect(done.calledWith("error")).to.be.true;
        });
    });

    describe("serialise user", function() {
        var done = sinon.stub();

        it("should serialise the user using the user id", function(){
            expect(passport.serializeUser.calledOnce).to.equal.true;
            var serialize = passport.serializeUser.args[0][0];
            serialize(user, done);
            expect(done.calledWith(null, user.id));
        });
    });

    describe("deserialise user", function() {
        var done = sinon.stub();
        var promise = sinon.stub();
        User.find = sinon.stub().returns(promise);
        var success = promise.success = sinon.stub();
        var error = promise.error = sinon.stub();

        beforeEach(function() {
            success.reset();
            error.reset();
            done.reset();
        });

        it("should find the user by id", function() {
            expect(passport.deserializeUser.calledOnce).to.equal.true;
            var deserialize = passport.deserializeUser.args[0][0];
            success.callsArgWith(0, user);
            deserialize(user.id, done);
            expect(done.calledWith(null, user)).to.be.true;
        });

        it("should call done with an error if the user id does not exist", function() {
            var deserialize = passport.deserializeUser.args[0][0];
            error.callsArgWith(0, "error");
            var err = new Error("User 1 does not exist");
            deserialize(user.id, done);
            expect(done.calledWith(err)).to.be.true;
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
            auth.locals(req, res, next);
            expect(res.locals.isAuthenticated).to.be.true;
            expect(next.calledOnce).to.be.true;
        });

        it("should set the username on the response if a user is present", function() {
            req.user = {username: "username"};
            auth.locals(req, res, next);
            expect(res.locals.isAuthenticated).to.be.true;
            expect(res.locals.username).to.equal("username");
            expect(next.calledOnce).to.be.true;
        });
    });
});
