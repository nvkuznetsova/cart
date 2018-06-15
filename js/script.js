const cartModule = (function(){

  let cart = document.querySelector("#cart .basket ul");

  return {
    updateCart: function() {
      let total = 0.0;
      let cart_items = document.querySelectorAll("#cart .basket ul li")
      for (let item of cart_items) {
          let num = item.getAttribute('data-num');
          let price = item.getAttribute('data-price');

          let sub_total = parseFloat(num * parseFloat(price));
          item.querySelector("span.sub-total").innerHTML = sub_total.toFixed(2)+' р';
          total += sub_total;
      }

      document.querySelector("#cart #total").innerHTML = `Сумма: ${total.toFixed(2)} руб.`;
      document.querySelector("#cart #total").setAttribute('sum', total);
    },

    addItem: function(item, id) {

      let clone = item.cloneNode(true);
      img = clone.querySelector("img");
      p = clone.querySelector("p");
      clone.setAttribute('data-id', id);
      clone.setAttribute('data-num', 1);
      clone.removeChild(img);
      clone.removeChild(p);
      clone.removeAttribute('id');

      let elem = document.createElement('span');
      elem.setAttribute('class', 'sub-total');
      clone.appendChild(elem);

      elem = document.createElement('span');
      elem.setAttribute('class', 'count');
      elem.innerHTML = '1';
      clone.appendChild(elem);

      elem = document.createElement('span');
      elem.setAttribute('class', 'delete');
      elem.innerHTML = 'X';
      clone.appendChild(elem);
      cart.appendChild(clone);
    },

    updateItem: function(item) {
      let number = item.getAttribute('data-num');
      number = +number + 1
      item.setAttribute('data-num', number);
      let span = item.querySelectorAll('span.count');
      span[0].innerHTML = number;
    },

    deleteItem: function(item) {
      item.parentNode.removeChild(item);
    }
  };

}());

//--------------события--------------------

function addEvent(el, event, func ) {
    if (typeof (window.event) != 'undefined' && el.attachEvent)
        el.attachEvent('on' + event, func);
    else
        el.addEventListener(event, func, false);
}


addEvent(document, 'readystatechange', function() {
    if ( document.readyState !== "complete" )
        return true;

  const items = document.querySelectorAll("#product ul li");
  const but = document.querySelector("#submit");
  const myEvent = new CustomEvent('checkCredit');

  function onCheckCredit(event) {
    let credit = +document.querySelector("#limit #credit").getAttribute("sum");
    let total = +document.querySelector("#cart #total").getAttribute("sum");

    if (credit <= 0) {
      document.querySelector("#limit #credit").textContent = "Кредит должен быть положительным!";
      document.querySelector("#limit #limitInput").focus();
    } else {
      items.forEach((item, i) => {
        let sub_total = +item.getAttribute("data-price");
        if (total+sub_total > credit) {
          item.setAttribute("draggable", "false");
          item.classList.add('dragFalse');
          i++;
          if (i == items.length) {
            alert('Больше в корзину ничего не добавить! Пополните кредит или удалите товар!');
            document.querySelector("#limit #limitInput").focus();
            document.querySelector("#limit .basket_list").classList.add('activeCredit');
          }
        } else {
          item.setAttribute("draggable", "true");
          item.classList.remove('dragFalse');
          document.querySelector("#limit .basket_list").classList.remove('activeCredit');
        }
      });
    }
  }

  function onDrop(event){
    if(event.preventDefault) event.preventDefault();
    if (event.stopPropagation) event.stopPropagation();
    else event.cancelBubble = true;

    let id = event.dataTransfer.getData("Text");
    let item = document.getElementById(id);
    let exists = document.querySelectorAll("#cart .basket li[data-id='" + id + "']");

    if(exists.length > 0){
        cartModule.updateItem(exists[0]);
    } else {
        cartModule.addItem(item, id);
    }

    let deleteButs = document.querySelectorAll('.basket ul li span.delete');
    deleteButs.forEach((but) => {addEvent(but, 'click', onClickDelete);});

    document.querySelector("#cart .basket_list").classList.remove('activeCart');
    cartModule.updateCart();
    setTimeout(() => cart.dispatchEvent(myEvent), 100);
    return false;
}

function onDragOver(event){
  if(event.preventDefault) event.preventDefault();
  if (event.stopPropagation) event.stopPropagation();
  else event.cancelBubble = true;

  return false;
}

function onDragEnd(event){
  if(event.preventDefault) event.preventDefault();
  if (event.stopPropagation) event.stopPropagation();
  else event.cancelBubble = true;

  document.querySelector("#cart .basket_list").classList.remove('activeCart');
  return false;
}

function onClickDelete(event) {
      let item = this.parentElement;
      cartModule.deleteItem(item);
      cartModule.updateCart();
      cart.dispatchEvent(myEvent);
}

addEvent(cart, 'drop', onDrop);
addEvent(cart, 'dragover', onDragOver);
addEvent(cart, 'checkCredit', onCheckCredit);

function onDrag(event){
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.dropEffect = "move";
  let target = event.target || event.srcElement;
  let success = event.dataTransfer.setData('Text', target.id);

  document.querySelector("#cart .basket_list").classList.add('activeCart');
}

function onButClick(){
  const input = +document.querySelector('#limitInput').value;
  let credit = +document.querySelector("#limit #credit").getAttribute("sum");
  credit += input;
  document.querySelector("#limit #credit").textContent = `Ваш кредит: ${credit} рублей.`;
  document.querySelector("#limit #credit").setAttribute('sum', credit);
  cart.dispatchEvent(myEvent);
}

addEvent(but, 'click', onButClick);

//устанавливаем атрибут draggable на true
//добавляем событие dragstart
for (let i of items) {
  i.setAttribute("draggable", "true");
  addEvent(i, 'dragstart', onDrag);
  addEvent(i, 'dragend', onDragEnd);
};

});
