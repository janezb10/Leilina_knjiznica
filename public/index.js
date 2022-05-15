const sButton = document.getElementById('s-button');
const sInput = document.getElementById('s-input');
const idButton = document.getElementById('id-button');
const idInput = document.getElementById('id-input');
const bookList = document.getElementById('book-list');
const oneBook = document.getElementById('oneBook');

let books = [];

sButton.addEventListener('click', async (e) => {
    e.preventDefault();
    oneBook.innerHTML = "";
    if(!sInput.value) return;
    const response = await fetch(`${location}api/search?keyword=${sInput.value}`);
    const result = await response.json();
    books = result;
    let resultListHTML = "";
    for(i=0;i<result.length;i++) {
        resultListHTML += `
        <li class="book-in-list" id="${result[i].id}">
            <div>
                <h4>naslov: ${result[i].naslov}</h4>
                <h5>avtor: ${result[i].avtor}</h5>
                <p>področje: ${result[i].podrocje}</p>
            </div>
            <div>
                <p>id: ${result[i].id}</p>
                <p>pozicija: ${result[i].pozicija}</p>
                <button onclick="fullDetails(event)">full</button>
            </div>
        </li>`;
    }
    bookList.innerHTML = resultListHTML;
    sInput.value = "";
})


async function fullDetails(event) {
    const bookID = event.target.parentElement.parentElement.id;
    const book = books.find(e => e.id == bookID);
    let languages = await getLanguages();
    languages = languages
        .map(e => {
           return `<option ${book.jezik == e.jezik ? "selected" : ""} value="${e.id_jezik}">${e.jezik}</option>`;
        })
        .join("");
    let positions = await getPositions()
    positions = positions
        .map(e => {
            return `<option ${book.pozicija == e.pozicija ? "selected" : ""} value="${e.id_pozicija}">${e.pozicija}</option>`;
        })
        .join("");
    let podrocja = await getPodrocja();
    podrocja = podrocja
        .map(e => {
            return `<option ${book.podrocje == e.podrocje ? "selected" : ""} value="${e.id_podrocje}">${e.podrocje}</option>`;
        })
        .join("");
    bookList.innerHTML = "";
    oneBook.innerHTML = `
    <form>
        <p>book ID: ${book.id}</p>
        <label for="book-naslov">naslov: </label>
        <input type="text" id="book-naslov" value="${book.naslov}"> 
        <br />
        <label for="book-avtor">avtor: </label>
        <input type="text" id="book-avtor" value="${book.avtor}"> 
        <br />
        <label for="book-drzava">drzava: </label>
        <input type="text" id="book-drzava" value="${book.drzava || ""}"> 
        <br />
        <label for="book-jezik">jezik: </label>
        <select id="book-jezik">
        ${languages}
        </select>
        <br />
        <label for="book-zbirka">zbirka: </label>
        <input type="text" id="book-zbirka" value="${book.zbirka || ""}">
        <br />
        <label for="book-leto">leto: </leto>
        <input type="number" id="book-leto" value="${book.leto}">
        <br />
        <label for="book-pozicija">pozicija: </label>
        <select id="book-pozicija">
        ${positions}
        </select>
        <br />
        <label for="book-opombe">opombe: </label>
        <textarea id="book-opombe" rows="3" cols="40">${book.opombe || ""}</textarea>
        <br />
        <label for="book-podrocje">podrocje: </label>
        <select id="book-podrocje">
        ${podrocja}
        </select>
    </form>
    `;
    
}

async function getLanguages() {
    const response = await fetch(`${location}api/jeziki`);
    return await response.json();
}

async function getPositions() {
    const response = await fetch(`${location}api/pozicije`);
    return await response.json();
}

async function getPodrocja() {
    const response = await fetch(`${location}api/podrocja`);
    return await response.json();
}