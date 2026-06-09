const cl = console.log;

// API Configurations
const BASE_URL = 'https://jsonplaceholder.typicode.com';
const ALBUM_URL = `${BASE_URL}/albums`; 

// DOM Elements
const spinner = document.getElementById('spinner');
const albumForm = document.getElementById('albumForm');
const titleControl = document.getElementById('albumTitle');
const userIdControl = document.getElementById('userId');
const addAlbumBtn = document.getElementById('addAlbumBtn');
const updateAlbumBtn = document.getElementById('updateAlbumBtn');
const albumContainer = document.getElementById('albumContainer');

let albumsArr = [];
let updateAlbumId = null;

// SweetAlert2 ची कॉमन मेसेज अलर्ट सिस्टीम
function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 2500,
        showConfirmButton: false
    });
}

// ------------------------------------
// 1. READ (डेटा सर्वरवरून लोड करणे)
// ------------------------------------
function fetchAlbums() {
    spinner.classList.remove('d-none'); // 🔄 स्पिनर चालू
    let xhr = new XMLHttpRequest();
    xhr.open('GET', ALBUM_URL);
    xhr.send(null);

    xhr.onload = function () {
        // 💡 जादूची लाईन: सर्व्हरकडून रिस्पॉन्स येताच सर्वात आधी स्पिनर बंद करा!
        spinner.classList.add('d-none'); 
        
        try {
            if (xhr.status >= 200 && xhr.status <= 299) {
                let data = JSON.parse(xhr.response);
                albumsArr = [...data];
                createAlbumCards(data.slice(0, 20).reverse()); 
            } else {
                snackbar('Failed to load data from server!', 'error');
            }
        } catch (error) {
            console.log("Error inside onload:", error);
        }
    };

    xhr.onerror = function() {
        spinner.classList.add('d-none'); // 🚫 नेटवर्क एरर आल्यास बंद
        snackbar('Network connection error!', 'error');
    };
}
fetchAlbums(); // ऑटोमॅटिकली कॉल होईल

// कार्ड्स तयार करण्याचे सुरक्षित फंक्शन
function createAlbumCards(arr) {
    if (!albumContainer) return;
    if (!arr || arr.length === 0) {
        albumContainer.innerHTML = `<div class="col-12"><p class="text-center py-4">No albums found.</p></div>`;
        return;
    }
    
    let result = '';
    arr.forEach(album => {
        result += `
            <div class="col-md-4 mb-4" id="${album.id}">
                <div class="card h-100 shadow-sm">
                    <div class="card-header bg-secondary text-white">
                        <span class="badge badge-warning float-right">User ID: ${album.userId}</span>
                        <h5 class="m-0">Album #${album.id}</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text text-capitalize font-weight-bold">${album.title}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between bg-white">
                        <button onclick="onEditAlbum(this)" class="btn btn-sm btn-outline-info">Edit</button>
                        <button onclick="onRemoveAlbum(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                    </div>
                </div>
            </div>
        `;
    });
    albumContainer.innerHTML = result;
}

// ------------------------------------
// 2. CREATE (नवीन Album जोडणे)
// ------------------------------------
function onAlbumSubmit(eve) {
    eve.preventDefault();
    
    if (!titleControl.value.trim()) {
        snackbar('Please enter an Album Title!', 'error');
        return;
    }

    let ALBUM_OBJ = {
        title: titleControl.value,
        userId: userIdControl.value
    };

    spinner.classList.remove('d-none'); // 🔄 स्पिनर चालू
    
    let xhr = new XMLHttpRequest();
    xhr.open('POST', ALBUM_URL);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(ALBUM_OBJ));

    xhr.onload = function () {
        try {
            if (xhr.status >= 200 && xhr.status <= 299) {
                let res = JSON.parse(xhr.response);
                
                // सेफ्टीसाठी आलेला किंवा डमी आयडी सेट करणे
                let finalId = res.id || Math.floor(Math.random() * 1000);
                
                albumsArr.unshift({ id: finalId, title: ALBUM_OBJ.title, userId: ALBUM_OBJ.userId });

                let col = document.createElement('div');
                col.className = 'col-md-4 mb-4';
                col.id = finalId;
                col.innerHTML = `
                    <div class="card h-100 shadow-sm">
                        <div class="card-header bg-secondary text-white">
                            <span class="badge badge-warning float-right">User ID: ${ALBUM_OBJ.userId}</span>
                            <h5 class="m-0">Album #${finalId}</h5>
                        </div>
                        <div class="card-body">
                            <p class="card-text text-capitalize font-weight-bold">${ALBUM_OBJ.title}</p>
                        </div>
                        <div class="card-footer d-flex justify-content-between bg-white">
                            <button onclick="onEditAlbum(this)" class="btn btn-sm btn-outline-info">Edit</button>
                            <button onclick="onRemoveAlbum(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                        </div>
                    </div>
                `;
                albumContainer.prepend(col);
                albumForm.reset();
                snackbar(`New album created successfully!`, 'success');
            } else {
                snackbar('Failed to save album!', 'error');
            }
        } catch (err) {
            cl(err);
        } finally {
            spinner.classList.add('d-none'); // 🚫 स्पिनर बंद
        }
    };
}
if(albumForm) albumForm.addEventListener('submit', onAlbumSubmit);

// ------------------------------------
// 3. UPDATE (Part A: फॉर्ममध्ये डेटा लोड करणे)
// ------------------------------------
function onEditAlbum(ele) {
    updateAlbumId = ele.closest('.col-md-4').id;
    let EDIT_URL = `${ALBUM_URL}/${updateAlbumId}`;

    spinner.classList.remove('d-none'); // 🔄 स्पिनर चालू
    let xhr = new XMLHttpRequest();
    xhr.open('GET', EDIT_URL);
    xhr.send(null);

    xhr.onload = function () {
        try {
            if (xhr.status >= 200 && xhr.status <= 299) {
                let res = JSON.parse(xhr.response);
                titleControl.value = res.title;
                userIdControl.value = res.userId;

                addAlbumBtn.classList.add('d-none');
                updateAlbumBtn.classList.remove('d-none');
            } else {
                // फॉलबॅक: नवीन आयडी सर्वरवर नसल्यास लोकल अरेतून डेटा शोधणे
                let local = albumsArr.find(a => a.id == updateAlbumId);
                if(local) {
                    titleControl.value = local.title;
                    userIdControl.value = local.userId;
                    addAlbumBtn.classList.add('d-none');
                    updateAlbumBtn.classList.remove('d-none');
                }
            }
        } catch (err) {
            cl(err);
        } finally {
            spinner.classList.add('d-none'); // 🚫 स्पिनर बंद
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    };
}

// ------------------------------------
// 3. UPDATE (Part B: बदल एडिट करून सेव्ह करणे)
// ------------------------------------
function onUpdateAlbumSubmit() {
    if (!titleControl.value.trim()) {
        snackbar('Album Title cannot be empty!', 'error');
        return;
    }

    let UPDATE_OBJ = {
        title: titleControl.value,
        userId: userIdControl.value
    };

    spinner.classList.remove('d-none'); // 🔄 स्पिनर चालू
    let UPDATE_URL = `${ALBUM_URL}/${updateAlbumId}`;

    let xhr = new XMLHttpRequest();
    xhr.open('PATCH', UPDATE_URL);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(UPDATE_OBJ));

    xhr.onload = function () {
        try {
            if (xhr.status >= 200 && xhr.status <= 299) {
                // UI वरील संबंधित कार्ड अपडेट करणे
                let card = document.getElementById(updateAlbumId);
                if(card) {
                    card.querySelector('.card-text').innerHTML = UPDATE_OBJ.title;
                    card.querySelector('.badge').innerHTML = `User ID: ${UPDATE_OBJ.userId}`;
                }
                
                // लोकल अरे अपडेट करणे
                let idx = albumsArr.findIndex(a => a.id == updateAlbumId);
                if(idx !== -1) {
                    albumsArr[idx].title = UPDATE_OBJ.title;
                    albumsArr[idx].userId = UPDATE_OBJ.userId;
                }

                albumForm.reset();
                addAlbumBtn.classList.remove('d-none');
                updateAlbumBtn.classList.add('d-none');
                snackbar('Album updated successfully!', 'success');
            } else {
                snackbar('Failed to update album!', 'error');
            }
        } catch (err) {
            cl(err);
        } finally {
            spinner.classList.add('d-none'); // 🚫 स्पिनर बंद
        }
    };
}
if(updateAlbumBtn) updateAlbumBtn.addEventListener('click', onUpdateAlbumSubmit);

// ------------------------------------
// 4. DELETE (कन्फर्मेशनसह डिलीट करणे)
// ------------------------------------
function onRemoveAlbum(ele) {
    let removeId = ele.closest('.col-md-4').id;
    let DELETE_URL = `${ALBUM_URL}/${removeId}`;

    Swal.fire({
        title: 'Are you sure?',
        text: "You want to delete this album?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#007bff', 
        cancelButtonColor: '#dc3545',  
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            spinner.classList.remove('d-none'); // 🔄 स्पिनर चालू
            
            let xhr = new XMLHttpRequest();
            xhr.open('DELETE', DELETE_URL);
            xhr.send(null);

            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status <= 299) {
                    let cardHTML = document.getElementById(removeId);
                    if(cardHTML) cardHTML.remove();
                    Swal.fire('Deleted!', 'Album has been deleted.', 'success');
                } else {
                    Swal.fire('Error!', 'Failed to delete album.', 'error');
                }
                spinner.classList.add('d-none'); // 🚫 स्पिनर बंद
            };
        }
    });
}