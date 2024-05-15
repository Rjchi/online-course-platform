export default {
    apiResourceCart: (cart) => {
        return {
            user:               cart.user,
            total:              cart.total,
            course:             {
                                _id: cart.course._id,
                                slug: cart.course.slug,
                                title: cart.course.title,
                                image: cart.course.image
                                ? process.env.URL_BACKEND + "/api/courses/imagen-course/" + cart.course.image
                                : null,
                                categorie: {
                                    _id: cart.course.categorie._id,
                                    title: cart.course.categorie.title,
                                },
                                price_usd: cart.course.price_usd,
                                price_soles: cart.course.price_soles,
                                },
            discount:           cart.discount,
            subtotal:           cart.subtotal,
            price_unit:         cart.price_unit,
            code_cupon:         cart.code_cupon,
            type_discount:      cart.type_discount,
            code_discount:      cart.code_discount,
            campaing_discount:  cart.campaing_discount,
        }
    }
}