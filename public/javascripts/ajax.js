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
