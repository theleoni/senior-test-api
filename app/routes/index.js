
module.exports = app => {

	app.route('/')
	.get(getData = async (req, res) => {

		res.json('API is running...');
	});

}
