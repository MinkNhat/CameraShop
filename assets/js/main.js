let slideIndex = 1

function app() {    
    loadUser()
    loadCate()
    loadProducts()
    window.onload = loadCart

    // Prevent sự kiện out focus vào search header ( khi click vào item vẫn giữ focus )
    searchHistort.onmousedown = function(e) {
        e.preventDefault()
    }
}

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n)
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n)
}

// Xem ảnh chi tiết
function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("image-slides")
  let dots = document.getElementsByClassName("dot")
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}


// Xử lý sắp xếp theo giá 
document.addEventListener("DOMContentLoaded", function () {
    const priceFilterLinks = document.querySelectorAll(".home-filter__price-link")

    priceFilterLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault()

            let sortOrder = this.innerText.includes("tăng") ? "asc" : "desc"

            const url = new URL(window.location.href)
            url.searchParams.set("sort", sortOrder)
            url.searchParams.set("page", 1)
            window.history.pushState({}, "", url)

            loadProducts(1)
        })
    })
})


// Xử lý tìm kiếm 
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".header__search-input")
    const searchButton = document.querySelector(".header__search-btn")
    const searchHistoryList = document.querySelector(".js-search-history")

    // Load lịch sử tìm kiếm từ sessionStorage khi trang load
    function loadSearchHistory() {
        let history = JSON.parse(sessionStorage.getItem("searchHistory")) || []
        searchHistoryList.innerHTML = history.map(q => 
            `<li class="header__search-history-item">
                <a href="?q=${encodeURIComponent(q)}">${q}</a>
            </li>`
        ).join("")
    }

    // Thêm từ khóa vào lịch sử và cập nhật giao diện
    function addToSearchHistory(query) {
        let history = JSON.parse(sessionStorage.getItem("searchHistory")) || []
        if (!history.includes(query)) {
            history.unshift(query)
            if (history.length > 5) history.pop() // Giữ tối đa 5 từ khóa
            sessionStorage.setItem("searchHistory", JSON.stringify(history))
        }
        loadSearchHistory()
    }

    function handleSearch() {
        let query = searchInput.value.trim()
        if (query) {
            const url = new URL(window.location.href)
            url.searchParams.set("q", query)

            // Xoá cate và subcate khỏi URL để tìm kiếm trên tất cả sản phẩm
            url.searchParams.delete("cate")
            url.searchParams.delete("subcate")

            window.history.pushState({}, "", url)
            addToSearchHistory(query)
            loadProducts(1)

            searchInput.blur()

        }
    }

    // Xử lý khi bấm nút Search
    searchButton.addEventListener("click", handleSearch)

    // Xử lý khi ấn Enter trong ô input
    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
        event.preventDefault()
        handleSearch() 
        }
    })

    loadSearchHistory()
})






async function loadUser() {
    try {
        const token = localStorage.getItem('access_token')
        if(token) {
            let res = await fetch(`${BASE_URL}/users/current-user/`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                // body: JSON.stringify()
            })
    
            let data = await res.json()
            if(data.id) {
                if(data.avatar!=='')
                    document.querySelector('.header__navbar-user-img').src = data?.avatar

                document.querySelector('.header__navbar-user-name').innerText = `${data?.first_name} ${data?.last_name}`
        
                // chuyển status login
                loginContainer.classList.add('js-log-status')
                userInfoContainer.classList.remove('js-log-status')

                let addProductOption = document.querySelector(".js-add-products")
                if (data.is_superuser) {
                    addProductOption.style.display = "block"
                }
            }
        }  
    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        alert("Có lỗi xảy ra khi đăng nhập!");
    }
}


async function loadCate() {
    try {
        let res = await fetch(`${BASE_URL}/categories/`, {
            method: "GET",
        })

        let data = await res.json()
        
        let html = `
            <li class="category__item">
                <a href="?cate=all" class="category__item-link">Tất cả sản phẩm</a>
            </li>
        `
        data.forEach(cate => {
            html += `
                <li class="category__item">
                    <a href="?cate=${cate.id}" class="category__item-link">${cate.name}</a>
            `

            cate.subcategories.forEach(subCate => {
                html += `
                    <ul class="sub-category__list">
                        <li class="sub-category__item">
                            <a href="?cate=${cate.id}&subcate=${subCate.id}" class="sub-category__item-link">${subCate.name}</a>
                        </li> 
                    </ul>
                `
            })
            html += `</li>`
        })

        cateList.innerHTML = html

        document.querySelectorAll(".category__item-link, .sub-category__item-link").forEach(link => {
            link.addEventListener("click", function (event) {
                event.preventDefault()

                // Cập nhật URL mà không load lại trang
                window.history.pushState({}, "", this.href)
                loadProducts()
            })
        })

    } catch (error) {
        console.error("Lỗi khi load category:", error);
    }
}


async function loadProducts(page=1) {
    try {
        //loading
        document.querySelector('.js-products-loading').style.display = "block"
        productsList.innerHTML = ""

        const url = new URL(window.location.href)
        const params = new URLSearchParams(url.search)

        let cate = params.get("cate")
        let subcate = params.get("subcate")
        let sort = params.get("sort")
        let query = params.get("q")

        params.set("page", page)
        window.history.pushState({}, "", url.pathname + "?" + params.toString())

        // Tạo URL 
        let filterUrl = `${BASE_URL}/products/?page=${page}`
        if (cate && cate !== "all") filterUrl += `&cate=${cate}`
        if (subcate) filterUrl += `&subcate=${subcate}`
        if (sort) filterUrl += `&sort=${sort}`
        if (query) filterUrl += `&q=${encodeURIComponent(query)}`

        let res = await fetch(filterUrl, { method: "GET" })
        let data = await res.json();

        if(data.count === 0) {
            productsList.innerHTML = "<div class='none-products'>Không tồn tại sản phẩm</div>"
            return
        }

        var html = data.results.map(product => {
            return `
                <div class="grid__column-2-4 product-item-container">
                    <div class="home-product-item">
                        <div class="home-product-wapper">
                            <div class="home-product-item__img" style="background-image: url(${product.main_image})"></div>
                            <div class="home-product-item__quick-view  js-quick-view-btn">
                                <button onclick="openQuickView(${product.id})" class="home-product-item__quick-view-link">XEM NHANH</button>
                            </div>
                        </div>
                        <div class="home-product-item__name" title="${product.name}">${product.name}</div>
                        <div class="home-product-item__price">
                            ${product.sale > 0? `
                                    <span class="home-product-item__price-old">${FormatDotNumber((product.price*(1+(product.sale/100))).toFixed())}<span>đ</span></span>
                                ` : ""}
                            
                            <span class="home-product-item__price-current">${FormatDotNumber(product.price)}<span>đ</span></span>
                        </div>
                        <div class="home-product-item__action">
                            <div class="home-product-item__like">
                                <i class="home-product-item__like-icon-empty fa-regular fa-heart"></i>
                                <i class="home-product-item__like-icon-fill fa-solid fa-heart"></i>
                            </div>

                            <div class="home-product-item__rating">
                                ${loadStars(product.stars)}
                            </div>

                            <!-- <span class="home-product-item__sold">88 đã bán</span> -->
                        </div>
                        <!-- <div class="home-product-item__origin">
                            <span class="home-product-item__origin-brand">Sony</span>
                            <span class="home-product-item__origin-name">Nhật Bản</span>
                        </div> -->
                        ${product.sale > 0? `
                                <div class="home-product-item__sale-off">
                                    <span class="home-product-item__sale-label">SALE</span>
                                    <span class="home-product-item__sale-percent">${product.sale}%</span>
                                </div>
                            ` : ""}
                        
                        <div class="home-product-item__oder">
                            <button class="home-product-item__oder-btn" 
                                data-product='${JSON.stringify(product)}'
                                onclick="addToCart(this, 1)">
                                MUA SẢN PHẨM
                            </button>
                        </div>
                    </div>
                </div>
            `
        })

        // add pagination container to bottom list
        html.push(`
            <div class="pagination home-product__pagination js-pagination">
                <ul class="pagination__list"></ul>
            </div>    
        `)

        productsList.innerHTML = html.join("")
        loadPages(data.count, page)

        // action like
        const actionsList = document.querySelectorAll('.home-product-item__like')
        for(let i=0; i<actionsList.length; i++) {
            actionsList[i].addEventListener('click', () => {
                actionsList[i].classList.toggle('home-product-item__like-liked')
            })
        }

    } catch (error) {
        console.error("Lỗi khi load products:", error)
    } finally {
        document.querySelector('.js-products-loading').style.display = "none"
    }
}

function loadStars(stars) {
    let starHTML = ""
    for (let i = 1; i <= 5; i++) {
        if (i <= stars) {
            // Ngôi sao vàng (đã đánh giá)
            starHTML += `<i class="home-product-item__rating-icon home-product-item__rating-icon--active fa-solid fa-star"></i>`
        } else {
            // Ngôi sao xám (chưa đánh giá)
            starHTML += `<i class="home-product-item__rating-icon fa-solid fa-star"></i>`
        }
    }
    return starHTML
}

function loadPages(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / 10)
    let paginationHTML = ""

    if (totalPages > 1) {
        paginationHTML += `<li class="pagination__item">
            <a href="#" class="pagination__item-link" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>
                <i class="fa-solid fa-angle-left"></i>
            </a>
        </li>`

        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<li class="pagination__item ${i === currentPage ? "pagination__item--active" : ""}">
                <a href="#" class="pagination__item-link" data-page="${i}">${i}</a>
            </li>`
        }

        paginationHTML += `<li class="pagination__item">
            <a href="#" class="pagination__item-link" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>
                <i class="fa-solid fa-angle-right"></i>
            </a>
        </li>`
    }

    document.querySelector(".pagination__list").innerHTML = paginationHTML

    // Gắn sự kiện click cho pagination
    document.querySelectorAll(".pagination__item-link").forEach(item => {
        item.addEventListener("click", function (e) {
            e.preventDefault()
            let page = parseInt(this.dataset.page)
            if (!isNaN(page)) loadProducts(page)
        })
    })

    //Cập nhật page ở nav
    document.querySelector('.js-current-page').innerText = currentPage
    document.querySelector('.js-end-page').innerText = totalPages
}

async function openQuickView(productId) {
    // reset slide image
    slideIndex = 1 

    //open quick view
    quickViewModal.style.display = "block";
    document.querySelector('.quick-view-content').style.display = "flex"
    
    // reset content khi open quick view
    quickViewContent.innerHTML = `
        <div class="quick-view-content" style="display: flex">
            <span class="loader quick-view-loader js-quick-view-loader"></span>
        </div>
    `

    //quick view close
    var quickViewOverlay = document.querySelector('.js-quick-view__overlay')
    quickViewOverlay.onclick = function() {
        quickViewModal.style.display = "none"   
        document.querySelector('.quick-view-content').style.display = "none"
    }

    try {
        let res = await fetch(`${BASE_URL}/products/${productId}/`, {
            method: "GET",
        })

        var data = await res.json()
        
        let html = `
            <div class="quick-view-content" style="display: flex">
                <ul class="quick-view__img-list">
                    <div class="slideshow-container">
                        <div class="image-slides fade" style="display:block">
                            <img src="${data.main_image}" class="quick-view__img">
                        </div>
        `

        data.images.forEach(img => {
            html += `
                        <div class="image-slides fade">
                            <img src="${img.image}" class="quick-view__img">
                        </div>
            `
        })        

        html += `
                        <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                        <a class="next" onclick="plusSlides(1)">&#10095;</a>

                        <div style="text-align:center" class="dot-container">
                            <span class="dot active" onclick="currentSlide(1)"></span>
        `

        for(let i=0; i<data.images.length; i++) {
            html += `
                            <span class="dot" onclick="currentSlide(${i+2})"></span>
            `
        }
        // data.images.forEach(img => {
        //     html += `
        //                     <span class="dot" onclick="currentSlide(${i})"></span>
        //     `
        // })               

        html += `
                        </div>
                    </div>
                </ul>

                <div class="quick-view__wapper">
                    <div class="quick-view__heading" title="${data.name}">${data.name}</div>
                    <div class="quick-view__price">
                        ${FormatDotNumber(data.price)}
                        <span class="quick-view__price-tail">đ</span>
                    </div>
                    <table class="quick-view__table">
                        <tr>
                            <th>Tình trạng</th>
                            <td>Đã qua sử dụng (99%)</td>
                        </tr>
                        <tr>
                            <th>Phụ kiện</th>
                            <td>Dây đeo, pin, thẻ nhớ 64GB, bao da</td>
                        </tr>
                        <tr>
                            <th>Bảo hành</th>
                            <td>6 tháng</td>
                        </tr>
                        <tr>
                            <th>Số lượng</th>
                            <td class="quick-view__product-quantity">${data.stock}</td>
                        </tr>
                        <tr>
                            <th>Quà tặng kèm</th>
                            <td>Thẻ nhớ 32GB</td>
                        </tr>
                    </table>
                    <div class="quick-view__quantity">
                        <span class="quick-view__quantity-label">Số lượng: </span>
                        <button class="quick-view__quantity-btn quick-view__quantity-sub">-</button>
                        <input type="number" name="" id="" class="quick-view__quantity-number" value="0">
                        <button class="quick-view__quantity-btn quick-view__quantity-add">+</button>
                    </div>
                    <div class="quick-view__sumary">
                        <span class="quick-view__sumary-label">Thành tiền: </span>
                        <span class="quick-view__sumary-sum">0<span class="quick-view__price-tail">đ</span></span>
                    </div>
                    <div class="quick-view__add-to-cart">
                        <button class="quick-view__add-btn"
                                data-product='${JSON.stringify(data)}'
                                onclick="addToCart(this, -1)">
                                THÊM VÀO GIỎ HÀNG
                        </button>
                    </div>                    
                </div> 
            </div>
        `
        quickViewContent.innerHTML = html

    } catch (error) {
        console.error("Lỗi khi load category:", error);
    } finally {
        // document.querySelector('.js-quick-view-loader').style.display = "none"
    }

    // Lấy số lượng sản phẩm
    var quantity = Number.parseInt(document.querySelector('.quick-view__product-quantity').innerText)

    // Xử lý nút tăng số lượng khi chọn sản phẩm
    var addBtn = document.querySelector('.quick-view__quantity-add')
    addBtn.onclick = function() {
        var inputQuantity = document.querySelector('.quick-view__quantity-number')
        var num = Number.parseInt(inputQuantity.value)
        if(num < quantity) {
            num += 1
            inputQuantity.value = num

            document.querySelector('.quick-view__sumary-sum').innerHTML = FormatDotNumber(Number.parseFloat(data.price) * Number.parseFloat(inputQuantity.value)) + '<span class="quick-view__price-tail">đ</span>'
        } else {
            alert("Số lượng không hợp lệ!!!")
        }
    }

    // Xử lý nút giảm số lượng khi chọn sản phẩm
    var subBtn = document.querySelector('.quick-view__quantity-sub')
    subBtn.onclick = function() {
        var inputQuantity = document.querySelector('.quick-view__quantity-number')
        var num = Number.parseInt(inputQuantity.value)
        if(num > 0 && num <= quantity) {
            num -= 1
            inputQuantity.value = num

            document.querySelector('.quick-view__sumary-sum').innerHTML = FormatDotNumber(Number.parseFloat(data.price) * Number.parseFloat(inputQuantity.value)) + '<span class="quick-view__price-tail">đ</span>'
        } else {
            alert("Số lượng không hợp lệ!!!")
        }
    }

    showSlides(slideIndex)
}


function addToCart(button, quantity) {
    if(quantity === -1) {
        quantity = parseInt(document.querySelector('.quick-view__quantity-number').value)
    }

    if(quantity === 0) {
        alert("Số lượng không hợp lệ!!!")
        return;
    }

    let product = JSON.parse(button.getAttribute("data-product"))

    if (typeof product === "string") {
        product = JSON.parse(product) 
    }

    if(product.stock < quantity) {
        alert("Sản phẩm hiện không còn đủ số lượng hoặc đã hết hàng!")
        return;
    }

    let cart = JSON.parse(sessionStorage.getItem("cart")) || []

    let existingProduct = cart.find(item => item.id === product.id)

    if (existingProduct) {
        if(existingProduct.quantity + quantity <= existingProduct.stock)
            existingProduct.quantity += quantity
        else 
            alert("Sản phẩm hiện không còn đủ số lượng hoặc đã hết hàng!")
    } else {
        cart.push({
            id: product.id,
            image: product.main_image,
            name: product.name,
            price: product.price,
            stock: product.stock,
            quantity: quantity
        })
    }

    sessionStorage.setItem("cart", JSON.stringify(cart))
    loadCart()
}


function loadCart() {
    let cart = JSON.parse(sessionStorage.getItem("cart")) || []
    let cartList = document.querySelector(".header__cart-list")

    cartList.innerHTML = ""

    if (cart.length === 0) {
        cartList.innerHTML = `
            <img class="header__cart-img-nocart" src="./assets/img/no-cart.png" alt="">                       
            <span class="header__cart-label-nocart">Chưa có sản phẩm</span>
        `
        document.querySelector('.header__cart-notice').innerText = cart.length
        return
    }

    let cartHtml = `
        <div class="header__cart-heading">Sản phẩm đã thêm</div>
        <ul class="header__cart-list-item">
    `

    cart.forEach(item => {
        cartHtml += `
            <li class="header__cart-item">
                <img src="${item.image}" alt="" class="header__cart-img">
                <div class="header__cart-info">
                    <div class="header__cart-head">
                        <span class="header__cart-name">${item.name}</span>
                        <span class="header__cart-price-wrap">
                            <div class="header__cart-price-container">
                                <span class="header__cart-price">${FormatDotNumber(item.price)}</span>
                                <span class="header__cart-mul">x</span>
                                <span class="header__cart-quantity">${item.quantity}</span>
                            </div>
                            <span class="header__cart-remove" onclick="removeFromCart(${item.id})">Xoá</span>
                        </span>
                    </div>
                    
                </div>
            </li>
        `
    })

    cartHtml += `</ul><div class="header__cart-view-cart"><a href="">Xem chi tiết giỏ hàng</a></div>`
    cartList.innerHTML = cartHtml

    document.querySelector('.header__cart-notice').innerText = cart.length
}


function removeFromCart(productId) {
    let cart = JSON.parse(sessionStorage.getItem("cart")) || []
    cart = cart.filter(item => item.id !== productId)
    sessionStorage.setItem("cart", JSON.stringify(cart))
    loadCart()
}





// Format chữ số hiển thị giá ( thêm dấu "." ngăn cách các hàng chữ số )
function FormatDotNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

app()











// Hàm render products từ api, sau đó nhận sự kiện click vào nút "xem nhanh" trên từng sản phẩm
// function renderProducts() {
//     fetch('http://localhost:3000/products')
//     .then(response => response.json())
//     .then(function(data){
//         var html = data.map(function(product){
//             return `
//                 <div class="grid__column-2-4 product-item-container">
//                     <div class="home-product-item">
//                         <div class="home-product-wapper">
//                             <div class="home-product-item__img" style="background-image: url(${product.imgThump})"></div>
//                             <div class="home-product-item__quick-view  js-quick-view-btn">
//                                 <span class="home-product-item__quick-view-link">XEM NHANH</span>
//                             </div>
//                         </div>
//                         <div class="home-product-item__name">${product.name}</div>
//                         <div class="home-product-item__price">
//                             <span class="home-product-item__price-old">${FormatDotNumber((product.price*1.1).toFixed())}<span>đ</span></span>
//                             <span class="home-product-item__price-current">${FormatDotNumber(product.price)}<span>đ</span></span>
//                         </div>
//                         <div class="home-product-item__action">
//                             <div class="home-product-item__like home-product-item__like-liked">
//                                 <i class="home-product-item__like-icon-empty fa-regular fa-heart"></i>
//                                 <i class="home-product-item__like-icon-fill fa-solid fa-heart"></i>
//                             </div>

//                             <div class="home-product-item__rating">
//                                 <i class="home-product-item__rating-icon home-product-item__rating-icon--active fa-solid fa-star"></i>
//                                 <i class="home-product-item__rating-icon home-product-item__rating-icon--active fa-solid fa-star"></i>
//                                 <i class="home-product-item__rating-icon home-product-item__rating-icon--active fa-solid fa-star"></i>
//                                 <i class="home-product-item__rating-icon home-product-item__rating-icon--active fa-solid fa-star"></i>
//                                 <i class="home-product-item__rating-icon fa-solid fa-star"></i>
//                             </div>

//                             <!-- <span class="home-product-item__sold">88 đã bán</span> -->
//                         </div>
//                         <!-- <div class="home-product-item__origin">
//                             <span class="home-product-item__origin-brand">Sony</span>
//                             <span class="home-product-item__origin-name">Nhật Bản</span>
//                         </div> -->
//                         <div class="home-product-item__sale-off">
//                             <span class="home-product-item__sale-label">SALE</span>
//                             <span class="home-product-item__sale-percent">10%</span>
//                         </div>
//                         <div class="home-product-item__oder">
//                             <button class="home-product-item__oder-btn">ĐẶT HÀNG NGAY</button>
//                         </div>
//                     </div>
//                 </div>
//             `
//         })
//         productsList.innerHTML = html.join("") 
//         return data
//     })
//     .then(clickQuickView)
// }

// // Xử lý khi click vào nút "xem nhanh" ở từng sản phẩm.
// // Lưu ý: sau khi render mới xử lý ( do sau khi render mới có sản phẩm )
// function clickQuickView(data) {
//     var quickViewBtn = document.querySelectorAll('.js-quick-view-btn')
//     var productChildList = Array.from(productsList.children)

//     for(var i=0; i<quickViewBtn.length; i++) {
//         quickViewBtn[i].onclick = function(e) {
//             var indx = productChildList.indexOf(e.target.closest('.product-item-container'))

//             loadQuickView(data[indx])
//             e.preventDefault()
//             quickViewModal.style.display = "block";
//             document.querySelector('.quick-view-content').style.display = "flex"
//             // manageProduct.style.display = "none"

//             //quick view close
//             var quickViewOverlay = document.querySelector('.js-quick-view__overlay')
//             quickViewOverlay.onclick = function() {
//                 quickViewModal.style.display = "none"   
//                 document.querySelector('.quick-view-content').style.display = "none"
//             }

//             // Lấy số lượng sản phẩm
//             var quantity = Number.parseInt(document.querySelector('.quick-view__product-quantity').innerText)

//             // Xử lý nút tăng số lượng khi chọn sản phẩm
//             var addBtn = document.querySelector('.quick-view__quantity-add')
//             addBtn.onclick = function() {
//                 var inputQuantity = document.querySelector('.quick-view__quantity-number')
//                 var num = Number.parseInt(inputQuantity.value)
//                 if(num < quantity) {
//                     num += 1
//                     inputQuantity.value = num
//                 } else {
//                     alert("Số lượng không hợp lệ!!!")
//                 }
//             }

//             // Xử lý nút giảm số lượng khi chọn sản phẩm
//             var subBtn = document.querySelector('.quick-view__quantity-sub')
//             subBtn.onclick = function() {
//                 var inputQuantity = document.querySelector('.quick-view__quantity-number')
//                 var num = Number.parseInt(inputQuantity.value)
//                 if(num > 0 && num <= quantity) {
//                     num -= 1
//                     inputQuantity.value = num
//                 } else {
//                     alert("Số lượng không hợp lệ!!!")
//                 }
//             }
//         }
//     }
// }


// function loadQuickView(product) {
//     var html = `
//         <div class="quick-view-content">
//             <ul class="quick-view__img-list">
//                 <li class="quick-view__img-item  quick-view__img-item--active">
//                     <img src="${product.imgThump}" alt="" class="quick-view__img">
//                 </li>
//             </ul>
//             <div class="quick-view__wapper">
//                 <div class="quick-view__heading">${product.name}</div>
//                 <div class="quick-view__price">
//                     ${FormatDotNumber(product.price)}
//                     <span class="quick-view__price-tail">đ</span>
//                 </div>
//                 <table class="quick-view__table">
//                     <tr>
//                         <th>Tình trạng</th>
//                         <td>${product.state}</td>
//                     </tr>
//                     <tr>
//                         <th>Phụ kiện</th>
//                         <td>${product.accessories}</td>
//                     </tr>
//                     <tr>
//                         <th>Bảo hành</th>
//                         <td>${product.warranty}</td>
//                     </tr>
//                     <tr>
//                         <th>Số lượng</th>
//                         <td class="quick-view__product-quantity">${product.quantity}</td>
//                     </tr>
//                 </table>
//                 <div class="quick-view__quantity">
//                     <span class="quick-view__quantity-label">Số lượng: </span>
//                     <button class="quick-view__quantity-btn quick-view__quantity-sub">-</button>
//                     <input type="number" name="" id="" class="quick-view__quantity-number" value="0">
//                     <button class="quick-view__quantity-btn quick-view__quantity-add">+</button>
//                 </div>
//                 <div class="quick-view__sumary">
//                     <span class="quick-view__sumary-label">Thành tiền: </span>
//                     <span class="quick-view__sumary-sum">${0}<span class="quick-view__price-tail">đ</span></span>
//                 </div>
//                 <div class="quick-view__add-to-cart">
//                     <button class="quick-view__add-btn">THÊM VÀO GIỎ HÀNG</button>
//                 </div>
//             </div>
//         </div>
//     `

//     document.querySelector('.quick-view').innerHTML = html 
// }




