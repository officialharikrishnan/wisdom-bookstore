function changeQuantity(cartId,proId,count,quantity){

    $.ajax({
        url:'/change-product-quantity',
        data:{
            cart:cartId,
            product:proId,
            count:count,
            quantity:quantity
        },
        method:'post',
        success:(response)=>{
            location.reload();

        }
    })

}

function filter(cat){

    $.ajax({
        url:'/filter-book',
        data:{
            data:cat
        },
        method:'post',
        success:(response)=>{
            location.reload();

        }
    })

}




function deleteCat(cat){

    $.ajax({
        url:'/admin/delete-category',
        data:{
            data:cat
        },
        method:'post',
        success:(response)=>{
            location.reload();

        }
    })

}
function cancelOrd(id){

    $.ajax({
        url:'/cancel-order',
        data:{
            data:id
        },
        method:'post',
        success:(response)=>{
            location.reload();

        }
    })

}






function example(id) {

    const DNDALERT = new DNDAlert({
      title: "Alert",
      message:
        "If you remove this category , all the related books will be unlisted",
      type: "info",
      html: false,
      buttons: [
        {
          text: "Ok",
          type: "primary",
          onClick: () => {
            deleteCat(id)
          },
        },
        {
          text: "Cancel",
          onClick: (bag) => {
            bag.CLOSE_MODAL();
          },
        },
      ],
      closeBackgroundClick: true,
      portalElement: document.querySelector("body"),
      portalOverflowHidden: true,
      textAlign: "center",
      theme: "white",
      onOpen: (bag) => {
        console.log("Modal Opened");
        console.log(bag.PROPERTIES);
      },
      onClose: (bag) => {
        console.log("Modal Closed");
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
      title: "Alert",
      message:
        "Are you sure want to cancel this order",
      type: "info",
      html: false,
      buttons: [
        {
          text: "Yes",
          type: "primary",
          onClick: () => {
            cancelOrd(id)
          },
        },
        {
          text: "Close",
          onClick: (bag) => {
            bag.CLOSE_MODAL();
          },
        },
      ],
      closeBackgroundClick: true,
      portalElement: document.querySelector("body"),
      portalOverflowHidden: true,
      textAlign: "center",
      theme: "white",
      onOpen: (bag) => {
        console.log("Modal Opened");
        console.log(bag.PROPERTIES);
      },
      onClose: (bag) => {
        console.log("Modal Closed");
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