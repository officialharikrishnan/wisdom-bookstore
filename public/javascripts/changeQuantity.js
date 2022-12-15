function changeQuantity(cartId,proId,count){

    $.ajax({
        url:'/change-product-quantity',
        data:{
            cart:cartId,
            product:proId,
            count:count
        },
        method:'post',
        success:(response)=>{
            location.reload();

        }
    })

}
