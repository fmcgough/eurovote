var expect = require("chai").expect,
    proxyquire = require("proxyquire"),
    sinon = require("sinon");

var models = {};

var signup = proxyquire("../routes/signup", {
    "../models" : models
});

describe("/signup", function() {
    var req = {body: {}}, res = sinon.stub();
    var spy = res.render = sinon.stub();
    var status = res.status = sinon.stub().returns(res);

    beforeEach(function() {
        spy.reset();
        status.reset();
    });

    describe("GET /signup", function() {

        it("should render the signup page", function() {
            signup.display(req, res);
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
            signup.validator(req, {});
            expect(req.form.isValid).to.equal(false);
            expect(req.form.getErrors("email")).to.have.length.at.least(1);
        });

        it("should require a valid email address", function() {
            req.body.email = "not an email address";
            signup.validator(req, {});
            expect(req.form.isValid).to.equal(false);
            expect(req.form.getErrors("email")).to.have.length.at.least(1);
        });

        it("should require a username", function() {
            req.body.email = "an@email.com";
            req.body.username = "";
            signup.validator(req, {});
            expect(req.form.isValid).to.equal(false);
            expect(req.form.getErrors("username")).to.have.length.at.least(1);
        });

        it("should reject non-alphanumeric characters in username", function() {
            req.body.username = "abdthib45$\"%$^&^%*";
            signup.validator(req, {});
            expect(req.form.isValid).to.equal(false);
            expect(req.form.getErrors("username")).to.have.length.at.least(1);
        });

        it("should require a password", function() {
            req.body.password = "";
            signup.validator(req, {});
            expect(req.form.isValid).to.equal(false);
            expect(req.form.getErrors("password")).to.have.length.at.least(1);
        })

        it("should require a password of length at least 8", function() {
            req.body.password = "1234567";
            signup.validator(req, {});
            expect(req.form.isValid).to.equal(false);
            expect(req.form.getErrors("password")).to.have.length.at.least(1);
        });

        it("should require password confirmation", function() {
            req.body.confirmPassword = "";
            signup.validator(req, {});
            expect(req.form.isValid).to.equal(false);
            expect(req.form.getErrors("confirmPassword")).to.have.length.at.least(1);
        });

        it("should require password confirmation to match password", function() {
            req.body.password = "12345678";
            req.body.confirmPassword = "something";
            signup.validator(req, {});
            expect(req.form.isValid).to.equal(false);
            expect(req.form.getErrors("confirmPassword")).to.have.length.at.least(1);
        });

        it("should trim whitespace from username and email", function() {
            req.body.username = "   username   ";
            req.body.email = "  an@example.com      ";
            req.body.password = "12345678";
            req.body.confirmPassword = "12345678";
            signup.validator(req, {});
            expect(req.form.isValid).to.equal(true);
        });
    });

    describe("POST /signup", function() {
        beforeEach(function() {
            req.form = {};
        });

        it("should display the signup page with errors if form is invalid", function() {
            req.form.isValid = false;
            var errors = req.form.errors = ["blah", "blah blah"];

            signup.signup(req, res);
            expect(status.calledOnce).to.equal(true);
            expect(status.args[0][0]).to.equal(400);
            expect(spy.calledOnce).to.equal(true);
            var call = spy.getCall(0);
            expect(call.args[0]).to.equal("signup");
            expect(call.args[1]).to.have.property("errors").that.deep.equals(errors);
        });
    });
});
