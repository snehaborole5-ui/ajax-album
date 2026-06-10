const cl = console.log;
const inputform = document.getElementById('inputform')
const Addalbum = document.getElementById('Addalbum')
const Updatealbum = document.getElementById('Updatealbum')
const spinner = document.getElementById('spinner')
const albumTitle = document.getElementById('albumTitle')
const userId = document.getElementById('userId')

let Base_Url = `https://jsonplaceholder.typicode.com`
let AlbumArr = []

function snackbar(msg, icon){
  Swal.fire({
    title : msg,
    icon : icon,
    timer : 3000,
    showConfirmButton: false
  })
}

function fetchalbums(){
  spinner.classList.remove('d-none')
  let Post_url = `${Base_Url}/albums`

  let xhr = new XMLHttpRequest()
  xhr.open('GET', Post_url)
  xhr.send(null)

  xhr.onload = function() {
    if(xhr.status >= 200 && xhr.status <= 299){
      let allData = JSON.parse(xhr.response)
      // पहिल्या १०० अल्बम्सचा डेटा फिल्टर करून रिव्हर्स दाखवणे
      AlbumArr = allData.slice(0, 100)
      createCards(AlbumArr.reverse())
    }
  }
}

fetchalbums()

function createCards(arr){
  let result = ``

  arr.forEach(ele => {
    result += `<div class="col-md-4 my-4" id='${ele.id}'>
                <div class="card h-100">
                  <div class="card-header">
                    <h2 class="h5 text-truncate">${ele.title}</h2>
                  </div>
                  <div class="card-body">
                    <h3>User Id : ${ele.userId}</h3>
                    <p class="text-muted">Album Id : ${ele.id}</p>
                  </div>
                  <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-danger btn-sm" onclick="OnEdit(this)">Edit</button>
                    <button class="btn btn-primary btn-sm" onclick="OnRemove(this)">Delete</button>
                  </div>
                </div>
              </div>`
  })

  let cardcontainer = document.getElementById('cardcontainer')
  cardcontainer.innerHTML = result
  spinner.classList.add('d-none')
}

function onsubmit(ele){
  ele.preventDefault()
  spinner.classList.remove('d-none')

  let newobj = {
    userId : parseInt(userId.value),
    title : albumTitle.value
  }

  let Post_url = `${Base_Url}/albums`
  let xhr = new XMLHttpRequest()
  xhr.open('POST', Post_url)
  xhr.send(JSON.stringify(newobj))

  xhr.onload = function(){
    if(xhr.status >= 200 && xhr.status <= 299){
      let res = JSON.parse(xhr.response)
      createNewcard(newobj, res)
    } else {
      snackbar('काहीतरी चूक झाली!', 'error')
    }
  }
}

function createNewcard(newobj, res){
  let div = document.createElement('div')
  div.className = 'col-md-4 my-4'
  div.id = res.id

  div.innerHTML = `<div class="card h-100">
                  <div class="card-header">
                    <h2 class="h5 text-truncate">${newobj.title}</h2>
                  </div>
                  <div class="card-body">
                    <h3>User Id : ${newobj.userId}</h3>
                    <p class="text-muted">Album Id : ${res.id}</p>
                  </div>
                  <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-sm btn-danger" onclick="OnEdit(this)">Edit</button>
                    <button class="btn btn-sm btn-primary" onclick="OnRemove(this)">Delete</button>
                  </div>
                </div>`

  let cardcontainer = document.getElementById('cardcontainer')
  cardcontainer.prepend(div)
  inputform.reset()

  snackbar(`The New Album id ${res.id} Is Added Successfully!!`, 'success')
  spinner.classList.add('d-none')
}

function OnEdit(ele){
  let EditId = ele.closest('.col-md-4').id
  spinner.classList.remove('d-none')

  localStorage.setItem('EditId', EditId)
  let Get_url = `${Base_Url}/albums/${EditId}`

  let xhr = new XMLHttpRequest()
  xhr.open('GET', Get_url)
  xhr.send(null)

  xhr.onload = function (){
    if(xhr.status >= 200 && xhr.status <= 299){
      let editObj = JSON.parse(xhr.response)

      albumTitle.value = editObj.title
      userId.value = editObj.userId

      Addalbum.classList.add('d-none')
      Updatealbum.classList.remove('d-none')
    } else {
      snackbar('डेटा आणताना एरर आली!', 'error')
    }
    spinner.classList.add('d-none')
  }
}

function onupdate(){
  spinner.classList.remove('d-none')
  let updateId = localStorage.getItem('EditId')

  let updateObj = {
    userId : parseInt(userId.value),
    title : albumTitle.value,
    id : updateId
  }

  let PUT_Url = `${Base_Url}/albums/${updateId}`
  let xhr = new XMLHttpRequest()
  xhr.open('PUT', PUT_Url)
  // तुमच्या ओरिजनल कोडप्रमाणे स्ट्रिंगीफाय करून ऑब्जेक्ट पाठवणे
  xhr.send(JSON.stringify(updateObj))

  xhr.onload = function(){
    if(xhr.status >= 200 && xhr.status <= 299){
      let div = document.getElementById(updateId)
      
      let h2 = div.querySelector('.card-header h2')
      h2.innerText = updateObj.title

      let h3 = div.querySelector('.card-body h3')
      h3.innerText = `User Id : ${updateObj.userId}`

      inputform.reset()
      Addalbum.classList.remove('d-none')
      Updatealbum.classList.add('d-none')
      
      snackbar(`The Album id ${updateId} Is Updated Successfully!!`, 'success')
    } else {
      snackbar('अपडेट अयशस्वी!', 'error')
    }
    spinner.classList.add('d-none')
  }
}

function OnRemove(ele){
  let removeId = ele.closest('.col-md-4').id
  Swal.fire({
    title: `Are you sure you want to delete album ${removeId}?`,
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then((result) => {
    if (result.isConfirmed) {
      spinner.classList.remove('d-none')
      let delete_url = `${Base_Url}/albums/${removeId}`

      let xhr = new XMLHttpRequest()
      xhr.open('DELETE', delete_url)
      xhr.send(null)

      xhr.onload = function() {
        if(xhr.status >= 200 && xhr.status <= 299){
          ele.closest('.col-md-4').remove()
          snackbar(`The Album id ${removeId} Is Removed Successfully!!`, 'success')
        } else {
          snackbar('डिलीट करताना एरर आली!', 'error')
        }
        spinner.classList.add('d-none')
      }
    }
  });
}

inputform.addEventListener('submit', onsubmit)
Updatealbum.addEventListener('click', onupdate)