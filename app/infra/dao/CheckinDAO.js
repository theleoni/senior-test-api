const TABLE_NAME = 'checkin';

// BD mirror view
const FIELDS = [
	{
		id: 'id', // identificador no bd
		info: 'ID', // descrição do campo (utilizado para mensagens de erro quando 'validateRequired' === TRUE)
		dbRequired: true, // é NOT NULL no bd (pode tem ou não ter 'DEFAULT')
	},{
		id: 'ativo',
		info: 'Ativo',
		dbRequired: true,
	},{
		id: 'id_hospede',
		info: 'ID Hóspede',
		dbRequired: true,
	},{
		id: 'data_entrada',
		info: 'Data Entrada',
		dbRequired: false,
	},{
		id: 'data_saida',
		info: 'Data Saída',
		dbRequired: false,
	},{
		id: 'is_adicional_veiculo',
		info: 'Adicional veículo',
		dbRequired: true,
	}
];

class CheckinDAO {

	constructor(connection) {
		this._connection = connection;
	}

	insert(data) {

		// select all sended attributes e build the sql based on order list
		let dataKeys = Object.keys(data);
		let finalParams = dataKeys.map((key, index) => `\$${index + 1}`).join(', ');
		let sql = `INSERT INTO ${TABLE_NAME} (${dataKeys.join(', ')}) VALUES (${finalParams}) RETURNING *`;
		return this._connection.one( sql, Object.values(data) );
	}

	update(id, data) {

		let dataKeys = Object.keys(data);
		let receivedParams = FIELDS.map(f => f.id).filter(e => data[e] !== undefined);
		let finalParams = receivedParams.map(e => `${e} = \$${dataKeys.indexOf(e) + 1}`).join(', ');

		let sql = `UPDATE ${TABLE_NAME} SET ${finalParams} WHERE id = ${id} RETURNING *`;
		console.log(sql);
		return this._connection.one( sql, Object.values(data) );
	}

	// inactivate an item
	delete(id) {
		return this._connection.any(
			`UPDATE ${TABLE_NAME} SET ativo = false WHERE id = ${id}`,
			[id]
		);
	}

	list() {

		let sql = `SELECT * FROM ${TABLE_NAME} WHERE TRUE ORDER BY id_hospede WHERE ativo`;
		return this._connection.any( sql );
	}

	// // basic get function to list itens
	listWithHospedes(idsHospedes) {

		let sql = `SELECT * FROM ${TABLE_NAME} WHERE ativo AND id_hospede IN (${idsHospedes.join()}) ORDER BY id_hospede`;
		return this._connection.any( sql );
	}

}

module.exports = function() {
	return CheckinDAO;
}
