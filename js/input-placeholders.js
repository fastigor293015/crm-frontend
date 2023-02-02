let input = document.querySelectorAll('.form__input'),
    placeholder = document.querySelectorAll('.placeholder');

input.forEach((item) => {
  item.onfocus = () => {
    let path = event.currentTarget.dataset.path;
    placeholder.forEach((item) => {
      let target = item.dataset.target/* ,
          placeholderWidth = item.offsetWidth */;
      if (path.localeCompare(target) === 0) {
        item.classList.add('active');
/*         item.style.transform = `translate(-${placeholderWidth * 0.18}px, -16px) scale(60%)`; */
      }
    })
  };
  item.onchange = () => {
    let path = event.currentTarget.dataset.path;
    placeholder.forEach((item) => {
      let target = item.dataset.target/* ,
          placeholderWidth = item.offsetWidth */;
      if (path.localeCompare(target) === 0) {
        item.classList.add('active');
/*         item.style.transform = `translate(-${placeholderWidth * 0.18}px, -16px) scale(60%)`; */
      }
    })
  };
  item.onblur = () =>  {
    let curTarget = event.currentTarget,
        path = curTarget.dataset.path;
    placeholder.forEach((item) => {
      let target = item.dataset.target/* ,
      placeholderWidth = item.offsetWidth */;
      if (path.localeCompare(target) === 0) {
        if (curTarget.value !== "") {
          item.classList.add('active');
/*           item.style.transform = `translate(-${placeholderWidth * 0.18}px, -16px) scale(60%)`; */
        } else {
          item.classList.remove('active');
/*           item.style.transform = 'none'; */
        }
      }
    })
  };
})
