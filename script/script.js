if (document.getElementById("house")) {
    importarApi('house')
} else if (document.getElementById("senate")) {
    importarApi('senate')
}else {
    iniciarPrograma()
}

async function importarApi(congreso) {
    const dataFetch = await fetch(`https://api.propublica.org/congress/v1/113/${congreso}/members.json`, {
        method: 'GET',
        headers: { 'X-API-Key': '8vznujxeI8gwCpfXW5uQAcEk0sI4ED44CQxme347' }
    })
    const data = await dataFetch.json()
    iniciarPrograma(data)
}

function iniciarPrograma(data) {
    const estadisticas = {
        democratas: [],
        republicanos: [],
        independientes: [],
        primerosRanking: [],
        ultimosRanking: [],
    }

    if (document.getElementById("congress")) {
        var members = data.results[0].members
        var bodyTable = document.querySelector("#table")
        var divTable = document.querySelector("#sin-filtro")
        const checkboxes = Array.from(document.getElementsByName('partyCheck'))
        var selector = document.getElementById("selectState")
        const allStates = members.map(member => member.state)
        var filterParty = []
        var filterState = []
        var filteredMembers = members
        estadosRepetidos(allStates)
        inputListener(checkboxes)
        inputListener(selector)
        printTable()

    } else if (document.querySelector("#attendance")) {
        var members = data.results[0].members
        var miembrosConAsistencia = members.filter((m) => m = m.total_votes > 0)
        var propiedad1 = "missed_votes"
        var propiedad2 = "missed_votes_pct"
        var cuerpoTabla2 = document.getElementById('cuerpoTabla1')
        var cuerpoTabla1 = document.getElementById('cuerpoTabla2')
        ranking(propiedad2)

    } else if (document.querySelector("#partyLoyalty")) {
        var members = data.results[0].members
        var miembrosConAsistencia = members.filter((m) => m = m.total_votes > 0)
        var propiedad1 = ""
        var propiedad2 = "votes_with_party_pct"
        var cuerpoTabla1 = document.getElementById('cuerpoTabla1')
        var cuerpoTabla2 = document.getElementById('cuerpoTabla2')
        ranking(propiedad2)

    } else if (document.querySelector("#index")) {
        var boton = document.querySelector("#boton")
        var texto = document.querySelector("#texto")
        mostrarContenido(boton, texto)
    }


    // INDEX
    function mostrarContenido(boton, contenido,) {
        boton.addEventListener("click", (event) => {
            event.preventDefault()
            contenido.classList.forEach(clase => {
                if (clase == 'ocultar') {
                    contenido.classList.remove('ocultar')
                    contenido.classList.add('mostrar')
                    boton.innerText = "Read less.."
                } else if (clase == 'mostrar') {
                    contenido.classList.remove('mostrar')
                    contenido.classList.add('ocultar')
                    boton.innerText = "Read more.."
                }
            })
        })
    }

    // SENATE Y HOUSE
    function estadosRepetidos(array) {
        const states = []
        array.forEach(estado => {
            if (!states.includes(estado)) {
                states.push(estado)
            }
            return states
        })
        printList(states.sort())
    }

    function printList(array) {
        array.forEach((option) => {
            selector.innerHTML += `<option name="estados" value="${option}">${option}</option>`
        })
    }

    function inputListener(arrayInputs) {
        if (arrayInputs.length < 4) {
            arrayInputs.map(input => {
                input.addEventListener("change", () => {
                    filterParty = []
                    arrayInputs.map(input => {
                        if (input.checked) {
                            filterParty.push(input.value)
                        }
                    })
                    filter()
                })
            })
        }
        if (arrayInputs.type == "select-one") {
            arrayInputs.addEventListener("change", () => {
                bodyTable.innerHTML = ""
                filterState = []
                if (arrayInputs.value !== "ALL") {
                    filterState = members.filter((member) => member.state == arrayInputs.value)
                }
                filter()
            })
        }
    }

    function filter() {
        filteredMembers = members
        divTable.innerHTML = ""
        if (filterState.length > 0) {
            filteredMembers = filterState
        }
        if (filterParty.length > 0 && filterParty.length < 3) {
            filteredMembers = filteredMembers.filter(member => !filterParty.includes(member.party))
        } else if (filterParty.length == 3) {
            filteredMembers = []
            divTable.innerHTML = `<p>Please select a party to continue.</p>`
        }
        printTable()
    }

    function printTable() {
        bodyTable.innerHTML = ""
        filteredMembers.map(member => {
            let fullName = `${member.last_name}, ${member.first_name} ${member.middle_name || ""}`
            bodyTable.innerHTML += `
        <tr>
            <td><a href="${member.url}">${fullName}</a></td>
            <td>${member.party}</td>
            <td>${member.state}</td>
            <td>${member.seniority}</td>
            <td>${member.votes_with_party_pct.toFixed(2)}%</td>
        </tr>`
        })
    }

    // SENATE Y HOUSE - attendance y partyLoyalty
    function ranking(propiedadOrden) {
        var porcentajeArray = Math.ceil(members.length * 0.10)
        var miembrosOrdenados = miembrosConAsistencia.sort((a, b) => b[propiedadOrden] - a[propiedadOrden])
        estadisticas.primerosRanking = miembrosOrdenados.filter((m, i) => m = i < porcentajeArray)
        estadisticas.ultimosRanking = (miembrosOrdenados.filter((m, i) => m = i >= miembrosOrdenados.length - porcentajeArray)).reverse()

        estadisticas.democratas = members.filter(m => m.party == "D")
        estadisticas.republicanos = members.filter(m => m.party == "R")
        estadisticas.independientes = members.filter(m => m.party == "ID")
        var porcentajeD = pctParty(estadisticas.democratas)
        var porcentajeR = pctParty(estadisticas.republicanos)
        var porcentajeID = pctParty(estadisticas.independientes)

        dibujarTablaParty("Democrat", estadisticas.democratas, porcentajeD)
        dibujarTablaParty("Republican", estadisticas.republicanos, porcentajeR)
        dibujarTablaParty("Independent", estadisticas.independientes, porcentajeID)
        dibujarTablaParty("Total", members)

        dibujarTabla(estadisticas.primerosRanking, cuerpoTabla2, propiedad1, propiedad2)
        dibujarTabla(estadisticas.ultimosRanking, cuerpoTabla1, propiedad1, propiedad2)
    }

    function pctParty(miembrosPartido) {
        const miembrosPartidoPct = miembrosPartido.map(m => m.votes_with_party_pct)
        var sumaPctPartido = 0
        miembrosPartidoPct.map(n => sumaPctPartido += n / miembrosPartidoPct.length)
        var totalPartidoPcT = sumaPctPartido.toFixed(2)
        return totalPartidoPcT
    }

    function dibujarTablaParty(nombrePartido, partido, porcentaje) {
        let cuerpoTabla = document.getElementById('cuerpoTabla')
        if (nombrePartido == "Total" || porcentaje == 0) {
            cuerpoTabla.innerHTML += `
        <tr>
            <td>${nombrePartido}</td>
            <td>${partido.length}</td>
            <td></td>
        </tr>`
        } else {
            cuerpoTabla.innerHTML += `
        <tr>
            <td>${nombrePartido}</td>
            <td>${partido.length}</td>
            <td>${porcentaje > 0 ? porcentaje : ""} %</td>
        </tr>`
        }
    }

    function dibujarTabla(array, contenedor, prop1, prop2) {
        array.map(miembro => {
            let fullName = `${miembro.last_name}, ${miembro.first_name} ${miembro.middle_name || ""}`
            let numeroDeVotos = Math.ceil(miembro.total_votes / 100 * miembro.votes_with_party_pct)
            contenedor.innerHTML += `
        <tr>
            <td><a href="${miembro.url}">${fullName}</a></td>
            <td>${prop1 == "" ? numeroDeVotos : miembro[prop1]}</td>
            <td>${miembro[prop2].toFixed(2)}%</td>
        </tr>`
        })
    }
}