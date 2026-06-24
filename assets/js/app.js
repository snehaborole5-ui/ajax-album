const cl = console.log;

const spinner = document.getElementById('spinner');
const albumContainer = document.getElementById('albumContainer');
const albumForm = document.getElementById('albumForm');
const titleControl = document.getElementById('title');
const userIdControl = document.getElementById('userId');
const addAlbumBtn = document.getElementById('addAlbumBtn');
const updateAlbumBtn = document.getElementById('updateAlbumBtn');

const BASE_URL = `https://jsonplaceholder.typicode.com`;
const ALBUM_URL = `${BASE_URL}/albums`;

let albumsArr = [];
let updateId = null;

function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000
    });
}

function initTooltips() {
    $('[data-toggle="tooltip"]').tooltip({
        boundary: 'window'
    });
}

function fetchAlbums() {
    spinner.style.display = 'flex';
    let xhr = new XMLHttpRequest();
    xhr.open('GET', ALBUM_URL);
    xhr.send(null);

    xhr.onload = function () {
        spinner.style.display = 'none';
        if (xhr.status >= 200 && xhr.status <= 299) {
            let data = JSON.parse(xhr.response);
            albumsArr = [...data];
            renderAlbumCards(albumsArr.reverse());
        } else {
            snackbar('Error while fetching the data', 'error');
        }
    };
    xhr.onerror = function() {
        spinner.style.display = 'none';
        snackbar('Network Error!', 'error');
    };
}

function renderAlbumCards(arr) {
    let result = '';
    arr.forEach(album => {
        result += `
            <div class="col-xl-3 col-md-6 col-12 mb-4" id="album-${album.id}">
                <div class="card h-100 shadow-sm">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <h5 class="card-title text-capitalize font-weight-bold text-truncate" data-toggle="tooltip" title="${album.title}">
                            ${album.title}
                        </h5>
                        <div class="mt-3">
                            <p class="card-text mb-1 text-muted">Album ID : ${album.id}</p>
                            <p class="card-text mb-3 text-muted">User ID : ${album.userId}</p>
                            <div class="d-flex justify-content-between">
                                <button onclick="onEdit('${album.id}')" class="btn btn-sm btn-outline-info px-3">Edit</button>
                                <button onclick="onRemove('${album.id}')" class="btn btn-sm btn-outline-danger px-3">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    albumContainer.innerHTML = result;
    initTooltips();
}

function onAlbumSubmit(eve) {
    eve.preventDefault();

    let ALBUM_OBJ = {
        title: titleControl.value,
        userId: userIdControl.value
    };

    spinner.style.display = 'flex';
    let xhr = new XMLHttpRequest();
    xhr.open('POST', ALBUM_URL);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(ALBUM_OBJ));

    xhr.onload = function () {
        spinner.style.display = 'none';
        if (xhr.status >= 200 && xhr.status <= 299) {
            let res = JSON.parse(xhr.response);
            
            res.title = res.title || ALBUM_OBJ.title;
            res.userId = res.userId || ALBUM_OBJ.userId;

            albumForm.reset();

            let div = document.createElement('div');
            div.className = 'col-xl-3 col-md-6 col-12 mb-4';
            div.id = `album-${res.id}`;

            div.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <h5 class="card-title text-capitalize font-weight-bold text-truncate" data-toggle="tooltip" title="${res.title}">
                            ${res.title}
                        </h5>
                        <div class="mt-3">
                            <p class="card-text mb-1 text-muted">Album ID : ${res.id}</p>
                            <p class="card-text mb-3 text-muted">User ID : ${res.userId}</p>
                            <div class="d-flex justify-content-between">
                                <button onclick="onEdit('${res.id}')" class="btn btn-sm btn-outline-info px-3">Edit</button>
                                <button onclick="onRemove('${res.id}')" class="btn btn-sm btn-outline-danger px-3">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            albumContainer.insertBefore(div, albumContainer.firstChild);
            initTooltips();
            snackbar(`New album with id ${res.id} created !!!`, 'success');
        }
    };
}

function onEdit(id) {
    updateId = id;
    let EDIT_URL = `${BASE_URL}/albums/${updateId}`;

    spinner.style.display = 'flex';
    let xhr = new XMLHttpRequest();
    xhr.open('GET', EDIT_URL);
    xhr.send(null);

    xhr.onload = function () {
        spinner.style.display = 'none';
        
        let cardElement = document.getElementById(`album-${id}`);
        let localTitle = cardElement ? cardElement.querySelector('.card-title').innerText : '';
        let localUser = '1';
        if (cardElement) {
            let textNodes = cardElement.querySelectorAll('.card-text');
            textNodes.forEach(node => {
                if (node.innerText.includes('User ID')) {
                    localUser = node.innerText.replace('User ID : ', '').trim();
                }
            });
        }

        if (xhr.status >= 200 && xhr.status <= 299) {
            let res = JSON.parse(xhr.response);
            titleControl.value = res.title || localTitle;
            userIdControl.value = res.userId || localUser;
        } else {
            titleControl.value = localTitle;
            userIdControl.value = localUser;
        }

        addAlbumBtn.classList.add('d-none');
        updateAlbumBtn.classList.remove('d-none');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
}

function onUpdateAlbum() {
    let UPDATE_OBJ = {
        title: titleControl.value,
        userId: userIdControl.value
    };

    spinner.style.display = 'flex';
    let UPDATE_URL = `${BASE_URL}/albums/${updateId}`;

    let xhr = new XMLHttpRequest();
    xhr.open('PATCH', UPDATE_URL);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(UPDATE_OBJ));

    xhr.onload = function () {
        spinner.style.display = 'none';
        
        let cardElement = document.getElementById(`album-${updateId}`);
        if(cardElement) {
            cardElement.querySelector('.card-title').innerHTML = UPDATE_OBJ.title;
            cardElement.querySelector('.card-title').setAttribute('title', UPDATE_OBJ.title);
            
            let textNodes = cardElement.querySelectorAll('.card-text');
            textNodes.forEach(node => {
                if (node.innerText.includes('User ID')) {
                    node.innerHTML = `User ID : ${UPDATE_OBJ.userId}`;
                }
            });
            
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            cardElement.classList.add('highlight');
            setTimeout(() => { cardElement.classList.remove('highlight'); }, 3000);
        }

        initTooltips();
        albumForm.reset();

        updateId = null;
        addAlbumBtn.classList.remove('d-none');
        updateAlbumBtn.classList.add('d-none');
        snackbar('Album updated successfully !!!', 'success');
    };
}

function onRemove(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to remove this album?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Remove'
    }).then(result => {
        if (result.isConfirmed) {
            spinner.style.display = 'flex';
            let REMOVE_URL = `${BASE_URL}/albums/${id}`;

            let xhr = new XMLHttpRequest();
            xhr.open('DELETE', REMOVE_URL);
            xhr.send(null);

            xhr.onload = function () {
                spinner.style.display = 'none';
                if (xhr.status >= 200 && xhr.status <= 299) {
                    let cardElement = document.getElementById(`album-${id}`);
                    if(cardElement) cardElement.remove();
                    snackbar('Album removed successfully !!!', 'success');
                }
            };
        }
    });
}

fetchAlbums();
albumForm.addEventListener('submit', onAlbumSubmit);
updateAlbumBtn.addEventListener('click', onUpdateAlbum);