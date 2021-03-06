var expect = require("chai").expect,
    proxyquire = require("proxyquire"),
    sinon = require("sinon");

var models = {};
var User = models.User = {};
var bcrypt = {};
var app = sinon.stub();
var auth = { authenticated: sinon.stub() };
var get = app.get = sinon.stub();
var post = app.post = sinon.stub();

var signup = proxyquire("../routes/signup", {
    "../models" : models,
    "bcrypt-nodejs": bcrypt,
    "./auth": auth
});

describe("/signup", function() {
    var req = {body: {}}, res = sinon.stub();
    var spy = res.render = sinon.stub();
    var status = res.status = sinon.stub().returns(res);
    var then, promise, complete;
    var display, submit, validator;

    before(function() {
        signup(app);
        display = get.args[0][1];
        validator = post.args[0][1];
        submit = post.args[0][2];
    });

    beforeEach(function() {
        spy.reset();
        status.reset();
    });

    describe("GET /signup", function() {

        it("should render the signup page", function() {
            display(req, res);
            expect(spy.calledOnce).to.equal(true);
            expect(spy.args[0][0]).to.equal("signup");
            expect(spy.args[0][1]).to.deep.equal({title: "Sign Up"});
        });
    });

    describe("signup form validator", function() {
        beforeEach(function() {
            delete req.form;
            req.body = {};
        });

        it("should require an email", function() {
            req.body.email = "";
            validator(req, {});
            expect(req.form.isValid).to.equal(false);
            expect(req.form.getErrors("email")).to.have.length.at.least(1);
        });

        it("should require a valid email address", function() {
            req.body.email = "not an email address";
            validator(req, {});
            expect(req.form.isValid).to.equal(false);
            expect(req.form.getErrors("email")).to.have.length.at.least(1);
        });

        it("should require a username", function() {
            req.body.email = "an@email.com";
            req.body.username = "";
            validator(req, {});
            expect(req.form.isValid).to.equal(false);
            expect(req.form.getErrors("username")).to.have.length.at.least(1);
        });

        it("should reject non-alphanumeric characters in username", function() {
            req.body.username = "abdthib45$\"%$^&^%*";
            validator(req, {});
            expect(req.form.isValid).to.equal(false);
            expect(req.form.getErrors("username")).to.have.length.at.least(1);
        });

        it("should require a password", function() {
            req.body.password = "";
            validator(req, {});
            expect(req.form.isValid).to.equal(false);
            expect(req.form.getErrors("password")).to.have.length.at.least(1);
        })

        it("should require a password of length at least 8", function() {
            req.body.password = "1234567";
            validator(req, {});
            expect(req.form.isValid).to.equal(false);
            expect(req.form.getErrors("password")).to.have.length.at.least(1);
        });

        it("should require password confirmation", function() {
            req.body.confirmPassword = "";
            validator(req, {});
            expect(req.form.isValid).to.equal(false);
            expect(req.form.getErrors("confirmPassword")).to.have.length.at.least(1);
        });

        it("should require password confirmation to match password", function() {
            req.body.password = "12345678";
            req.body.confirmPassword = "something";
            validator(req, {});
            expect(req.form.isValid).to.equal(false);
            expect(req.form.getErrors("confirmPassword")).to.have.length.at.least(1);
        });

        it("should trim whitespace from username and email", function() {
            req.body.username = "   username   ";
            req.body.email = "  an@example.com      ";
            req.body.password = "12345678";
            req.body.confirmPassword = "12345678";
            validator(req, {});
            expect(req.form.isValid).to.equal(true);
        });
    });

    describe("POST /signup", function() {
        var userCreated = {username: "someuser", id: 1};
        var redirect = res.redirect = sinon.stub();
        var logIn = req.logIn = sinon.stub().callsArg(1);

        beforeEach(function() {
            promise = sinon.stub();
            then = promise.then = sinon.stub()
                .callsArgWith(0, []);
            complete = promise.complete = sinon.stub().callsArgWith(0, null, userCreated);
            User.findAll = sinon.stub().returns(promise);
            User.create = sinon.stub().returns(promise);
            req.form = {
                isValid: true,
                username: "someuser",
                email: "an@example.com",
                password: "12345678",
                confirmPassword: "12345678"
            };
            bcrypt.genSalt = sinon.stub().callsArg(1);
            bcrypt.hash = sinon.stub().callsArgWith(3, null, "TEST_HASH")
            req.session = {};
            redirect.reset();
            logIn.reset();
        });

        it("should display the signup page with errors if form is invalid", function() {
            req.form.isValid = false;
            var errors = req.form.errors = ["blah", "blah blah"];

            submit(req, res);
            expect(status.calledOnce).to.equal(true);
            expect(status.args[0][0]).to.equal(400);
            expect(spy.calledOnce).to.equal(true);
            var call = spy.getCall(0);
            expect(call.args[0]).to.equal("signup");
            expect(call.args[1]).to.have.property("errors").that.deep.equals(errors);
        });

        it("should check for existing users with username", function() {
            then.onFirstCall().callsArgWith(0, [{}]);
            submit(req, res);
            expect(User.findAll.callCount).to.be.at.least(1);

            expectSignupError("Username is already in use");
        });

        function expectSignupError(message) {
            expect(User.create.called).to.equal(false);
            expect(status.calledWith(500)).to.equal(true);
            expect(spy.calledOnce).to.equal(true);
            var call = spy.getCall(0);
            expect(call.args[0]).to.equal("signup");
            expect(call.args[1]).to.have.property("errors");
            expect(call.args[1].errors).to.include(message);
        }

        it("should check for existing users with email address", function() {
            then.onSecondCall().callsArgWith(0, [{}]);
            submit(req, res);
            expect(User.findAll.callCount).to.be.at.least(1);

            expectSignupError("User already exists for this email address");
        });

        it("should create user in database", function() {
            submit(req, res);
            expect(User.findAll.callCount).to.equal(2);
            expect(User.create.callCount).to.equal(1);
            expect(User.create.calledWith(sinon.match({
                username: "someuser",
                email: "an@example.com"
            }))).to.equal(true);
        });

        it("should store user with hashed password", function() {
            submit(req, res);

            var userInserted = User.create.args[0][0];
            expect(userInserted).to.have.property("passwordHash").that.equals("TEST_HASH");
        });

        it("should send a confirmation email");

        it("should login and redirect to the home page", function() {
            submit(req, res);
            expect(logIn.calledOnce).to.equal(true);
            expect(redirect.calledOnce).to.equal(true);
            expect(redirect.calledWith("/")).to.equal(true);
        });
    });
});
