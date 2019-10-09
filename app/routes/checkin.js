const DB = require("../infra/connectionFactory").getDb();

const beetweenDates = function(startDate, endDate) {
	var dates = [],
	currentDate = startDate,
	addDays = function(days) {
		var date = new Date(this.valueOf());
		date.setDate(date.getDate() + days);
		return date;
	};
	while (currentDate <= endDate) {
		dates.push(currentDate);
		currentDate = addDays.call(currentDate, 1);
	}
	return dates;
};

module.exports = app => {

	app.route('/checkin')
	.get(getData = async (req, res) => {

		try {

			const HospedeDAO = new app.infra.dao.HospedeDAO(DB);
			let listHospedes = await HospedeDAO.listWithParams({
				nome: req.query.nome,
				telefone: req.query.telefone,
				documento: req.query.documento,
			});

			const CheckinDAO = new app.infra.dao.CheckinDAO(DB);
			let listCheckin = listHospedes.length && await CheckinDAO.listWithHospedes(listHospedes.map(e => e.id)) || [];

			res.json(listCheckin.map(checkin => {

				let valorTotalReais = 0;
				if (checkin.data_entrada && checkin.data_saida) {

					let dataEntrada = new Date(checkin.data_entrada);
					let dataSaida = new Date(checkin.data_saida);
					if (dataSaida.getHours() > 16 || (dataSaida.getHours() === 16 && dataSaida.getMinutes() > 30)) {
						dataSaida.setDate(dataSaida.getDate() + 1);
					}
					valorTotalReais = beetweenDates(dataEntrada, dataSaida).reduce((total, data) => {

						let valorDiaria = 0;
						if (data.getDay() >= 1 && data.getDay() <= 5) { // dia de semana
							valorDiaria += 120;
							if (checkin.is_adicional_veiculo) {
								valorDiaria += 15;
							}
						} else { // final de semana
							valorDiaria += 150;
							if (checkin.is_adicional_veiculo) {
								valorDiaria += 20;
							}
						}
						return total + valorDiaria;
					}, 0);
				}

				return {
					id: checkin.id,
					hospede: listHospedes.filter(hospede => hospede.id === checkin.id_hospede)[0],
					dataEntrada: checkin.data_entrada,
					dataSaida: checkin.data_saida,
					adicionalVeiculo: checkin.is_adicional_veiculo,
					valorTotalReais,
				};
			}));
		} catch(e) {
			console.log(e);
			res.status(400).json(e);
		}
	})
	.post(postData = async (req, res) => {

		try {

			if (req.body.id_hospede === undefined) {
				throw 'Hóspede não foi informado corretamente';
			}

			const CheckinDAO = new app.infra.dao.CheckinDAO(DB);
			let checkin = await CheckinDAO.insert({
				id_hospede: req.body.id_hospede,
				data_entrada: req.body.data_entrada,
				data_saida: req.body.data_saida,
				is_adicional_veiculo: req.body.is_adicional_veiculo ? req.body.is_adicional_veiculo === 'true' : undefined,
			});

			res.json(`Registro adicionado (ID: ${checkin.id})`);
		} catch(e) {
			console.log(e);
			res.status(400).json(e);
		}
	})
	.put(putData = async (req, res) => {

		try {

			if (!(req.query.id)) {
				res.status(400).json(`Campo 'ID' é obrigatório!`);
				return;
			}

			const CheckinDAO = new app.infra.dao.CheckinDAO(DB);
			let checkin = await CheckinDAO.update(req.query.id, {
				id_hospede: req.body.id_hospede,
				data_entrada: req.body.data_entrada,
				data_saida: req.body.data_saida,
				is_adicional_veiculo: req.body.is_adicional_veiculo ? req.body.is_adicional_veiculo === 'true' : undefined,
			});

			res.json(`Registro alterado (ID: ${checkin.id})`);
		} catch(e) {
			console.log(e);
			res.status(400).json(e);
		}
	})
	.delete(deleteData = async (req, res) => {

		try {

			if (!(req.query.id)) {
				res.status(400).json(`Campo 'ID' é obrigatório!`);
				return;
			}

			const CheckinDAO = new app.infra.dao.CheckinDAO(DB);
			await CheckinDAO.delete(req.query.id);
			res.json(`Removido ID ${req.query.id}.`);
		} catch(e) {
			console.log(e);
			res.status(400).json(e);
		}
	});
}
