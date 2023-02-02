const tableError = document.querySelector('.table__error'),
      reloadBtn = tableError.querySelector('.table-error__btn'),
      addClientBtn = document.querySelector('.clients__btn'),
      searchInput = document.querySelector('.header__input'),
      autocompleteContainer = document.querySelector('.header__input-container'),
      autocompleteList = document.querySelector('.header-autocomplete__list'),
      searchInputClearBtn = document.querySelector('.header__btn_clear');

let clientsArr = [],
    contactsCount,
    autocompleteLength = 0,
    timer,
    autocompleteTimer;

reloadBtn.onclick = () => {
  tableError.classList.add('invisible');
  tableError.querySelector('.table-error__descr').textContent = 'Потеряно соединение с сервером';
  getClients().catch(error => {
    hidePreloader();
    tableError.classList.remove('invisible');
  });
}

function showPreloader() {
  const preloader = document.querySelector('.preloader');

  preloader.classList.remove('invisible');
}

function hidePreloader() {
  const preloader = document.querySelector('.preloader');

  preloader.classList.add('invisible');
}

async function getClients(search = '') {
  showPreloader();

  const response = await fetch(`http://localhost:3000/api/clients?search=${search}`);

  if (response.ok) {
    const data = await response.json();
    if (search === '') {
      clientsArr = data.slice();
      drawTable(data);
    }
    console.log(data);
    drawAutocompleteList(data);
  } else {
    tableError.classList.remove('invisible');
    tableError.querySelector('.table-error__descr').textContent = 'Серверу не удаётся обработать запрос';
  }

  hidePreloader();
}

async function createClient(newClient, form, formBtn) {
  const errorLabel = document.createElement('div');
  errorLabel.classList.add('form__error');

  const response = await fetch('http://localhost:3000/api/clients', {
    method: 'POST',
    body: JSON.stringify(newClient),
    headers: {
      'Content-Type': 'application/json',
    }
  }).catch(error => {
    form.querySelector('.form__btn_submit').classList.remove('active');
    errorLabel.textContent = 'Потеряно соединение с сервером';
    form.insertBefore(errorLabel, formBtn);
  });

  if (form.querySelector('.form__error') !== null) {
    form.querySelector('.form__error').remove();
  }

  form.querySelector('.form__btn_submit').classList.remove('active');

  if (response.ok) {
    closeForm(form);
  } else if (response.status >= 500) {
    errorLabel.textContent = 'Ошибка на стороне сервера!';
    form.insertBefore(errorLabel, formBtn);
  } else {
    errorLabel.textContent = 'Что-то пошло не так...';
    form.insertBefore(errorLabel, formBtn);
  }

  const data = await response.json();

  console.log(data);
}

async function changeClient(changedClient, clientID, form, formBtn) {

  const response = await fetch(`http://localhost:3000/api/clients/${clientID}`, {
    method: 'PATCH',
    body: JSON.stringify(changedClient),
    headers: {
      'Content-Type': 'application/json',
    }
  }).catch(error => {
    form.querySelector('.form__btn_submit').classList.remove('active');
    errorLabel.textContent = 'Потеряно соединение с сервером';
    form.insertBefore(errorLabel, formBtn);
  });

  const errorLabel = document.createElement('div');
  errorLabel.classList.add('form__error');

  if (form.querySelector('.form__error') !== null) {
    form.querySelector('.form__error').remove();
  }

  form.querySelector('.form__btn_submit').classList.remove('active');

  if (response.ok) {
    closeForm(form);
  } else if (response.status === 404) {
    errorLabel.textContent = 'Не удалось изменить клиента, так как его не существует!';
    form.insertBefore(errorLabel, formBtn);
  } else if (response.status >= 500) {
    errorLabel.textContent = 'Ошибка на стороне сервера!';
    form.insertBefore(errorLabel, formBtn);
  } else {
    errorLabel.textContent = 'Что-то пошло не так...';
    form.insertBefore(errorLabel, formBtn);
  }

  const data = await response.json();

  console.log(data);
}

async function deleteClient(clientId, form, formBtn) {

  const response = await fetch(`http://localhost:3000/api/clients/${clientId}`, {
    method: 'DELETE',
  })

  const errorLabel = document.createElement('div');
  errorLabel.classList.add('form__error');

  if (form.querySelector('.form__error') !== null) {
    form.querySelector('.form__error').remove();
  }

  form.querySelector('.form__btn_submit').classList.remove('active');

  if (response.ok) {
    closeForm(form);
  } else if (response.status === 404) {
    errorLabel.textContent = 'Не удалось удалить клиента, так как его не существует!';
    form.insertBefore(errorLabel, formBtn);
  } else if (response.status >= 500) {
    errorLabel.textContent = 'Ошибка на стороне сервера!';
    form.insertBefore(errorLabel, formBtn);
  } else {
    errorLabel.textContent = 'Что-то пошло не так...';
    form.insertBefore(errorLabel, formBtn);
  }

  const data = await response.json();

  console.log(data);
}

function drawAutocompleteList(data) {
  autocompleteList.innerHTML = '';
  autocompleteLength = 0;

  data.forEach((client, index) => {
    if (index >= 10) {
      return;
    }

    const item = document.createElement('li'),
          btn = document.createElement('button');

    btn.textContent = `${client.name} ${client.surname}`;
    btn.classList.add('btn', 'header-autocomplete__btn');
    btn.setAttribute('tabindex', -1);
    btn.dataset.index = index;
    btn.dataset.id = client.id;
    item.classList.add('header-autocomplete__item');
    item.append(btn);
    autocompleteList.append(item);
    autocompleteLength++;

    btn.onclick = () => {
      clearTimeout(autocompleteTimer);
      searchInputClearBtn.classList.add('visible');
      drawTable(clientsArr, btn.dataset.id, false);
      searchInput.value = btn.textContent;
      getClients(searchInput.value);
    }
    btn.onkeydown = (e) => {
      clearTimeout(autocompleteTimer);
      if (e.key === 'ArrowDown') {
        if (parseInt(btn.dataset.index) + 1 === autocompleteLength) {
          searchInput.focus({ preventScroll: true });
        } else {
          document.querySelector(`.header-autocomplete__btn[data-index="${parseInt(btn.dataset.index) + 1}"]`).focus({ preventScroll: true });
        }
      } else if (e.key === 'ArrowUp') {
        if (parseInt(btn.dataset.index) === 0) {
          searchInput.focus({ preventScroll: true });
        } else {
          document.querySelector(`.header-autocomplete__btn[data-index="${parseInt(btn.dataset.index) - 1}"]`).focus({ preventScroll: true });
        }
      } else if (e.key === 'Tab') {
        searchInput.focus({ preventScroll: true });
      }
    }
  })

  if (autocompleteList.innerHTML === '') {
    autocompleteList.classList.remove('visible');
  } else {
    autocompleteList.classList.add('visible');
  }
}

function drawTable(data, matchesClientId = null, anim = true) {
  const tbody = document.querySelector('tbody');

  tbody.textContent = '';

  data.forEach((client, index) => {
    const row = document.createElement('tr'),
          idCell = document.createElement('td'),
          fullNameCell = document.createElement('td'),
          dateCell = document.createElement('td'),
          lastChangesCell = document.createElement('td'),
          contactsCell = document.createElement('td'),
          contactsList = document.createElement('ul'),
          itemShowMore = document.createElement('li'),
          btnShowMore = document.createElement('button'),
          actionsCell = document.createElement('td'),
          actionsBtnContainer = document.createElement('div'),
          changeBtn = document.createElement('a'),
          deleteBtn = document.createElement('button');

    let contactsCount = 0;

    idCell.dataset.name = 'id';
    idCell.textContent = client.id;

    fullNameCell.textContent = `${client.surname} ${client.name} ${client.lastName}`;
    fullNameCell.dataset.name = 'fullname';

    dateCell.innerHTML = `${new Date(client.createdAt).toLocaleDateString('ru-RU')} <span class="clients-table__time">${new Date(client.createdAt).getHours().toString().padStart(2, "0")}:${new Date(client.createdAt).getMinutes().toString().padStart(2, "0")}</span>`;
    dateCell.dataset.name = 'creationdate';

    lastChangesCell.innerHTML = `${new Date(client.updatedAt).toLocaleDateString('ru-RU')} <span class="clients-table__time">${new Date(client.updatedAt).getHours().toString().padStart(2, "0")}:${new Date(client.updatedAt).getMinutes().toString().padStart(2, "0")}</span>`;
    lastChangesCell.dataset.name = 'lastchanges';

    contactsList.classList.add('list');
    contactsList.classList.add('table__contacts-list');
    client.contacts.forEach(contact => {
      const contactItem = createContactIcon(contact);
      contactsList.append(contactItem);
      createTooltip(contactItem);
      contactsCount++;

      if (contactsCount > 4) {
        btnShowMore.textContent = `+${contactsCount - 4}`;
        contactItem.classList.add('hidden');
        contactItem.classList.add('display');
      }
    })

    if (contactsCount > 4) {
      itemShowMore.classList.add('table__contacts-item');
      btnShowMore.classList.add('btn');
      btnShowMore.classList.add('table__contacts-btn_showmore');

      itemShowMore.append(btnShowMore);
      contactsList.append(itemShowMore);

      btnShowMore.onclick = () => {
        itemShowMore.remove();
        contactsList.querySelectorAll('.table__contacts-item.hidden').forEach((item, index) => {
          item.classList.remove('display');
          let timer = setTimeout(() => {
            item.classList.remove('hidden');
          }, 100 * index);
        })
      }
    }

    contactsCell.dataset.name = 'contacts';
    contactsCell.append(contactsList);

    changeBtn.textContent = 'Изменить';
    changeBtn.classList.add('btn');
    changeBtn.classList.add('btn_change');
    changeBtn.href = `#id${client.id}`;
    changeBtn.onclick = () => {
      changeBtn.classList.add('active');
      let timer = setTimeout(() => {
        changeBtn.classList.remove('active');
        hashHandler().catch(error => {
          openErrorModal('Не удаётся получить данные клиента, т.к. потеряно соединение с сервером');
        });
      }, 300)
    }
    deleteBtn.textContent = 'Удалить';
    deleteBtn.classList.add('btn');
    deleteBtn.classList.add('btn_delete');
    deleteBtn.onclick = () => {
      deleteBtn.classList.add('active');
      let timer = setTimeout(() => {
        deleteBtn.classList.remove('active');
        openDeleteForm(client);
      }, 300)
    }
    actionsBtnContainer.classList.add('actions__btn-container');
    actionsBtnContainer.append(changeBtn, deleteBtn);
    actionsCell.append(actionsBtnContainer);
    actionsCell.dataset.name = 'actions';
    row.append(idCell, fullNameCell, dateCell, lastChangesCell, contactsCell, actionsCell);
    tbody.append(row);

    if (matchesClientId === client.id) {
      row.classList.add('row__matches');
      row.scrollIntoView();
    }

    if (anim) {
      row.classList.add('invisible');

      let timer = setTimeout(() => {
        row.classList.remove('invisible');
      }, 50 * index)
    }
  })
}

function createContactIcon(contact) {
  const contactItem = document.createElement('li'),
        contactsArr = [
          { type: 'phone', label: 'Телефон', svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.7"><circle cx="8" cy="8" r="8" fill="#9873FF" data-fill /><path d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z" fill="white"/></g></svg>' },
          { type: 'email', label: 'Email', svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z" fill="#9873FF" data-fill /></svg>' },
          { type: 'facebook', label: 'Facebook', svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z" fill="#9873FF" data-fill /></svg>' },
          { type: 'vk', label: 'VK', svg: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z" fill="#9873FF" data-fill /></svg>' },
          { type: 'twitter', label: 'Twitter', svg: '<?xml version="1.0" ?><svg width="16" height="16" id="Capa_1" style="enable-background:new 0 0 112.197 112.197;" version="1.1" viewBox="0 0 112.197 112.197" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><circle cx="56.099" cy="56.098" r="56.098" style="fill:#9873FF;" data-fill /><g><path d="M90.461,40.316c-2.404,1.066-4.99,1.787-7.702,2.109c2.769-1.659,4.894-4.284,5.897-7.417    c-2.591,1.537-5.462,2.652-8.515,3.253c-2.446-2.605-5.931-4.233-9.79-4.233c-7.404,0-13.409,6.005-13.409,13.409    c0,1.051,0.119,2.074,0.349,3.056c-11.144-0.559-21.025-5.897-27.639-14.012c-1.154,1.98-1.816,4.285-1.816,6.742    c0,4.651,2.369,8.757,5.965,11.161c-2.197-0.069-4.266-0.672-6.073-1.679c-0.001,0.057-0.001,0.114-0.001,0.17    c0,6.497,4.624,11.916,10.757,13.147c-1.124,0.308-2.311,0.471-3.532,0.471c-0.866,0-1.705-0.083-2.523-0.239    c1.706,5.326,6.657,9.203,12.526,9.312c-4.59,3.597-10.371,5.74-16.655,5.74c-1.08,0-2.15-0.063-3.197-0.188    c5.931,3.806,12.981,6.025,20.553,6.025c24.664,0,38.152-20.432,38.152-38.153c0-0.581-0.013-1.16-0.039-1.734    C86.391,45.366,88.664,43.005,90.461,40.316L90.461,40.316z" style="fill:#FFFFFF;"/></g></g><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/></svg>' },
          { type: 'whatsapp', label: 'Whatsapp', svg: '<svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48Z" fill="#9873FF" data-fill /><path fill-rule="evenodd" clip-rule="evenodd" d="M24.7911 37.3525H24.7852C22.3967 37.3517 20.0498 36.7524 17.9653 35.6154L10.4 37.6L12.4246 30.2048C11.1757 28.0405 10.5186 25.5855 10.5196 23.0702C10.5228 15.2017 16.9248 8.79999 24.7909 8.79999C28.6086 8.80164 32.1918 10.2879 34.8862 12.9854C37.5806 15.6828 39.0636 19.2683 39.0621 23.0815C39.059 30.9483 32.6595 37.3493 24.7911 37.3525ZM18.3159 33.0319L18.749 33.2889C20.5702 34.3697 22.6578 34.9415 24.7863 34.9423H24.7911C31.3288 34.9423 36.6499 29.6211 36.6525 23.0807C36.6538 19.9112 35.4212 16.9311 33.1817 14.689C30.9422 12.4469 27.964 11.2115 24.7957 11.2104C18.2529 11.2104 12.9318 16.5311 12.9292 23.0711C12.9283 25.3124 13.5554 27.4951 14.7427 29.3836L15.0248 29.8324L13.8265 34.2095L18.3159 33.0319ZM31.4924 26.154C31.7411 26.2742 31.9091 26.3554 31.9808 26.4751C32.0699 26.6238 32.0699 27.3378 31.7729 28.1708C31.4756 29.0038 30.051 29.764 29.3659 29.8663C28.7516 29.9582 27.9741 29.9965 27.1199 29.725C26.602 29.5607 25.9379 29.3413 25.0871 28.9739C21.7442 27.5304 19.485 24.2904 19.058 23.678C19.0281 23.6351 19.0072 23.6051 18.9955 23.5895L18.9927 23.5857C18.804 23.3339 17.5395 21.6468 17.5395 19.9008C17.5395 18.2582 18.3463 17.3973 18.7177 17.001C18.7432 16.9739 18.7666 16.9489 18.7875 16.926C19.1144 16.569 19.5007 16.4797 19.7384 16.4797C19.9761 16.4797 20.2141 16.4819 20.4219 16.4924C20.4475 16.4937 20.4742 16.4935 20.5017 16.4933C20.7095 16.4921 20.9686 16.4906 21.2242 17.1045C21.3225 17.3407 21.4664 17.691 21.6181 18.0604C21.9249 18.8074 22.264 19.6328 22.3236 19.7522C22.4128 19.9307 22.4722 20.1389 22.3533 20.3769C22.3355 20.4126 22.319 20.4463 22.3032 20.4785C22.2139 20.6608 22.1483 20.7948 21.9967 20.9718C21.9372 21.0413 21.8756 21.1163 21.814 21.1913C21.6913 21.3407 21.5687 21.4901 21.4619 21.5965C21.2833 21.7743 21.0975 21.9672 21.3055 22.3242C21.5135 22.6812 22.2292 23.8489 23.2892 24.7945C24.4288 25.8109 25.4192 26.2405 25.9212 26.4582C26.0192 26.5008 26.0986 26.5352 26.1569 26.5644C26.5133 26.7429 26.7213 26.713 26.9294 26.4751C27.1374 26.2371 27.8208 25.4338 28.0584 25.0769C28.2961 24.7201 28.5339 24.7795 28.8607 24.8984C29.1877 25.0176 30.9408 25.8801 31.2974 26.0586C31.367 26.0934 31.4321 26.1249 31.4924 26.154Z" fill="#FFFFFF"/></svg>' },
          { type: 'instagram', label: 'Instagram', svg: '<?xml version="1.0" ?><svg width="16" width="16" enable-background="new 0 0 512 512" id="Layer_1" version="1.1" viewBox="0 0 512 512" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Layer_1_1_"><circle cx="256" cy="256" fill="#9873FF" data-fill r="238.2"/></g><g id="Layer_2_1_"><g><path d="M385.1,258c0,18.2,0,36.5,0,54.7c0,30.9-15,52.3-41.9,66.2c-11,5.7-22.9,8.2-35.3,8.2    c-35.1,0-70.3,0.6-105.4-0.2c-28.2-0.6-50.9-13-66.1-37.3c-6.3-10.2-9.4-21.4-9.5-33.3c0-38.5-0.2-77.1,0-115.6    c0.2-26.4,13.1-45.9,35-59.7c13-8.1,27.4-11.8,42.7-11.9c34.2,0,68.3-0.2,102.6,0c26.4,0.2,48.3,10.5,64.5,31.7    c8.9,11.7,13.3,25.3,13.3,40.1C385.1,219.8,385.1,238.9,385.1,258z M365.9,258.2c0-19.1,0-38.4,0-57.5c0-10.4-3.1-19.9-9.2-28.1    c-11.9-16.1-28.4-24-48.1-24.2c-34.7-0.4-69.4-0.1-104.1-0.1c-10.8,0-21,2.5-30.3,7.9c-18,10.4-28,25.6-27.9,46.8    c0.1,37.3,0,74.8,0,112.2c0,10.5,3.1,20.1,9.3,28.4c11.9,16.1,28.4,23.9,48.1,24.1c34.9,0.4,69.8,0.1,104.6,0.1    c7.9,0,15.6-1.7,23-4.7c19.6-7.9,35.3-26.2,34.7-50.6C365.5,294.4,365.9,276.3,365.9,258.2z" fill="#FFFFFF"/><path d="M256,313.1c-33.7-0.1-60.6-27-60.5-60.5c0.1-32.7,27.5-59.3,60.9-59.2c33.4,0.1,60.5,27.1,60.4,60.2    C316.8,286.5,289.6,313.2,256,313.1z M256.5,212.6c-22.9,0-41.4,18.1-41.6,40.5c0,22.3,18.5,40.6,41.1,40.7    c22.9,0,41.6-18.1,41.7-40.4C297.7,231,279.2,212.6,256.5,212.6z" fill="#FFFFFF"/><path d="M336.7,188.5c0,7.3-5.8,13.3-12.9,13.2c-7,0-12.7-6.1-12.6-13.4c0-7.2,5.8-13.1,12.8-13.1    C331,175.2,336.7,181.2,336.7,188.5z" fill="#FFFFFF"/></g></g></svg>' }
        ];

  contactsArr.forEach(item => {
    if (contact.type.localeCompare(item.type) === 0) {
      contactItem.innerHTML = item.svg;
      contactItem.dataset.tooltip = `${item.label}: ${contact.value}`;
      contactItem.classList.add('table__contacts-item');
    }
  })

  return contactItem;
}

function createTooltip(element) {
  let timer;

  element.onmouseenter = () => {
    if (element.querySelector('.tooltip') === null) {
      const tooltip = document.createElement('div');

      tooltip.textContent = element.dataset.tooltip;
      tooltip.classList.add('tooltip');
      tooltip.classList.add('invisible');

      element.append(tooltip);
      timer = setTimeout(() => {
        tooltip.classList.remove('invisible');
      }, 200)
    } else {
      clearTimeout(timer);
      element.querySelector('.tooltip').classList.remove('invisible');
    }
  }

  element.onmouseleave = () => {
    timer = setTimeout(() => {
      let tooltip = element.querySelector('.tooltip');

      if (element.querySelector('.tooltip') !== null) {
        clearTimeout(timer);

        tooltip.classList.add('invisible');
        timer = setTimeout(() => {
          tooltip.remove();
        }, 200)
      }
    }, 500);
  }
}

function openChangeForm(client) {
  const fixedOverlay = document.querySelector('.fixed-overlay'),
        changeForm = document.querySelector('.form_change'),
        closeBtn = changeForm.querySelector('.modal__btn_close'),
        idField = changeForm.querySelector('.form-change__id'),
        surnameField = changeForm.querySelector('.form__input[data-path="surname"]'),
        nameField = changeForm.querySelector('.form__input[data-path="name"]'),
        lastNameField = changeForm.querySelector('.form__input[data-path="lastname"]'),
        btnAddContact = changeForm.querySelector('.form-add-contacts__btn'),
        btnDeleteClient = changeForm.querySelector('.btn-underlined'),
        formBtnContainer = changeForm.querySelector('.form__btn-container'),
        btnSubmit = changeForm.querySelector('.form__btn_submit');

  contactsCount = 0;

  surnameField.value = client.surname;
  nameField.value = client.name;
  lastNameField.value = client.lastName;

  btnSubmit.disabled = true;

  changeForm.querySelectorAll('.form__input[data-path]').forEach((item) => {
    if (item.value !== '') {
      changeForm.querySelector(`.placeholder[data-target="${item.dataset.path}"]`).classList.add('active');
    }
  })

  fixedOverlay.classList.add('display');
  changeForm.classList.add('display');
  let timer = setTimeout(() => {
    changeForm.classList.add('visible');
  }, 200)

  idField.textContent = `ID: ${client.id}`;

  client.contacts.forEach(contact => {
    createContactItem(contact, changeForm);
    contactsCount++;
    if (contactsCount >= 10) {
      btnAddContact.classList.add('hidden');
    }
  })

  /* Обработчики событий */

  btnAddContact.onclick = () => {
    btnSubmit.disabled = false;
    createContactItem(null, changeForm);
    contactsCount++;
    if (contactsCount >= 10) {
      btnAddContact.classList.add('hidden');
    }
  }

  changeForm.querySelectorAll('input').forEach(item => {
    item.oninput = () => {
      btnSubmit.disabled = false;
    }
  })

  btnDeleteClient.onclick = () => {
    deleteClient(client.id);
  }

  closeBtn.onclick = () => {
    closeForm(changeForm);
  }

  fixedOverlay.onclick = (e) => {
    if (e.target === fixedOverlay) {
      closeForm(changeForm);
    }
  }

  changeForm.onchange = () => {
    btnSubmit.disabled = false;

    changeForm.querySelectorAll('input[required]').forEach(item => {
      item.oninput = () => {

        if (!changeForm.checkValidity() && changeForm.classList.contains('was-validated')) {
          if (changeForm.querySelector('.form__error') === null) {
            const formError = document.createElement('div');

            formError.classList.add('form__error');
            formError.textContent = 'Заполните выделенные поля';
            changeForm.insertBefore(formError, formBtnContainer);
          }
        } else {
          if (changeForm.querySelector('.form__error') !== null) {
            changeForm.querySelector('.form__error').remove();
          }
        }
      }
    })
  }

  changeForm.onsubmit = (e) => {
    e.preventDefault();

    const surnameFieldChanged = changeForm.querySelector('.form__input[data-path="surname"]'),
          nameFieldChanged = changeForm.querySelector('.form__input[data-path="name"]'),
          lastNameFieldChanged = changeForm.querySelector('.form__input[data-path="lastname"]'),
          contactItems = changeForm.querySelectorAll('.form__contact-container');

    // удаление начальных и конечных пробелов в инпутах
    surnameFieldChanged.value = surnameFieldChanged.value.trim();
    nameFieldChanged.value = nameFieldChanged.value.trim();
    lastNameFieldChanged.value = lastNameFieldChanged.value.trim();
    changeForm.querySelectorAll('.form__contacts-input').forEach(item => {
      item.value = item.value.trim();
    })

    if (!changeForm.checkValidity()) {
      changeForm.classList.add('was-validated');

      if (changeForm.querySelector('.form__error') === null) {
        const formError = document.createElement('div');

        formError.classList.add('form__error');
        formError.textContent = 'Заполните выделенные поля';
        changeForm.insertBefore(formError, formBtnContainer);
      }

    } else {
      const changedClient = {
        name: nameFieldChanged.value,
        surname: surnameFieldChanged.value,
        lastName: lastNameFieldChanged.value,
        contacts: []
      }

      contactItems.forEach(contact => {
        const selectedContactType = contact.querySelector('.choices__inner').querySelector('.choices__item[aria-selected="true"]'),
              contactInput = contact.querySelector('.form__contacts-input');

        const contactObject = {
          type: selectedContactType.dataset.value,
          value: contactInput.value
        };

        changedClient.contacts.push(contactObject);
      })

      btnSubmit.classList.add('active');
      let timer = setTimeout(() => {
        changeClient(changedClient, client.id, changeForm, formBtnContainer).catch(error => {
          const errorLabel = document.createElement('div');
          errorLabel.classList.add('form__error');

          if (changeForm.querySelector('.form__error') !== null) {
            changeForm.querySelector('.form__error').remove();
          }

          changeForm.querySelector('.form__btn_submit').classList.remove('active');
          errorLabel.textContent = 'Потеряно соединение с сервером';
          changeForm.insertBefore(errorLabel, formBtnContainer);
        });
      }, 500)
    }
  }
}

function openCreateForm() {
  const fixedOverlay = document.querySelector('.fixed-overlay'),
        createForm = document.querySelector('.form_create'),
        closeBtn = createForm.querySelector('.modal__btn_close'),
        btnAddContact = createForm.querySelector('.form-add-contacts__btn'),
        btnCancel = createForm.querySelector('.btn-underlined'),
        formBtnContainer = createForm.querySelector('.form__btn-container'),
        btnSubmit = createForm.querySelector('.form__btn_submit');

  contactsCount = 0;

  fixedOverlay.classList.add('display');
  createForm.classList.add('display');
  let timer = setTimeout(() => {
    createForm.classList.add('visible');
  }, 200)

  createForm.querySelectorAll('.placeholder').forEach((item) => {
    item.classList.remove('active');
  })

  /* Обработчики событий */

  btnAddContact.onclick = () => {
    createContactItem(null, createForm);
    if (contactsCount >= 10) {
      btnAddContact.classList.add('hidden');
    }
  }

  btnCancel.onclick = () => {
    closeForm(createForm);
  }

  closeBtn.onclick = () => {
    closeForm(createForm);
  }

  fixedOverlay.onclick = (e) => {
    if (e.target === fixedOverlay) {
      closeForm(createForm);
    }
  }

  createForm.onchange = () => {
    createForm.querySelectorAll('input[required]').forEach(item => {
      item.oninput = () => {
        if (!createForm.checkValidity() && createForm.classList.contains('was-validated')) {
          if (createForm.querySelector('.form__error') === null) {
            const formError = document.createElement('div');
            formError.classList.add('form__error');
            formError.textContent = 'Заполните выделенные поля';
            createForm.insertBefore(formError, formBtnContainer);
          }
        } else {
          if (createForm.querySelector('.form__error') !== null) {
            createForm.querySelector('.form__error').remove();
          }
        }
      }
    })
  }

  createForm.onsubmit = (e) => {
    e.preventDefault();

    const surnameField = createForm.querySelector('.form__input[data-path="surname"]'),
          nameField = createForm.querySelector('.form__input[data-path="name"]'),
          lastNameField = createForm.querySelector('.form__input[data-path="lastname"]'),
          contactItems = createForm.querySelectorAll('.form__contact-container');

    // удаление начальных и конечных пробелов в инпутах
    surnameField.value = surnameField.value.trim();
    nameField.value = nameField.value.trim();
    lastNameField.value = lastNameField.value.trim();
    createForm.querySelectorAll('.form__contacts-input').forEach(item => {
      item.value = item.value.trim();
    })

    if (!createForm.checkValidity()) {
      createForm.classList.add('was-validated');

      if (createForm.querySelector('.form__error') === null) {
        const formError = document.createElement('div');
        formError.classList.add('form__error');
        formError.textContent = 'Заполните выделенные поля';
        createForm.insertBefore(formError, formBtnContainer);
      }
    } else {
      const newClient = {
        name: nameField.value,
        surname: surnameField.value,
        lastName: lastNameField.value,
        contacts: []
      }

      contactItems.forEach(contact => {
        const selectedContactType = contact.querySelector('.choices__inner').querySelector('.choices__item[aria-selected="true"]'),
              contactInput = contact.querySelector('.form__contacts-input');

        const contactObject = {
          type: selectedContactType.dataset.value,
          value: contactInput.value
        };

        newClient.contacts.push(contactObject);
      })

      btnSubmit.classList.add('active');
      let timer = setTimeout(() => {
        createClient(newClient, createForm, formBtnContainer).catch(error => {
          const errorLabel = document.createElement('div');
          errorLabel.classList.add('form__error');

          if (createForm.querySelector('.form__error') !== null) {
            createForm.querySelector('.form__error').remove();
          }

          createForm.querySelector('.form__btn_submit').classList.remove('active');
          errorLabel.textContent = 'Потеряно соединение с сервером';
          createForm.insertBefore(errorLabel, formBtnContainer);
        });
      }, 500)
    }
  }
}

function openDeleteForm(client) {
  const fixedOverlay = document.querySelector('.fixed-overlay'),
        deleteForm = document.querySelector('.modal_delete'),
        closeBtn = deleteForm.querySelector('.modal__btn_close'),
        deleteBtn = deleteForm.querySelector('.modal__btn_delete'),
        cancelBtn = deleteForm.querySelector('.btn-underlined');

  fixedOverlay.classList.add('display');
  deleteForm.classList.add('display');
  let timer = setTimeout(() => {
    deleteForm.classList.add('visible');
  }, 200)

  /* Обработчики событий */
  cancelBtn.onclick = () => {
    closeForm(deleteForm);
  }

  closeBtn.onclick = () => {
    closeForm(deleteForm);
  }

  fixedOverlay.onclick = (e) => {
    if (e.target === fixedOverlay) {
      closeForm(deleteForm);
    }
  }

  deleteBtn.onclick = () => {
    deleteBtn.classList.add('active');
    let timer = setTimeout(() => {
      deleteClient(client.id, deleteForm, deleteBtn).catch(error => {
        const errorLabel = document.createElement('div');
        errorLabel.classList.add('form__error');

        if (deleteForm.querySelector('.form__error') !== null) {
          deleteForm.querySelector('.form__error').remove();
        }

        deleteForm.querySelector('.form__btn_submit').classList.remove('active');
        errorLabel.textContent = 'Потеряно соединение с сервером';
        deleteForm.insertBefore(errorLabel, deleteBtn);
      });
    }, 500)
  }
}

function closeForm(form, fixedOverlay = document.querySelector('.fixed-overlay')) {
  form.classList.remove('visible');
  let timer = setTimeout(() => {
    form.classList.remove('display');
    form.classList.remove('was-validated');
    fixedOverlay.classList.remove('display');

    form.querySelectorAll('.form__input').forEach(item => {
      item.value = '';
    })
    form.querySelectorAll('.placeholder').forEach(item => {
      item.classList.remove('active');
    })
    form.querySelectorAll('.form__contact-container').forEach(item => {
      item.remove();
    })
    if (form.querySelector('.form__add-contacts') !== null) {
      form.querySelector('.form__add-contacts').classList.remove('contains');
    }

    if (form.querySelector('.form__error') !== null) {
      form.querySelector('.form__error').remove();
    }
  }, 200)
}

function createContactItem(contact = null, form) {
  const contactContainer = form.querySelector('.form__add-contacts'),
          contactItem = document.createElement('div'),
          contactSelect = document.createElement('select'),
          contactInput = document.createElement('input'),
          contactDeleteBtn = document.createElement('button'),
          btnAddContact = form.querySelector('.form-add-contacts__btn');

  // Массив элементов выпадающего списка
  const contactsArr = [
    { value: 'phone', label: 'Телефон', selected: false, disabled: false },
    { value: 'email', label: 'Email', selected: false, disabled: false },
    { value: 'facebook', label: 'Facebook', selected: false, disabled: false },
    { value: 'vk', label: 'VK', selected: false, disabled: false },
    { value: 'twitter', label: 'Twitter', selected: false, disabled: false },
    { value: 'whatsapp', label: 'Whatsapp', selected: false, disabled: false },
    { value: 'instagram', label: 'Instagram', selected: false, disabled: false }
  ];

  contactItem.classList.add('form__contact-container');
  contactSelect.classList.add('form__choices');
  contactSelect.ariaLabel = 'Выберите контакт';
  contactInput.classList.add('form__contacts-input');
  contactInput.placeholder = 'Введите данные контакта';
  contactInput.required = true;
  contactDeleteBtn.classList.add('btn');
  contactDeleteBtn.classList.add('form__contacts-btn');
  contactDeleteBtn.type = 'button';
  contactDeleteBtn.dataset.tooltip = 'Удалить контакт';
  createTooltip(contactDeleteBtn);

  contactItem.append(contactSelect, contactInput, contactDeleteBtn);
  contactContainer.insertBefore(contactItem, btnAddContact); // вставляем перед кнопкой добавления контакта
  contactContainer.classList.add('contains');

  contactDeleteBtn.onclick = () => {
    contactItem.remove();
    contactsCount--;
    btnAddContact.classList.remove('hidden');
    if (contactContainer.querySelector('.form__contact-container') === null) {
      contactContainer.classList.remove('contains');
    }
  }

  if (contact !== null) {
    contactInput.value = contact.value;

    contactsArr.forEach(item => {
      if (item.value.localeCompare(contact.type) === 0) {
        item.selected = true;
      }
    })
  } else {
    contactsArr[0].selected = true;
  }

  /* Инициализация Choices */
  const element = contactSelect;
  const choices = new Choices(element, {
    choices: contactsArr,
    searchEnabled: false,
    itemSelectText: '',
    shouldSort: false,
  });
  let ariaLabel = element.getAttribute('aria-label');
  element.closest('.choices').setAttribute('aria-label', ariaLabel);
}



addClientBtn.onclick = () => {
  openCreateForm();
}

// Сортировка по нажатии на заголовки в таблице
document.querySelectorAll('.clients-table__btn_sort[data-sort]').forEach((item) => {
  item.onclick = (e) => {
    let dataName = item.dataset.name;

    if (document.querySelector('[data-sort="true"]') !== null && document.querySelector('[data-sort="true"]') !== item) {
      document.querySelector('[data-sort="true"]').removeAttribute('data-order');
      document.querySelector('[data-sort="true"]').dataset.sort = 'false';
    }

    if (item.dataset.order === 'descending' || item.dataset.order === undefined) {

      // сортировка по возрастанию
      switch (dataName) {
        case 'id':
          clientsArr.sort((a, b) => parseInt(a.id) - parseInt(b.id));
          break;
        case 'fullname':
          clientsArr.sort((a, b) => a.surname.localeCompare(b.surname));
          break;
        case 'creationdate':
          clientsArr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'lastchanges':
          clientsArr.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
          break;
        default:
          break;
      }

      drawTable(clientsArr);
      item.dataset.order = 'ascending';
      item.dataset.sort = 'true';
    } else {

      // сортировка по убыванию
      switch (dataName) {
        case 'id':
          clientsArr.sort((a, b) => parseInt(b.id) - parseInt(a.id));
          break;
        case 'fullname':
          clientsArr.sort((a, b) => b.surname.localeCompare(a.surname));
          break;
        case 'creationdate':
          clientsArr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'lastchanges':
          clientsArr.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          break;
        default:
          break;
      }

      drawTable(clientsArr);
      item.dataset.order = 'descending';
    }
  }
})

// Фильтрация записей при вводе в поисковую строку
searchInput.oninput = (e) => {
  clearTimeout(timer);

  timer = setTimeout(() => {
    const value = e.target.value;

    if (value) {
      searchInputClearBtn.classList.add('visible');
    } else {
      searchInputClearBtn.classList.remove('visible');
    }

    // сбрасываем сортировку
    document.querySelector('[data-sort="true"]').removeAttribute('data-order');
    document.querySelector('[data-sort="true"]').dataset.sort = 'false';
    document.querySelector('.clients-table__btn_sort[data-name="id"]').dataset.sort = 'true';
    document.querySelector('.clients-table__btn_sort[data-name="id"]').dataset.order = 'ascending';



    getClients(value).catch(error => {
      hidePreloader();
      tableError.classList.remove('invisible');
    });
  }, 300)
}

searchInputClearBtn.onclick = () => {
  clearTimeout(autocompleteTimer);
  searchInput.value = '';
  searchInputClearBtn.classList.remove('visible');
  searchInput.focus();

  getClients(searchInput.value).catch(error => {
    hidePreloader();
    tableError.classList.remove('invisible');
  });
}

searchInput.onfocus = (e) => {
  clearTimeout(autocompleteTimer);
  if (autocompleteList.innerHTML !== '') {
    autocompleteList.classList.add('visible');
  }
}

searchInput.onblur = (e) => {
  clearTimeout(autocompleteTimer);
  autocompleteTimer = setTimeout(() => {
    autocompleteList.classList.remove('visible');
  }, 150);
}

searchInput.onkeydown = (e) => {
  if (e.key === 'ArrowDown') {
    document.querySelector(`.header-autocomplete__btn[data-index="0"]`).focus({ preventScroll: true });
  } else if (e.key === 'ArrowUp') {
    document.querySelector(`.header-autocomplete__btn[data-index="${autocompleteLength - 1}"]`).focus({ preventScroll: true });
  }
  clearTimeout(autocompleteTimer);
}

document.onclick = (e) => {
  document.querySelectorAll('.header-autocomplete__btn').forEach(item => {
    if (!(e.target === searchInput || e.target === item)) {
      autocompleteList.classList.remove('visible');
    }
  })
}

getClients().catch(error => {
  hidePreloader();
  tableError.classList.remove('invisible');
});

setTimeout(() => {
  autocompleteList.classList.remove('visible');
}, 100);

async function hashHandler() {
  const pageHash = window.location.hash;

  let clientId;

  if (pageHash !== null) {
    if (pageHash.slice(1, 3) === 'id') {
      clientId = pageHash.slice(3);

      const response = await fetch(`http://localhost:3000/api/clients/${clientId}`);

      if (response.ok) {
        const data = await response.json();

        console.log(data);
        openChangeForm(data);
      } else {
        openErrorModal('Указанного клиента не существует');
      }
    }
  }
}

function openErrorModal(text = '') {
  const fixedOverlay = document.querySelector('.fixed-overlay'),
        modalHashError = document.querySelector('.modal_error'),
        btnOk = modalHashError.querySelector('.modal__btn_error'),
        btnClose = modalHashError.querySelector('.modal__btn_close'),
        errorDescr = modalHashError.querySelector('.modal-error__descr');

  fixedOverlay.classList.add('display');
  modalHashError.classList.add('display');
  let timer = setTimeout(() => {
    modalHashError.classList.add('visible');
  }, 200)
  errorDescr.textContent = text;

  btnOk.onclick = () => {
    closeForm(modalHashError);
  }

  btnClose.onclick = () => {
    closeForm(modalHashError);
  }

  fixedOverlay.onclick = (e) => {
    if (e.target === fixedOverlay) {
      closeForm(modalHashError);
    }
  }
}

hashHandler().catch(error => {
  openErrorModal('Не удаётся получить данные клиента, т.к. потеряно соединение с сервером');
});

window.onhashchange = () => {
  hashHandler().catch(error => {
    openErrorModal('Не удаётся получить данные клиента, т.к. потеряно соединение с сервером');
  });
}
