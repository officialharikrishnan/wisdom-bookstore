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

