module.exports = {
	valid: {
		firstName: "Jane",
		lastName: "Doe",
		email: "valid@mail.com",
		password: "JaneDoe",
	},
	valid2: {
		firstName: "Foo",
		lastName: "Bar",
		email: "foo@bar.com",
		password: "foobar",
	},
	noFirstname: {
		firstName: "",
		lastName: "Doe",
		email: "valid1@mail.com",
		password: "JaneDoe",
	},
	noLastname: {
		firstName: "Jane",
		lastName: "",
		email: "valid2@mail.com",
		password: "JaneDoe",
	},
	noEmail: {
		firstName: "Jane",
		lastName: "Doe",
		email: "",
		password: "JaneDoe",
	},
	invalidEmail: {
		firstName: "Jane",
		lastName: "Doe",
		email: "jones.com",
		password: "JaneDoe",
	},
	noPassword: {
		firstName: "Jane",
		lastName: "Doe",
		email: "valid3@mail.com",
		password: "",
	},

	// login fixtures
	validLogin: {
		email: "valid@mail.com",
		password: "JaneDoe",
	},
	invalidEmailLogin: {
		email: "wrong@mail.com",
		password: "JaneDoe",
	},
	invalidPasswordLogin: {
		email: "valid@mail.com",
		password: "wrong",
	},
};
