CREATE TABLE hospede (
	id SERIAL NOT NULL PRIMARY KEY,
	ativo BOOLEAN NOT NULL DEFAULT true;
	nome TEXT NOT NULL,
	documento TEXT,
	telefone TEXT
);

CREATE TABLE checkin (
	id SERIAL NOT NULL PRIMARY KEY,
	ativo BOOLEAN NOT NULL DEFAULT true;
	id_hospede INTEGER NOT NULL REFERENCES hospede (id),
	data_entrada TEXT,
	data_saida TEXT,
	is_adicional_veiculo BOOLEAN NOT NULL DEFAULT FALSE
);
