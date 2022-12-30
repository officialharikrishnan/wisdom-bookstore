/* eslint-disable */

function changeQuantity(cartId, proId, count, quantity) {
  if(quantity == 1 && count == '-1'){
    removeCartProduct(cartId, proId, count, quantity)
  }else{
    $.ajax({
      url: '/change-product-quantity',
      data: {
        cart: cartId,
        product: proId,
        count,
        quantity,
      },
      method: 'post',
      success: () => {
        // eslint-disable-next-line no-restricted-globals
        location.reload();
      },
    });

  }

}

function finalProduct(cartId, proId, count, quantity){
  $.ajax({
    url: '/change-product-quantity',
    data: {
      cart: cartId,
      product: proId,
      count,
      quantity,
    },
    method: 'post',
    success: () => {
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    },
  });
}

function filter(cat) {
  $.ajax({
    url: '/filter-book',
    data: {
      data: cat,
    },
    method: 'post',
    success: (response) => {
      location.reload();
    },
  });
}

function addtocart(id) {
  $.ajax({
    url: '/add-to-cart',
    data: {
      data: id,
    },
    method: 'post',
    success: (response) => {
      cartAlert()
      setTimeout(()=>{
        location.reload();

      },2000)
      
    },
  });
}

function deleteCat(cat) {
  $.ajax({
    url: '/admin/delete-category',
    data: {
      data: cat,
    },
    method: 'post',
    success: (response) => {
      location.reload();
    },
  });
}
function cancelOrd(id) {
  $.ajax({
    url: '/cancel-order',
    data: {
      data: id,
    },
    method: 'post',
    success: (response) => {
      location.reload();
    },
  });
}

function example(id) {
  const DNDALERT = new DNDAlert({
    title: 'Alert',
    message:
        'If you remove this category , all the related books will be unlisted',
    type: 'info',
    html: false,
    buttons: [
      {
        text: 'Ok',
        type: 'primary',
        onClick: () => {
          deleteCat(id);
        },
      },
      {
        text: 'Cancel',
        onClick: (bag) => {
          bag.CLOSE_MODAL();
        },
      },
    ],
    closeBackgroundClick: true,
    portalElement: document.querySelector('body'),
    portalOverflowHidden: true,
    textAlign: 'center',
    theme: 'white',
    onOpen: (bag) => {
      console.log('Modal Opened');
      console.log(bag.PROPERTIES);
    },
    onClose: (bag) => {
      console.log('Modal Closed');
      console.log(bag);
    },
    opacity: 1,
    autoCloseDuration: 15000,
    draggable: true,
    animationStatus: true,
    closeIcon: false,
    sourceControlWarning: true,

  });
}

function cancelOrder(id) {
  const DNDALERT = new DNDAlert({
    title: 'Alert',
    message:
        'Are you sure want to cancel this order',
    type: 'info',
    html: false,
    buttons: [
      {
        text: 'Yes',
        type: 'primary',
        onClick: () => {
          cancelOrd(id);
        },
      },
      {
        text: 'Close',
        onClick: (bag) => {
          bag.CLOSE_MODAL();
        },
      },
    ],
    closeBackgroundClick: true,
    portalElement: document.querySelector('body'),
    portalOverflowHidden: true,
    textAlign: 'center',
    theme: 'white',
    onOpen: (bag) => {
      console.log('Modal Opened');
      console.log(bag.PROPERTIES);
    },
    onClose: (bag) => {
      console.log('Modal Closed');
      console.log(bag);
    },
    opacity: 1,
    autoCloseDuration: 15000,
    draggable: true,
    animationStatus: true,
    closeIcon: false,
    sourceControlWarning: true,

  });
}

function paymentFailed(details) {
  const DNDALERT = new DNDAlert({
    title: 'Alert',
    message: details,
    type: 'info',
    html: false,
    buttons: [
      {
        text: 'OK',
        type: 'primary',
        onClick: () => {
          location.href = '/home'
        },
      }
    ],
    closeBackgroundClick: true,
    portalElement: document.querySelector('body'),
    portalOverflowHidden: true,
    textAlign: 'center',
    theme: 'white',
    onOpen: (bag) => {
      console.log('Modal Opened');
      console.log(bag.PROPERTIES);
    },
    onClose: (bag) => {
      console.log('Modal Closed');
      console.log(bag);
    },
    opacity: 1,
    autoCloseDuration: 15000,
    draggable: true,
    animationStatus: true,
    closeIcon: false,
    sourceControlWarning: true,

  });
}


function cartAlert() {
  const DNDALERT = new DNDAlert({
    title: 'Alert',
    message:
        'One Item Added to Cart',
    type: 'success',
    html: false,
    
    closeBackgroundClick: true,
    portalElement: document.querySelector('body'),
    portalOverflowHidden: true,
    textAlign: 'center',
    theme: 'white',
    onOpen: (bag) => {
      console.log('Modal Opened');
      console.log(bag.PROPERTIES);
    },
    onClose: (bag) => {
      console.log('Modal Closed');
      console.log(bag);
    },
    opacity: 1,
    autoCloseDuration: 1500,
    draggable: true,
    animationStatus: true,
    closeIcon: false,
    sourceControlWarning: true,

  });
}

function razorpayClose() {
  const DNDALERT = new DNDAlert({
    title: 'Alert',
    message: 'Payment failed! ,Your order is now on pending',
    type: 'info',
    html: false,
    buttons: [
      {
        text: 'OK',
        type: 'primary',
        onClick: () => {
          location.href = '/home'
        },
      }
    ],
    closeBackgroundClick: true,
    portalElement: document.querySelector('body'),
    portalOverflowHidden: true,
    textAlign: 'center',
    theme: 'white',
    onOpen: (bag) => {
      console.log('Modal Opened');
      console.log(bag.PROPERTIES);
    },
    onClose: (bag) => {
      console.log('Modal Closed');
      console.log(bag);
    },
    opacity: 1,
    autoCloseDuration: 15000,
    draggable: true,
    animationStatus: true,
    closeIcon: false,
    sourceControlWarning: true,

  });
}


function removeCartProduct(cartId, proId, count, quantity) {
  const DNDALERT = new DNDAlert({
    title: 'Alert',
    message:
        'Are you sure want to remove this product',
    type: 'info',
    html: false,
    buttons: [
      {
        text: 'Yes',
        type: 'primary',
        onClick: () => {
          finalProduct(cartId, proId, count, quantity)
        },
      },
      {
        text: 'Close',
        onClick: (bag) => {
          bag.CLOSE_MODAL();
        },
      },
    ],
    closeBackgroundClick: true,
    portalElement: document.querySelector('body'),
    portalOverflowHidden: true,
    textAlign: 'center',
    theme: 'white',
    onOpen: (bag) => {
      console.log('Modal Opened');
      console.log(bag.PROPERTIES);
    },
    onClose: (bag) => {
      console.log('Modal Closed');
      console.log(bag);
    },
    opacity: 1,
    autoCloseDuration: 15000,
    draggable: true,
    animationStatus: true,
    closeIcon: false,
    sourceControlWarning: true,

  });
}

function returnOrderProduct(orderId,proId) {
  const DNDALERT = new DNDAlert({
    title: 'Alert',
    message:
        'Are you sure want to return this product',
    type: 'info',
    html: false,
    buttons: [
      {
        text: 'Yes',
        type: 'primary',
        onClick: () => {
          returnProduct(orderId,proId)
        },
      },
      {
        text: 'Close',
        onClick: (bag) => {
          bag.CLOSE_MODAL();
        },
      },
    ],
    closeBackgroundClick: true,
    portalElement: document.querySelector('body'),
    portalOverflowHidden: true,
    textAlign: 'center',
    theme: 'white',
    onOpen: (bag) => {
      console.log('Modal Opened');
      console.log(bag.PROPERTIES);
    },
    onClose: (bag) => {
      console.log('Modal Closed');
      console.log(bag);
    },
    opacity: 1,
    autoCloseDuration: 15000,
    draggable: true,
    animationStatus: true,
    closeIcon: false,
    sourceControlWarning: true,

  });
}

function returnProduct(orderId,proId){ 
    $.ajax({
      url:'/returnItem',
      data:{
        order:orderId,
        pro:proId
      },
      method:'post',
      success:(response => {
        if(response.status){
          location.reload()
        }else{

        }
      })
    })

}