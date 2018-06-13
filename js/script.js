const cartModule = (function(){

  let cart = document.querySelectorAll("#cart .basket ul")[0];

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

      let fragment = document.createElement('span');
      fragment.setAttribute('class', 'sub-total');
      clone.appendChild(fragment);

      fragment = document.createElement('span');
      fragment.setAttribute('class', 'count');
      fragment.innerHTML = '1';
      clone.appendChild(fragment);


      fragment = document.createElement('span');
      fragment.setAttribute('class', 'delete');
      fragment.innerHTML = 'X';
      clone.appendChild(fragment);
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

//события

function addEvent(elem, event, delegate ) {
    if (typeof (window.event) != 'undefined' && elem.attachEvent)
        elem.attachEvent('on' + event, delegate);
    else
        elem.addEventListener(event, delegate, false);
}

//изменение состояния документа
addEvent(document, 'readystatechange', function() {
    if ( document.readyState !== "complete" )
        return true;

  const items = document.querySelectorAll("#product ul li");
  const but = document.querySelector("#submit");

  function onDrop(event){
    if(event.preventDefault) event.preventDefault();
    if (event.stopPropagation) event.stopPropagation();
    else event.cancelBubble = true;

    let id = event.dataTransfer.getData("Text");
    let item = document.getElementById(id);

    let exists = document.querySelectorAll("#cart .basket li[data-id='" + id + "']");
    let credit = +document.querySelector("#limit #credit").getAttribute("sum");
    console.log(credit);
    let total = +document.querySelector("#cart #total").getAttribute("sum");
    let sub_total = +item.getAttribute("data-price");
    console.log(total+sub_total);

    if (credit <= 0) {
      document.querySelector("#limit #credit").textContent = "Кредит должен быть положительным!";
      document.querySelector("#limit #limitInput").focus();
      cartModule.updateCart();
    } else if (total >= credit) {
      alert('Вы превысили кредит!');
      for (let i of items) {
        i.setAttribute("draggable", "false");
        i.classList.add('dragFalse');
      };
    } else if (total+sub_total > credit) {
      alert('Вы превышаете кредит!');
      document.querySelector("#limit #limitInput").focus();
    }
    else if(exists.length > 0){
        cartModule.updateItem(exists[0]);
    } else {
        cartModule.addItem(item, id);
    }

    document.querySelector("#cart .basket_list").classList.remove('activeCart');
    cartModule.updateCart();
    return false;
}

//останавливает стандартное поведение dragover и dragenter
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

function onClick(event) {
      let item = document.querySelector("#cart .basket ul li[data-id]");
      cartModule.deleteItem(item);
      cartModule.updateCart();

      let credit = +document.querySelector("#limit #credit").getAttribute("sum");
      let total = +document.querySelector("#cart #total").getAttribute("sum");
      if (credit >= total) {
        for (let i of items) {
          i.setAttribute("draggable", "true");
          i.classList.remove('dragFalse');
        };
        document.querySelector("#limit #credit").textContent = `Ваш кредит: ${credit} рублей.`;
      }
}

addEvent(cart, 'drop', onDrop);
addEvent(cart, 'dragover', onDragOver);
addEvent(cart, 'click', onClick);

//эффекты для перетаскивания
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
  let total = +document.querySelector("#cart #total").getAttribute("sum");
  credit += input;
  document.querySelector("#limit #credit").textContent = `Ваш кредит: ${credit} рублей.`;
  document.querySelector("#limit #credit").setAttribute('sum', credit);
  if (credit >= total) {
    for (let i of items) {
      i.setAttribute("draggable", "true");
      i.classList.remove('dragFalse');
    };
  }
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
