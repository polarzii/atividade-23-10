const chave = "agenda-de-entregas";

const exemplos = [
    {
        id: 1,
        materia: "Matemática",
        tipo: "prova",
        data: "2026-10-28",
        feita: false
    },
    {
        id: 2,
        materia: "História",
        tipo: "trabalho",
        data: "2026-11-04",
        feita: false
    },
    {
        id: 3,
        materia: "Português",
        tipo: "trabalho",
        data: "2026-10-20",
        feita: true
    },
    {
        id: 4,
        materia: "Inglês",
        tipo: "apresentacao",
        data: "2026-10-30",
        feita: false
    }
];

let entregas;

const dadosSalvos = localStorage.getItem(chave);

if (dadosSalvos === null) {
    entregas = exemplos;
} else {
    try {
        entregas = JSON.parse(dadosSalvos);

        if (!Array.isArray(entregas)) {
            entregas = exemplos;
        }
    } catch {
        entregas = exemplos;
    }
}

let proximoId = entregas.reduce(function (maior, entrega) {
    return Math.max(maior, entrega.id);
}, 0) + 1;

const lista = document.getElementById("lista-entregas");
const formulario = document.getElementById("form-entrega");
const campoMateria = document.getElementById("Materia");
const campoTipo = document.getElementById("categoria");
const campoData = document.getElementById("date");
const filtro = document.getElementById("filtro-categoria");

const totalPendentes = document.getElementById("total-pendentes");
const proximaEntrega = document.getElementById("proxima-entrega");

function salvarEntregas() {
    localStorage.setItem(chave, JSON.stringify(entregas));
}

function formatarData(data) {
    const partes = data.split("-");
    return partes[2] + "/" + partes[1];
}

function nomeTipo(tipo) {
    if (tipo === "prova") {
        return "Prova";
    }

    if (tipo === "trabalho") {
        return "Trabalho";
    }

    return "Apresentação";
}

function criarItem(entrega) {
    const item = document.createElement("li");
    item.classList.add("item-lista");
    item.dataset.tipo = entrega.tipo;

    if (entrega.feita) {
        item.classList.add("feita");
    }

    const informacoes = document.createElement("div");

    const data = document.createElement("span");
    data.classList.add("data-texto");
    data.textContent = formatarData(entrega.data);

    const materia = document.createElement("strong");
    materia.textContent = entrega.materia;

    const etiqueta = document.createElement("span");
    etiqueta.classList.add("tag");
    etiqueta.textContent = nomeTipo(entrega.tipo);

    if (entrega.tipo === "prova") {
        etiqueta.classList.add("tag-prova");
    } else if (entrega.tipo === "trabalho") {
        etiqueta.classList.add("tag-trabalho");
    } else {
        etiqueta.classList.add("tag-apresentacao");
    }

    informacoes.appendChild(data);
    informacoes.appendChild(materia);
    informacoes.appendChild(etiqueta);

    const botoes = document.createElement("div");
    botoes.classList.add("botoes");

    const botaoFeita = document.createElement("button");
    botaoFeita.type = "button";
    botaoFeita.classList.add("btn-padrao");
    botaoFeita.textContent = entrega.feita ? "Reabrir" : "Feita";

    botaoFeita.addEventListener("click", function () {
        const encontrada = entregas.find(function (item) {
            return item.id === entrega.id;
        });

        if (encontrada) {
            encontrada.feita = !encontrada.feita;
            salvarEntregas();
            renderizar();
        }
    });

    const botaoApagar = document.createElement("button");
    botaoApagar.type = "button";
    botaoApagar.classList.add("btn-padrao");
    botaoApagar.textContent = "Apagar";

    botaoApagar.addEventListener("click", function () {
        entregas = entregas.filter(function (item) {
            return item.id !== entrega.id;
        });

        salvarEntregas();
        renderizar();
    });

    botoes.appendChild(botaoFeita);
    botoes.appendChild(botaoApagar);

    item.appendChild(informacoes);
    item.appendChild(botoes);

    return item;
}

function renderizar() {
    lista.replaceChildren();

    const tipoEscolhido = filtro.value;

    const filtradas = entregas.filter(function (entrega) {
        return tipoEscolhido === "tudo" ||
            entrega.tipo === tipoEscolhido;
    });

    filtradas.sort(function (a, b) {
        return a.data.localeCompare(b.data);
    });

    filtradas.forEach(function (entrega) {
        lista.appendChild(criarItem(entrega));
    });

    const pendentes = entregas.filter(function (entrega) {
        return !entrega.feita;
    });

    totalPendentes.textContent = pendentes.length;

    if (pendentes.length === 0) {
        proximaEntrega.textContent = "Nada pendente";
    } else {
        pendentes.sort(function (a, b) {
            return a.data.localeCompare(b.data);
        });

        const proxima = pendentes[0];

        proximaEntrega.textContent =
            proxima.materia + " — " + formatarData(proxima.data);
    }
}

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const materia = campoMateria.value.trim();
    const tipo = campoTipo.value;
    const data = campoData.value;

    if (materia === "" || tipo === "" || data === "") {
        return;
    }

    entregas.push({
        id: proximoId,
        materia: materia,
        tipo: tipo,
        data: data,
        feita: false
    });

    proximoId++;

    salvarEntregas();
    formulario.reset();
    renderizar();
});

filtro.addEventListener("change", function () {
    renderizar();
});

renderizar();
