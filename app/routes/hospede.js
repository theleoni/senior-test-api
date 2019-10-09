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

	app.route('/hospede')
	.get(getData = async (req, res) => {

		try {

			const HospedeDAO = new app.infra.dao.HospedeDAO(DB);
			let listHospedes = await HospedeDAO.listWithParams();

			const CheckinDAO = new app.infra.dao.CheckinDAO(DB);
			let listCheckin = await CheckinDAO.list();

			if (req.query.checkinForaHotel && req.query.checkinForaHotel === 'true') {
				listHospedes = listHospedes.filter(hospede => {

					let checkins = listCheckin.filter(checkin => checkin.data_entrada && checkin.id_hospede === hospede.id);
					let checkinsAberto = checkins.filter(checkin => !checkin.data_saida);
					return checkins.length && !checkinsAberto.length;
				});
			} else if (req.query.checkinNoHotel && req.query.checkinNoHotel === 'true') {
				listHospedes = listHospedes.filter(hospede => {

					let checkins = listCheckin.filter(checkin => checkin.data_entrada && checkin.id_hospede === hospede.id);
					let checkinsAberto = checkins.filter(checkin => !checkin.data_saida);
					return checkins.length && checkinsAberto.length;
				});
			}

			res.json(listHospedes.map(hospede => {

				let checkinsHospede = listCheckin.filter(checkin => checkin.id_hospede === hospede.id)
				.sort((a, b) => {
					let dataA = new Date(a.data_entrada);
					let dataB = new Date(b.data_entrada);
					if (dataA.getTime() < dataB.getTime()) return 1;
					if (dataB.getTime() > dataA.getTime()) return -1;
					return 0;
				})
				.map(checkin => {

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

					checkin.valorTotalReais = valorTotalReais;
					return checkin;
				});

				;

				return {
					...hospede,
					valorTotalReais: checkinsHospede.reduce((total, checkin) => total + checkin.valorTotalReais, 0),
					valorTotalUltimoCheckinReais: checkinsHospede.length && checkinsHospede[checkinsHospede.length - 1].valorTotalReais || 0,
				};
			}));

		} catch(e) {
			console.log(e);
			res.status(400).json(e);
		}
	})
	.post(postData = async (req, res) => {

		try {

			if (!req.body.nome) {
				throw 'Nome não foi informado corretamente';
			}

			const HospedeDAO = new app.infra.dao.HospedeDAO(DB);
			let hospede = await HospedeDAO.insert({
				nome: req.body.nome,
				documento: req.body.documento,
				telefone: req.body.telefone,
			});

			res.json(`Registro adicionado (ID: ${hospede.id})`);
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

			const HospedeDAO = new app.infra.dao.HospedeDAO(DB);
			let hospede = await HospedeDAO.update(req.query.id, {
				nome: req.body.nome,
				documento: req.body.documento,
				telefone: req.body.telefone,
			});

			res.json(`Registro alterado (ID: ${hospede.id})`);
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

			const HospedeDAO = new app.infra.dao.HospedeDAO(DB);
			await HospedeDAO.delete(req.query.id);
			res.json(`Removido ID ${req.query.id}.`);
		} catch(e) {
			console.log(e);
			res.status(400).json(e);
		}
	});
}
