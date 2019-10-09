const TABLE_NAME = 'hospede';

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
		id: 'documento',
		info: 'Documento',
		dbRequired: false,
	},{
		id: 'telefone',
		info: 'Número de telefone',
		dbRequired: false,
	}
];

class HospedeDAO {

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

	// basic get function to list itens
	listWithParams(params = {}) {

		let colunas = [];
		let parametros = [];

		if (params.nome) {
			colunas.push('nome');
			parametros.push(params.nome);
		}

		if (params.telefone) {
			colunas.push('telefone');
			parametros.push(params.telefone);
		}

		if (params.documento) {
			colunas.push('documento');
			parametros.push(params.documento);
		}

		let sql = `SELECT * FROM ${TABLE_NAME} WHERE ativo${colunas.map((col, index) => ` AND LOWER(${col}) LIKE \$${index + 1}`).join('')}`;
		return this._connection.any( sql, parametros.map(param => `%${param.trim().toLowerCase().replace(/ /g, '%').replace(/[.]*[-]*/g, '')}%`) );
	}

}

module.exports = function() {
	return HospedeDAO;
}
